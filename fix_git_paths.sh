#!/bin/bash

# GitHub Manager에서 모든 git 명령을 절대 경로로 수정하는 스크립트

GITHUB_MANAGER_FILE="/home/aizure0817/Game_Engine/shattered_moon_mcp_ts/src/tools/githubManager.ts"
GIT_REPO_PATH="/home/aizure0817/Game_Engine/shattered_moon_mcp_ts"

echo "Fixing git paths in GitHub Manager..."

# 백업 생성
cp "$GITHUB_MANAGER_FILE" "$GITHUB_MANAGER_FILE.backup"

# 모든 git 명령을 절대 경로로 수정
sed -i "s|await execAsync('git |await execAsync('git --git-dir=$GIT_REPO_PATH/.git --work-tree=$GIT_REPO_PATH |g" "$GITHUB_MANAGER_FILE"
sed -i "s|await execAsync(\"git |await execAsync(\"git --git-dir=$GIT_REPO_PATH/.git --work-tree=$GIT_REPO_PATH |g" "$GITHUB_MANAGER_FILE"
sed -i "s|await execAsync(\`git |await execAsync(\`git --git-dir=$GIT_REPO_PATH/.git --work-tree=$GIT_REPO_PATH |g" "$GITHUB_MANAGER_FILE"

# execAsync 호출에 cwd 옵션 추가
sed -i "s|await execAsync(\([^)]*\));|await execAsync(\1, { cwd: '$GIT_REPO_PATH' });|g" "$GITHUB_MANAGER_FILE"

# 중복된 git-dir 플래그 제거
sed -i "s|git --git-dir=$GIT_REPO_PATH/.git --work-tree=$GIT_REPO_PATH --git-dir=$GIT_REPO_PATH/.git --work-tree=$GIT_REPO_PATH|git --git-dir=$GIT_REPO_PATH/.git --work-tree=$GIT_REPO_PATH|g" "$GITHUB_MANAGER_FILE"

echo "Git paths fixed in GitHub Manager"
echo "Backup saved as: $GITHUB_MANAGER_FILE.backup"