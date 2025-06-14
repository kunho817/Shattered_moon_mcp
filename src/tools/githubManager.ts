import { GitHubManagerParams } from '../types/index.js';
import { getServices } from '../server/services.js';
import logger from '../utils/logger.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

interface GitConfig {
  useHttps: boolean;
  remoteUrl?: string;
  branch?: string;
  username?: string;
  token?: string;
}

export async function githubManager(params: GitHubManagerParams) {
  const { stateManager, performanceMonitor } = getServices();
  
  return await performanceMonitor.measure(
    'github_manager',
    'execute',
    async () => {
      logger.info('Executing GitHub manager', { params });

      const { action, data } = params;
      let result: any = {};
      const timestamp = new Date().toISOString();

      try {
        // Initialize Git configuration
        const gitConfig = await getGitConfig();
        
        switch (action) {
          case 'commit':
            result = await handleCommit(data, gitConfig);
            break;
          case 'push':
            result = await handlePush(data, gitConfig);
            break;
          case 'pull':
            result = await handlePull(data, gitConfig);
            break;
          case 'pr':
            result = await handlePullRequest(data, gitConfig);
            break;
          case 'issue':
            result = await handleIssue(data, gitConfig);
            break;
          case 'status':
            result = await handleStatus(gitConfig);
            break;
          case 'branch':
            result = await handleBranch(data, gitConfig);
            break;
          case 'tag':
            result = await handleTag(data, gitConfig);
            break;
          case 'release':
            result = await handleRelease(data, gitConfig);
            break;
          case 'workflow':
            result = await handleWorkflow(data, gitConfig);
            break;
          default:
            throw new Error(`Unsupported GitHub action: ${action}`);
        }

        // Record GitHub pattern for learning
          type: 'github_operation',
          complexity: getOperationComplexity(action),
          teams: ['devops'],
          duration: result.duration || 1000,
          success: true
        });

        // Record successful operation in AI engine for learning
          type: 'github_operation_success',
          complexity: getOperationComplexity(action),
          teams: ['devops'],
          duration: result.duration || 1000,
          success: true
        });

      } catch (error: any) {
        logger.error('GitHub operation failed', { action, error: error.message });
        result = {
          success: false,
          error: error.message,
          suggestions: generateSuggestions(error.message)
        };
      }

      const response = {
        content: [{
          type: "text" as const,
          text: formatGitHubResponse(action, result, timestamp)
        }]
      };

      return response;
    }
  );
}

async function getGitConfig(): Promise<GitConfig> {
  const config: GitConfig = {
    useHttps: true
  };

  try {
    // Get current remote URL
    const { stdout: remoteUrl } = await execAsync('git remote get-url origin');
    config.remoteUrl = remoteUrl.trim();
    
    // Get current branch
    const { stdout: branch } = await execAsync('git branch --show-current');
    config.branch = branch.trim();
    
    // Check for GitHub token in environment
    config.token = process.env.GITHUB_TOKEN;
    
    // Get git username
    const { stdout: username } = await execAsync('git config user.name');
    config.username = username.trim();
    
  } catch (error) {
    logger.warn('Could not get complete git config', { error });
  }

  return config;
}

async function executeGitCommand(command: string, useHttps: boolean = true): Promise<any> {
  try {
    logger.debug(`Executing git command: ${command}`);
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('warning')) {
      throw new Error(stderr);
    }
    
    return { success: true, output: stdout };
  } catch (error: any) {
    // If HTTPS fails, try SSH
    if (useHttps && error.message.includes('Authentication failed')) {
      logger.info('HTTPS authentication failed, switching to SSH');
      
      try {
        // Change remote URL to SSH
        await execAsync('git remote set-url origin $(git remote get-url origin | sed "s/https:\\/\\/github.com\\//git@github.com:/")')
        
        // Retry command
        const { stdout, stderr } = await execAsync(command);
        
        // Change back to HTTPS for future operations
        await execAsync('git remote set-url origin $(git remote get-url origin | sed "s/git@github.com:/https:\\/\\/github.com\\//")')
        
        return { success: true, output: stdout, usedSSH: true };
      } catch (sshError: any) {
        throw new Error(`Both HTTPS and SSH failed: ${sshError.message}`);
      }
    }
    
    throw error;
  }
}

async function handleCommit(data: any, config: GitConfig): Promise<any> {
  const startTime = Date.now();
  const message = data.message || 'Automated commit via MCP';
  const files = data.files || '.';
  
  try {
    // Add files
    await executeGitCommand(`git add ${files}`);
    
    // Create commit
    const { output } = await executeGitCommand(`git commit -m "${message}"`);
    
    // Get commit hash
    const { output: commitHash } = await executeGitCommand('git rev-parse HEAD');
    
    // Get diff stats
    const { output: stats } = await executeGitCommand('git diff HEAD~1 --stat');
    
    const duration = Date.now() - startTime;
    
    // Parse stats
    const statsMatch = stats.match(/(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/);
    const filesChanged = statsMatch ? parseInt(statsMatch[1]) : 0;
    const linesAdded = statsMatch && statsMatch[2] ? parseInt(statsMatch[2]) : 0;
    const linesRemoved = statsMatch && statsMatch[3] ? parseInt(statsMatch[3]) : 0;
    
    return {
      success: true,
      commitHash: commitHash.trim().substring(0, 8),
      message,
      branch: config.branch,
      filesChanged,
      linesAdded,
      linesRemoved,
      duration
    };
  } catch (error: any) {
    throw new Error(`Commit failed: ${error.message}`);
  }
}

async function handlePush(data: any, config: GitConfig): Promise<any> {
  const startTime = Date.now();
  const branch = data.branch || config.branch || 'main';
  const force = data.force || false;
  const remote = data.remote || 'origin';
  
  try {
    const pushCommand = `git push ${remote} ${branch}${force ? ' --force' : ''}`;
    const { output, usedSSH } = await executeGitCommand(pushCommand, config.useHttps);
    
    const duration = Date.now() - startTime;
    
    // Count pushed commits
    const { output: logOutput } = await executeGitCommand(`git log ${remote}/${branch}..${branch} --oneline`);
    const pushedCommits = logOutput.trim().split('\n').filter((line: string) => line).length;
    
    return {
      success: true,
      branch,
      remote,
      pushedCommits,
      duration,
      branchInfo: `${remote}/${branch}`,
      authMethod: usedSSH ? 'SSH' : 'HTTPS',
      nextSteps: pushedCommits > 0 ? [
        'Consider creating a pull request',
        'Monitor CI/CD pipeline',
        'Notify team members of changes'
      ] : []
    };
  } catch (error: any) {
    throw new Error(`Push failed: ${error.message}`);
  }
}

async function handlePull(data: any, config: GitConfig): Promise<any> {
  const startTime = Date.now();
  const branch = data.branch || config.branch || 'main';
  const remote = data.remote || 'origin';
  const rebase = data.rebase || false;
  
  try {
    // Fetch first
    await executeGitCommand(`git fetch ${remote}`);
    
    // Check for new commits
    const { output: ahead } = await executeGitCommand(`git rev-list ${branch}..${remote}/${branch} --count`);
    const newCommits = parseInt(ahead.trim()) || 0;
    
    if (newCommits === 0) {
      return {
        success: true,
        branch,
        remote,
        newCommits: 0,
        filesChanged: 0,
        duration: Date.now() - startTime,
        message: 'Already up to date'
      };
    }
    
    // Pull changes
    const pullCommand = `git pull ${remote} ${branch}${rebase ? ' --rebase' : ''}`;
    const { output, usedSSH } = await executeGitCommand(pullCommand, config.useHttps);
    
    // Check for conflicts
    const { stdout: statusOutput } = await execAsync('git status --porcelain');
    const conflicts = statusOutput.split('\n')
      .filter(line => line.startsWith('UU'))
      .map(line => line.substring(3).trim());
    
    // Get changed files count
    const { output: diffStat } = await executeGitCommand(`git diff HEAD~${newCommits} --stat`);
    const filesChanged = (diffStat.match(/\n/g) || []).length - 1;
    
    const duration = Date.now() - startTime;
    
    return {
      success: conflicts.length === 0,
      branch,
      remote,
      newCommits,
      filesChanged,
      duration,
      conflicts,
      authMethod: usedSSH ? 'SSH' : 'HTTPS',
      warnings: conflicts.length > 0 ? ['Merge conflicts detected - manual resolution required'] : []
    };
  } catch (error: any) {
    throw new Error(`Pull failed: ${error.message}`);
  }
}

async function handlePullRequest(data: any, config: GitConfig): Promise<any> {
  const startTime = Date.now();
  const title = data.title || 'Automated Pull Request';
  const body = data.body || 'Generated via MCP system';
  const branch = data.branch || config.branch || 'feature/mcp-changes';
  const baseBranch = data.baseBranch || 'main';
  
  try {
    // Check if gh CLI is available
    try {
      await execAsync('which gh');
    } catch {
      // Use GitHub API directly
      if (!config.token) {
        throw new Error('GitHub token required for PR creation. Set GITHUB_TOKEN environment variable.');
      }
      
      // Extract owner/repo from remote URL
      const repoMatch = config.remoteUrl?.match(/github\.com[:/]([^/]+)\/([^.]+)/);
      if (!repoMatch) {
        throw new Error('Could not parse repository information from remote URL');
      }
      
      const [, owner, repo] = repoMatch;
      
      // Create PR using GitHub API
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          body,
          head: branch,
          base: baseBranch
        })
      });
      
      if (!response.ok) {
        const error = await response.json() as any;
        throw new Error(error.message || 'Failed to create PR');
      }
      
      const pr = await response.json() as any;
      
      return {
        success: true,
        prNumber: pr.number,
        title: pr.title,
        body: pr.body,
        branch,
        baseBranch,
        url: pr.html_url,
        duration: Date.now() - startTime,
        checksRequired: ['CI', 'Code Quality', 'Security Scan'],
        nextSteps: [
          'Wait for automated checks to complete',
          'Request code review from team members',
          'Monitor PR status and respond to feedback'
        ]
      };
    }
    
    // Use gh CLI
    const { stdout: output } = await execAsync(
      `gh pr create --title "${title}" --body "${body}" --base ${baseBranch} --head ${branch}`
    );
    
    const prUrlMatch = output.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/(\d+)/);
    const prNumber = prUrlMatch ? prUrlMatch[1] : 'unknown';
    
    return {
      success: true,
      prNumber,
      title,
      body,
      branch,
      baseBranch,
      url: prUrlMatch ? prUrlMatch[0] : 'PR created successfully',
      duration: Date.now() - startTime,
      checksRequired: ['CI', 'Code Quality', 'Security Scan'],
      nextSteps: [
        'Wait for automated checks to complete',
        'Request code review from team members',
        'Monitor PR status and respond to feedback'
      ]
    };
  } catch (error: any) {
    throw new Error(`PR creation failed: ${error.message}`);
  }
}

async function handleIssue(data: any, config: GitConfig): Promise<any> {
  const startTime = Date.now();
  const title = data.title || 'Issue created via MCP';
  const body = data.body || 'Automatically generated issue';
  const labels = data.labels || ['enhancement'];
  
  try {
    // Check if gh CLI is available
    try {
      await execAsync('which gh');
      
      // Use gh CLI
      const labelFlag = labels.length > 0 ? `--label ${labels.join(',')}` : '';
      const { stdout: output } = await execAsync(
        `gh issue create --title "${title}" --body "${body}" ${labelFlag}`
      );
      
      const issueUrlMatch = output.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/issues\/(\d+)/);
      const issueNumber = issueUrlMatch ? issueUrlMatch[1] : 'unknown';
      
      return {
        success: true,
        issueNumber,
        title,
        body,
        url: issueUrlMatch ? issueUrlMatch[0] : 'Issue created successfully',
        labels,
        duration: Date.now() - startTime,
        nextSteps: [
          'Triage the issue for priority and severity',
          'Assign to appropriate team member',
          'Add to project board or milestone'
        ]
      };
    } catch {
      // Use GitHub API
      if (!config.token) {
        throw new Error('GitHub token required for issue creation. Set GITHUB_TOKEN environment variable.');
      }
      
      const repoMatch = config.remoteUrl?.match(/github\.com[:/]([^/]+)\/([^.]+)/);
      if (!repoMatch) {
        throw new Error('Could not parse repository information');
      }
      
      const [, owner, repo] = repoMatch;
      
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, body, labels })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create issue via API');
      }
      
      const issue = await response.json() as any;
      
      return {
        success: true,
        issueNumber: issue.number,
        title: issue.title,
        body: issue.body,
        url: issue.html_url,
        labels: issue.labels.map((l: any) => l.name),
        duration: Date.now() - startTime,
        nextSteps: [
          'Triage the issue for priority and severity',
          'Assign to appropriate team member',
          'Add to project board or milestone'
        ]
      };
    }
  } catch (error: any) {
    throw new Error(`Issue creation failed: ${error.message}`);
  }
}

async function handleStatus(config: GitConfig): Promise<any> {
  const startTime = Date.now();
  
  try {
    const { stdout: statusOutput } = await execAsync('git status --porcelain');
    const { stdout: branchInfo } = await execAsync('git status -sb');
    const { stdout: lastCommit } = await execAsync('git log -1 --oneline');
    
    const modifiedFiles = statusOutput.split('\n').filter((line: string) => line.trim()).length;
    const hasChanges = modifiedFiles > 0;
    
    // Parse branch tracking info
    const trackingMatch = branchInfo.match(/## (.+)\.\.\.(.+) \[(.+)\]/);
    const ahead = trackingMatch ? (trackingMatch[3].match(/ahead (\d+)/) || [0, 0])[1] : 0;
    const behind = trackingMatch ? (trackingMatch[3].match(/behind (\d+)/) || [0, 0])[1] : 0;
    
    return {
      success: true,
      branch: config.branch,
      modifiedFiles,
      hasChanges,
      lastCommit: lastCommit.trim(),
      ahead: parseInt(ahead as string),
      behind: parseInt(behind as string),
      duration: Date.now() - startTime,
      suggestions: hasChanges ? [
        'Commit your changes before switching branches',
        'Use git stash to temporarily save changes'
      ] : []
    };
  } catch (error: any) {
    throw new Error(`Status check failed: ${error.message}`);
  }
}

async function handleBranch(data: any, config: GitConfig): Promise<any> {
  const startTime = Date.now();
  const action = data.action || 'list';
  const branchName = data.name;
  
  try {
    switch (action) {
      case 'create':
        if (!branchName) throw new Error('Branch name required');
        await execAsync(`git checkout -b ${branchName}`);
        return {
          success: true,
          action: 'created',
          branch: branchName,
          duration: Date.now() - startTime
        };
        
      case 'delete':
        if (!branchName) throw new Error('Branch name required');
        await execAsync(`git branch -d ${branchName}`);
        return {
          success: true,
          action: 'deleted',
          branch: branchName,
          duration: Date.now() - startTime
        };
        
      case 'checkout':
        if (!branchName) throw new Error('Branch name required');
        await execAsync(`git checkout ${branchName}`);
        return {
          success: true,
          action: 'switched',
          branch: branchName,
          duration: Date.now() - startTime
        };
        
      case 'list':
      default:
        const { stdout: output } = await execAsync('git branch -a');
        const branches = output.split('\n')
          .map((b: string) => b.trim())
          .filter((b: string) => b)
          .map((b: string) => ({
            name: b.replace(/^\* /, '').replace(/^remotes\//, ''),
            current: b.startsWith('* '),
            remote: b.includes('remotes/')
          }));
          
        return {
          success: true,
          branches,
          currentBranch: branches.find((b: any) => b.current)?.name,
          duration: Date.now() - startTime
        };
    }
  } catch (error: any) {
    throw new Error(`Branch operation failed: ${error.message}`);
  }
}

async function handleTag(data: any, config: GitConfig): Promise<any> {
  const startTime = Date.now();
  const tagName = data.name;
  const message = data.message || `Release ${tagName}`;
  const push = data.push !== false;
  
  try {
    if (!tagName) {
      // List tags
      const { stdout: output } = await execAsync('git tag -l --sort=-creatordate');
      const tags = output.split('\n').filter((t: string) => t.trim()).slice(0, 10);
      
      return {
        success: true,
        action: 'list',
        tags,
        duration: Date.now() - startTime
      };
    }
    
    // Create tag
    await execAsync(`git tag -a ${tagName} -m "${message}"`);
    
    if (push) {
      await executeGitCommand(`git push origin ${tagName}`, config.useHttps);
    }
    
    return {
      success: true,
      action: 'created',
      tagName,
      message,
      pushed: push,
      duration: Date.now() - startTime,
      nextSteps: [
        'Create GitHub release from this tag',
        'Update changelog',
        'Notify team of new release'
      ]
    };
  } catch (error: any) {
    throw new Error(`Tag operation failed: ${error.message}`);
  }
}

async function handleRelease(data: any, config: GitConfig): Promise<any> {
  const startTime = Date.now();
  const tagName = data.tag;
  const title = data.title || tagName;
  const notes = data.notes || 'Release notes';
  const draft = data.draft || false;
  const prerelease = data.prerelease || false;
  
  try {
    // Create release using gh CLI or API
    try {
      await execAsync('which gh');
      
      const flags = [
        draft ? '--draft' : '',
        prerelease ? '--prerelease' : ''
      ].filter(f => f).join(' ');
      
      const { stdout: output } = await execAsync(
        `gh release create ${tagName} --title "${title}" --notes "${notes}" ${flags}`
      );
      
      const releaseUrl = output.match(/https:\/\/github\.com\/[^\s]+/)?.[0];
      
      return {
        success: true,
        tagName,
        title,
        url: releaseUrl || 'Release created successfully',
        draft,
        prerelease,
        duration: Date.now() - startTime,
        nextSteps: [
          'Attach binary artifacts if needed',
          'Announce release to users',
          'Update documentation'
        ]
      };
    } catch {
      throw new Error('GitHub CLI (gh) required for release creation');
    }
  } catch (error: any) {
    throw new Error(`Release creation failed: ${error.message}`);
  }
}

async function handleWorkflow(data: any, config: GitConfig): Promise<any> {
  const startTime = Date.now();
  const action = data.action || 'list';
  const workflowName = data.workflow;
  
  try {
    // Check if gh CLI is available
    await execAsync('which gh');
    
    switch (action) {
      case 'run':
        if (!workflowName) throw new Error('Workflow name required');
        const { stdout: runOutput } = await execAsync(
          `gh workflow run ${workflowName}`
        );
        
        return {
          success: true,
          action: 'triggered',
          workflow: workflowName,
          duration: Date.now() - startTime,
          message: 'Workflow triggered successfully'
        };
        
      case 'list':
      default:
        const { stdout: listOutput } = await execAsync('gh workflow list');
        const workflows = listOutput.split('\n')
          .slice(1) // Skip header
          .filter((line: string) => line.trim())
          .map((line: string) => {
            const parts = line.split('\t');
            return {
              name: parts[0]?.trim(),
              state: parts[1]?.trim(),
              id: parts[2]?.trim()
            };
          });
          
        return {
          success: true,
          workflows,
          duration: Date.now() - startTime
        };
    }
  } catch (error: any) {
    throw new Error(`Workflow operation failed: ${error.message}`);
  }
}

function getOperationComplexity(action: string): 'low' | 'medium' | 'high' {
  const complexityMap: Record<string, 'low' | 'medium' | 'high'> = {
    'status': 'low',
    'commit': 'low',
    'pull': 'medium',
    'push': 'medium',
    'branch': 'medium',
    'tag': 'medium',
    'pr': 'high',
    'issue': 'medium',
    'release': 'high',
    'workflow': 'medium'
  };
  
  return complexityMap[action] || 'medium';
}

function generateSuggestions(errorMessage: string): string[] {
  const suggestions: string[] = [];
  
  if (errorMessage.includes('Authentication failed')) {
    suggestions.push(
      'Set up GitHub token: export GITHUB_TOKEN=your_token',
      'Configure SSH keys for GitHub',
      'Check repository permissions'
    );
  }
  
  if (errorMessage.includes('not a git repository')) {
    suggestions.push(
      'Initialize git repository: git init',
      'Clone existing repository',
      'Check current directory'
    );
  }
  
  if (errorMessage.includes('merge conflict')) {
    suggestions.push(
      'Resolve conflicts manually',
      'Use git status to see conflicted files',
      'Consider using git stash before pulling'
    );
  }
  
  if (errorMessage.includes('gh: command not found')) {
    suggestions.push(
      'Install GitHub CLI: https://cli.github.com/',
      'Set GITHUB_TOKEN environment variable for API access',
      'Use web interface for complex operations'
    );
  }
  
  return suggestions.length > 0 ? suggestions : [
    'Check error message for details',
    'Verify git configuration',
    'Ensure you have necessary permissions'
  ];
}

function formatGitHubResponse(action: string, result: any, timestamp: string): string {
  const statusEmoji = result.success ? '✅' : '❌';
  const status = result.success ? 'Success' : 'Failed';
  
  let details = '';
  
  switch (action) {
    case 'commit':
      details = `- Commit Hash: ${result.commitHash}
- Message: "${result.message}"
- Branch: ${result.branch}
- Files Changed: ${result.filesChanged}
- Lines Added: ${result.linesAdded}
- Lines Removed: ${result.linesRemoved}`;
      break;
      
    case 'push':
      details = `- Remote: ${result.remote}
- Branch: ${result.branch}
- Commits Pushed: ${result.pushedCommits}
- Auth Method: ${result.authMethod || 'HTTPS'}`;
      break;
      
    case 'pull':
      details = `- Remote: ${result.remote}
- Branch: ${result.branch}
- New Commits: ${result.newCommits}
- Files Changed: ${result.filesChanged}
- Auth Method: ${result.authMethod || 'HTTPS'}
${result.conflicts?.length > 0 ? `- Conflicts: ${result.conflicts.join(', ')}` : ''}`;
      break;
      
    case 'pr':
      details = `- PR Number: #${result.prNumber}
- Title: "${result.title}"
- Branch: ${result.branch} → ${result.baseBranch}
- URL: ${result.url}`;
      break;
      
    case 'issue':
      details = `- Issue Number: #${result.issueNumber}
- Title: "${result.title}"
- URL: ${result.url}
- Labels: ${result.labels?.join(', ') || 'None'}`;
      break;
      
    case 'status':
      details = `- Branch: ${result.branch}
- Modified Files: ${result.modifiedFiles}
- Has Changes: ${result.hasChanges ? 'Yes' : 'No'}
- Last Commit: ${result.lastCommit}
- Ahead: ${result.ahead}, Behind: ${result.behind}`;
      break;
      
    case 'branch':
      if (result.branches) {
        const current = result.branches.find((b: any) => b.current);
        details = `- Current Branch: ${current?.name || 'unknown'}
- Total Branches: ${result.branches.length}
- Remote Branches: ${result.branches.filter((b: any) => b.remote).length}`;
      } else {
        details = `- Action: ${result.action}
- Branch: ${result.branch}`;
      }
      break;
      
    case 'tag':
      if (result.tags) {
        details = `- Recent Tags: ${result.tags.slice(0, 5).join(', ')}
- Total Tags Shown: ${result.tags.length}`;
      } else {
        details = `- Tag: ${result.tagName}
- Message: "${result.message}"
- Pushed: ${result.pushed ? 'Yes' : 'No'}`;
      }
      break;
      
    case 'release':
      details = `- Tag: ${result.tagName}
- Title: "${result.title}"
- URL: ${result.url}
- Type: ${result.prerelease ? 'Pre-release' : result.draft ? 'Draft' : 'Release'}`;
      break;
      
    case 'workflow':
      if (result.workflows) {
        details = `- Available Workflows: ${result.workflows.length}
${result.workflows.slice(0, 3).map((w: any) => `  • ${w.name} (${w.state})`).join('\n')}`;
      } else {
        details = `- Workflow: ${result.workflow}
- Action: ${result.action}
- Status: ${result.message}`;
      }
      break;
      
    default:
      details = JSON.stringify(result, null, 2);
  }
  
  return `GitHub operation completed!

**Action**: ${action.toUpperCase()}
**Status**: ${statusEmoji} ${status}
**Timestamp**: ${timestamp}
${result.duration ? `**Duration**: ${result.duration}ms` : ''}

**Operation Details**:
${details}

${result.error ? `**Error**: ${result.error}

` : ''}${result.warnings?.length > 0 ? `**Warnings**:
${result.warnings.map((w: string) => `- ${w}`).join('\n')}

` : ''}${result.suggestions?.length > 0 ? `**Suggestions**:
${result.suggestions.map((s: string) => `- ${s}`).join('\n')}

` : ''}${result.nextSteps?.length > 0 ? `**Next Steps**:
${result.nextSteps.map((step: string) => `- ${step}`).join('\n')}` : ''}

GitHub operation has been ${result.success ? 'completed successfully' : 'attempted with issues'}.`;
}