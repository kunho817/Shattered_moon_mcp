"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMetrics = performanceMetrics;
const services_js_1 = require("../server/services.js");
const claudeCodePerformanceMonitor_js_1 = require("../utils/claudeCodePerformanceMonitor.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
async function performanceMetrics(params) {
    const { stateManager, performanceMonitor, aiEngine } = (0, services_js_1.getServices)();
    return await performanceMonitor.measure('performance_metrics', 'analyze', async () => {
        logger_js_1.default.info('Executing performance metrics analysis', { params });
        const { metric, timeRange } = params;
        const analysisTimeRange = timeRange || 1; // Default to 1 hour
        const timestamp = new Date().toISOString();
        let result = {
            timestamp,
            timeRange: analysisTimeRange,
            insights: [],
            recommendations: [],
            alerts: []
        };
        switch (metric) {
            case 'tool':
                result = await analyzeClaudeCodePerformance(analysisTimeRange);
                break;
            case 'overall':
                result = await analyzeOverallPerformance(analysisTimeRange, stateManager);
                break;
            case 'trends':
                result = await analyzeClaudeCodeTrends(analysisTimeRange);
                break;
            case 'recommendations':
                result = await generateClaudeCodeRecommendations(analysisTimeRange);
                break;
            default:
                throw new Error(`Unsupported performance metric: ${metric}`);
        }
        // Record performance analysis pattern
        aiEngine.recordTaskPattern({
            type: 'performance_analysis',
            complexity: 'medium',
            teams: ['performance'],
            duration: 100,
            success: true
        });
        const response = {
            content: [{
                    type: "text",
                    text: `Performance metrics analysis completed!

**Analysis Type**: ${metric.toUpperCase()}
**Time Range**: ${formatTimeRange(analysisTimeRange)}
**Timestamp**: ${timestamp}

${formatPerformanceResult(metric, result)}

**Performance Health Score**: ${Math.round((result.healthScore || 0.85) * 100)}%

**Key Insights**:
${result.insights?.map((insight) => `- ${insight}`).join('\n') || '- System is performing within normal parameters'}

${result.alerts?.length > 0 ? `**Performance Alerts** 🚨:
${result.alerts.map((alert) => `- **${alert.severity}**: ${alert.message} (${alert.metric})`).join('\n')}

` : ''}**Claude Code AI Recommendations**:
${result.recommendations?.map((rec) => `- ${rec}`).join('\n') || '- Continue monitoring performance regularly'}

**Claude Code Performance Summary**:
- Total Requests: ${result.claudeCodeMetrics?.totalRequests || 0}
- Success Rate: ${Math.round((result.claudeCodeMetrics?.successRate || 0) * 100)}%
- Cache Hit Rate: ${Math.round((result.claudeCodeMetrics?.cacheHitRate || 0) * 100)}%

${result.trends?.length > 0 ? `**Performance Trends**:
${result.trends.map((trend) => `- **${trend.metric}**: ${trend.direction} (${trend.change}%)`).join('\n')}

` : ''}Performance analysis completed with detailed insights and actionable recommendations.`
                }]
        };
        return response;
    });
}
async function analyzeClaudeCodePerformance(timeRange) {
    const metrics = claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getPerformanceMetrics(timeRange);
    const modelStats = claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getModelUsageStats(timeRange);
    const alerts = claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getAlerts();
    return {
        timestamp: new Date().toISOString(),
        timeRange,
        claudeCodeMetrics: metrics,
        modelStats,
        toolMetrics: {
            totalExecutions: metrics.totalRequests,
            averageExecutionTime: Math.round(metrics.averageResponseTime),
            slowestModel: modelStats.opus.averageTime > modelStats.sonnet.averageTime ? 'opus' : 'sonnet',
            fastestModel: modelStats.opus.averageTime < modelStats.sonnet.averageTime ? 'opus' : 'sonnet',
            errorRate: metrics.errorRate,
            throughput: Math.round(metrics.totalRequests / timeRange)
        },
        topPerformers: [
            { name: 'sonnet', avgTime: Math.round(modelStats.sonnet.averageTime), executions: modelStats.sonnet.requests },
            { name: 'opus', avgTime: Math.round(modelStats.opus.averageTime), executions: modelStats.opus.requests }
        ],
        bottlenecks: alerts.filter(a => a.type === 'warning' || a.type === 'error'),
        healthScore: Math.max(0.3, metrics.successRate - (metrics.errorRate * 2)),
        insights: [
            `Total Claude Code requests: ${metrics.totalRequests}`,
            `Average response time: ${Math.round(metrics.averageResponseTime)}ms`,
            `Success rate: ${Math.round(metrics.successRate * 100)}%`,
            `Cache hit rate: ${Math.round(metrics.cacheHitRate * 100)}%`
        ],
        recommendations: await claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getPerformanceRecommendations(),
        alerts: alerts.slice(0, 5) // Latest 5 alerts
    };
}
async function analyzeOverallPerformance(timeRange, stateManager) {
    const projectState = stateManager.getState();
    const claudeMetrics = claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getPerformanceMetrics(timeRange);
    const trendAnalysis = claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getTrendAnalysis(timeRange);
    return {
        timestamp: new Date().toISOString(),
        timeRange,
        claudeCodeMetrics: claudeMetrics,
        systemMetrics: {
            claudeCodeUsage: claudeMetrics.totalRequests,
            averageResponseTime: Math.round(claudeMetrics.averageResponseTime),
            successRate: Math.round(claudeMetrics.successRate * 100),
            cacheEfficiency: Math.round(claudeMetrics.cacheHitRate * 100),
            uptime: timeRange,
            responseTime: Math.round(claudeMetrics.averageResponseTime)
        },
        projectMetrics: {
            activeTasks: projectState.tasks.size,
            completedTasks: projectState.metadata.completedTasks,
            activeTeams: Array.from(projectState.metadata.teamUtilization.values()).filter((util) => util > 0).length,
            systemLoad: Math.min(1.0, claudeMetrics.totalRequests / (timeRange * 10)) // Rough load calculation
        },
        healthScore: Math.max(0.3, claudeMetrics.successRate - (claudeMetrics.errorRate * 2)),
        insights: [
            `Claude Code Usage: ${claudeMetrics.totalRequests} requests`,
            `Success Rate: ${Math.round(claudeMetrics.successRate * 100)}%`,
            `Average Response Time: ${Math.round(claudeMetrics.averageResponseTime)}ms`,
            `Active Tasks: ${projectState.tasks.size}`,
            `Performance Trend: ${trendAnalysis.trend} (${Math.round(trendAnalysis.confidence * 100)}% confidence)`
        ],
        recommendations: await claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getPerformanceRecommendations(),
        alerts: claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getAlerts().slice(0, 3),
        trends: [trendAnalysis]
    };
}
async function analyzeClaudeCodeTrends(timeRange) {
    const trendAnalysis = claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getTrendAnalysis(timeRange);
    const metrics = claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getPerformanceMetrics(timeRange);
    const modelStats = claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getModelUsageStats(timeRange);
    return {
        timestamp: new Date().toISOString(),
        timeRange,
        claudeCodeMetrics: metrics,
        trends: [
            { metric: 'success_rate', direction: trendAnalysis.trend, change: Math.round(metrics.successRate * 100) },
            { metric: 'response_time', direction: metrics.averageResponseTime < 15000 ? 'improving' : 'degrading', change: Math.round((metrics.averageResponseTime - 10000) / 100) }
        ],
        patterns: [
            { description: `${trendAnalysis.details}`, confidence: trendAnalysis.confidence }
        ],
        anomalies: claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getAlerts('error'),
        predictions: [
            { metric: 'performance', prediction: trendAnalysis.trend, confidence: trendAnalysis.confidence }
        ],
        healthScore: Math.max(0.3, metrics.successRate - (metrics.errorRate * 2)),
        insights: [
            `Performance trend: ${trendAnalysis.trend}`,
            `Confidence level: ${Math.round(trendAnalysis.confidence * 100)}%`,
            `Total requests analyzed: ${metrics.totalRequests}`,
            `Current success rate: ${Math.round(metrics.successRate * 100)}%`
        ],
        recommendations: await claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getPerformanceRecommendations(),
        alerts: claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getAlerts().slice(0, 3)
    };
}
async function generateClaudeCodeRecommendations(timeRange) {
    const metrics = claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getPerformanceMetrics(timeRange);
    const recommendations = await claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getPerformanceRecommendations();
    const alerts = claudeCodePerformanceMonitor_js_1.claudeCodePerformanceMonitor.getAlerts();
    const immediateActions = alerts.filter(a => a.type === 'error').map(a => a.suggestions).flat();
    const shortTermActions = alerts.filter(a => a.type === 'warning').map(a => a.suggestions).flat();
    return {
        timestamp: new Date().toISOString(),
        timeRange,
        claudeCodeMetrics: metrics,
        categories: {
            immediate: immediateActions,
            shortTerm: shortTermActions.length > 0 ? shortTermActions : ['Monitor Claude Code performance regularly'],
            longTerm: ['Optimize prompt strategies for better performance', 'Consider model usage patterns for cost optimization'],
            preventive: ['Set up automated performance alerts', 'Schedule weekly Claude Code performance reviews']
        },
        priorityRecommendations: recommendations.slice(0, 3),
        estimatedImpact: {
            performanceGain: metrics.successRate < 0.9 ? 0.15 : 0.05,
            resourceSavings: metrics.cacheHitRate < 0.5 ? 0.2 : 0.05,
            costReduction: metrics.totalRequests > 100 ? 0.1 : 0.02
        },
        healthScore: Math.max(0.3, metrics.successRate - (metrics.errorRate * 2)),
        insights: [
            `${immediateActions.length} immediate actions recommended`,
            `${shortTermActions.length} short-term improvements identified`,
            `Claude Code success rate: ${Math.round(metrics.successRate * 100)}%`,
            `Estimated optimization potential: ${metrics.successRate < 0.9 ? 'High' : 'Low'}`
        ],
        recommendations,
        alerts: alerts.slice(0, 5)
    };
}
function formatPerformanceResult(metric, result) {
    switch (metric) {
        case 'tool':
            return `**Tool Performance Analysis**:
- Total Executions: ${result.toolMetrics.totalExecutions}
- Average Execution Time: ${result.toolMetrics.averageExecutionTime}ms
- Slowest Tool: ${result.toolMetrics.slowestTool}
- Fastest Tool: ${result.toolMetrics.fastestTool}
- Error Rate: ${Math.round(result.toolMetrics.errorRate * 100)}%
- Throughput: ${result.toolMetrics.throughput} ops/min

**Top Performers**:
${result.topPerformers?.map((tool) => `- ${tool.name}: ${tool.avgTime}ms (${tool.executions} runs)`).join('\n') || '- No data available'}`;
        case 'overall':
            return `**System Performance Overview**:
- CPU Usage: ${Math.round(result.systemMetrics.cpuUsage * 100)}%
- Memory Usage: ${Math.round(result.systemMetrics.memoryUsage * 100)}%
- Disk I/O: ${result.systemMetrics.diskIO} MB/s
- Network I/O: ${result.systemMetrics.networkIO} KB/s
- Uptime: ${Math.round(result.systemMetrics.uptime)} hours
- Response Time: ${result.systemMetrics.responseTime}ms

**Project Performance**:
- Active Tasks: ${result.projectMetrics.activeTasks}
- Completed Tasks: ${result.projectMetrics.completedTasks}
- Active Teams: ${result.projectMetrics.activeTeams}
- System Load: ${Math.round(result.projectMetrics.systemLoad * 100)}%`;
        case 'trends':
            return `**Performance Trends Analysis**:
${result.trends?.map((trend) => `- **${trend.metric}**: ${trend.direction} trend (${trend.change}% change)`).join('\n') || '- No significant trends detected'}

**Patterns Identified**:
${result.patterns?.map((pattern) => `- ${pattern.description} (Confidence: ${Math.round(pattern.confidence * 100)}%)`).join('\n') || '- No patterns identified'}

**Predictions**:
${result.predictions?.map((prediction) => `- ${prediction.metric}: ${prediction.prediction} (${Math.round(prediction.confidence * 100)}% confidence)`).join('\n') || '- No predictions available'}`;
        case 'recommendations':
            return `**Performance Recommendations by Priority**:

**Short-term Improvements** (Medium Priority):
${result.categories.shortTerm?.map((rec) => `- ${rec}`).join('\n') || '- No short-term improvements needed'}

**Long-term Optimizations** (Low Priority):
${result.categories.longTerm?.map((rec) => `- ${rec}`).join('\n') || '- No long-term optimizations identified'}

**Preventive Measures**:
${result.categories.preventive?.map((rec) => `- ${rec}`).join('\n') || '- No preventive measures required'}

**Estimated Impact**:
- Performance Gain: ${Math.round((result.estimatedImpact?.performanceGain || 0) * 100)}%
- Resource Savings: ${Math.round((result.estimatedImpact?.resourceSavings || 0) * 100)}%`;
        default:
            return JSON.stringify(result, null, 2);
    }
}
function formatTimeRange(hours) {
    if (hours < 1) {
        return `${Math.round(hours * 60)} minutes`;
    }
    else if (hours < 24) {
        return `${hours} hours`;
    }
    else {
        return `${Math.round(hours / 24)} days`;
    }
}
//# sourceMappingURL=performanceMetrics.js.map