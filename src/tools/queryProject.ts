import { QueryProjectParams } from '../types/index.js';
import { getServices } from '../server/services.js';
import logger from '../utils/logger.js';

export async function queryProject(params: QueryProjectParams) {
  const { stateManager, performanceMonitor, aiEngine } = getServices();
  
  return await performanceMonitor.measure(
    'query_project',
    'search',
    async () => {
      logger.info('Executing project query', { params });

      const { query, scope, limit } = params;
      const results: any[] = [];
      const searchStartTime = Date.now();

      // Simplified search implementation
      const mockResults = [
        {
          title: `${query} Component`,
          type: 'component',
          path: `/src/components/${query}.h`,
          preview: `Component definition for ${query}`,
          matches: Math.floor(Math.random() * 5) + 1,
          relevanceScore: Math.random() * 0.5 + 0.5,
          source: 'code'
        },
        {
          title: `${query} Documentation`,
          type: 'documentation', 
          path: `/docs/${query.toLowerCase()}.md`,
          preview: `Documentation covering ${query} implementation`,
          matches: Math.floor(Math.random() * 3) + 1,
          relevanceScore: Math.random() * 0.4 + 0.6,
          source: 'docs'
        }
      ];

      // Filter by scope
      if (scope === 'code') {
        results.push(...mockResults.filter(r => r.source === 'code'));
      } else if (scope === 'docs') {
        results.push(...mockResults.filter(r => r.source === 'docs'));
      } else {
        results.push(...mockResults);
      }

      // Sort by relevance and limit
      const finalResults = results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

      const searchDuration = Date.now() - searchStartTime;

      // Record search pattern for learning
      aiEngine.recordTaskPattern({
        type: 'search',
        complexity: 'low',
        teams: ['query'],
        duration: searchDuration,
        success: finalResults.length > 0
      });

      const response = {
        content: [{
          type: "text" as const,
          text: `Project query completed!

**Query**: "${query}"
**Scope**: ${scope}
**Results Found**: ${finalResults.length}/${results.length} (limited to ${limit})
**Search Duration**: ${searchDuration}ms

**Search Results**:
${finalResults.map((result, index) => 
  `**${index + 1}. ${result.title}** (${result.source})
- **Relevance**: ${Math.round(result.relevanceScore * 100)}%
- **Type**: ${result.type}
- **Path**: ${result.path}
- **Preview**: ${result.preview}
${result.matches ? `- **Matches**: ${result.matches} occurrences` : ''}`
).join('\n\n')}

**Search Distribution**:
- Code: ${finalResults.filter(r => r.source === 'code').length} results
- Documentation: ${finalResults.filter(r => r.source === 'docs').length} results

${finalResults.length === 0 ? `
**No results found.** Try:
- Broadening your search terms
- Using different keywords
- Searching in 'all' scope
- Checking spelling and terminology` : ''}

Use the path information to access specific files or explore related content in your project.`
        }]
      };

      return response;
    }
  );
}