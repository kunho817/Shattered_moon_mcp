"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicTeamExpander = void 0;
const index_js_1 = require("../types/index.js");
const common_js_1 = require("../utils/common.js");
const claudeCodeInvoker_js_1 = require("../utils/claudeCodeInvoker.js");
const logger_js_1 = __importDefault(require("../utils/logger.js"));
exports.dynamicTeamExpander = (0, common_js_1.withServices)('dynamicTeamExpander', async (services, params) => {
    const { stateManager, performanceMonitor } = services;
    return await performanceMonitor.measure('dynamic_team_expander', 'expand', async () => {
        try {
            logger_js_1.default.info('Executing dynamic team expander', { params });
            const { specialists, context, duration } = params;
            const activatedSpecialists = [];
            const conflicts = [];
            // Validate specialists exist
            const validSpecialists = specialists.filter(spec => spec in index_js_1.SPECIALISTS);
            if (validSpecialists.length !== specialists.length) {
                const invalidSpecs = specialists.filter(spec => !(spec in index_js_1.SPECIALISTS));
                logger_js_1.default.warn('Invalid specialists detected', { invalidSpecs });
            }
            // Claude Code-powered expansion analysis
            const expansionPrompt = `Analyze team expansion requirements:

Context: "${context}"
Requested Specialists: ${validSpecialists.join(', ')}
Duration: ${duration || 60} minutes

Analyze and provide:
1. Urgency level (low/normal/high/critical)
2. Team fit score (0-1) - how well specialists match context
3. Resource efficiency (0-1) - optimal resource usage
4. Context match score (0-1) - alignment with task requirements
5. Risk factors (array)
6. Optimization suggestions (array)

Respond in JSON format with keys: urgency, teamFit, efficiency, contextScore, riskFactors, optimizations`;
            const expansionResponse = await claudeCodeInvoker_js_1.claudeCodeInvoker.invokeAuto(expansionPrompt, `Team expansion analysis for: ${context}`, { timeout: 15000 });
            let expansion;
            if (expansionResponse.success) {
                try {
                    expansion = JSON.parse(expansionResponse.output);
                    logger_js_1.default.info('Claude Code expansion analysis completed', { expansion });
                }
                catch (parseError) {
                    logger_js_1.default.warn('Failed to parse expansion response, using fallback');
                    const contextAnalysis = analyzeExpansionContext(context, validSpecialists);
                    expansion = {
                        urgency: contextAnalysis.urgency,
                        teamFit: contextAnalysis.teamFit,
                        efficiency: contextAnalysis.efficiency,
                        contextScore: contextAnalysis.contextScore,
                        riskFactors: ['Analysis parsing failed'],
                        optimizations: ['Manual analysis required']
                    };
                }
            }
            else {
                logger_js_1.default.error('Claude Code expansion analysis failed, using fallback', { error: expansionResponse.error });
                const contextAnalysis = analyzeExpansionContext(context, validSpecialists);
                expansion = {
                    urgency: contextAnalysis.urgency,
                    teamFit: contextAnalysis.teamFit,
                    efficiency: contextAnalysis.efficiency,
                    contextScore: contextAnalysis.contextScore,
                    riskFactors: ['AI analysis system unavailable'],
                    optimizations: ['Use basic specialist allocation']
                };
            }
            // Real specialist conflict detection and resource assessment
            for (const specialistType of validSpecialists) {
                const specialist = index_js_1.SPECIALISTS[specialistType];
                // Use real specialist load calculation
                const currentLoad = (0, common_js_1.calculateSpecialistLoad)(services, specialistType);
                logger_js_1.default.info('Specialist load calculated', { specialistType, currentLoad });
                // Check for overload condition
                if (currentLoad >= 0.9) {
                    conflicts.push({
                        specialist: specialistType,
                        issue: 'overloaded',
                        currentLoad: Math.round(currentLoad * 100),
                        severity: 'high',
                        suggestion: 'Consider alternative specialist or delay activation'
                    });
                    continue;
                }
                // Enhanced activation assessment
                const activationResult = assessSpecialistActivation(specialistType, currentLoad, context, expansion.contextScore);
                if (activationResult.success) {
                    const newSpecialist = stateManager.addSpecialist({
                        type: specialistType,
                        expertise: specialist.expertise,
                        status: 'busy',
                        performance: activationResult.performanceScore
                    });
                    activatedSpecialists.push({
                        type: specialistType,
                        id: newSpecialist,
                        expertise: specialist.expertise,
                        status: 'active',
                        estimatedCapacity: activationResult.capacity,
                        performanceScore: activationResult.performanceScore,
                        contextMatch: activationResult.contextMatch,
                        activatedAt: new Date().toISOString()
                    });
                }
                else {
                    conflicts.push({
                        specialist: specialistType,
                        issue: activationResult.error || 'Activation failed',
                        severity: activationResult.severity || 'medium',
                        suggestion: activationResult.suggestion || 'Try again later'
                    });
                }
            }
            // Claude Code-powered team optimization
            const optimizationPrompt = `Optimize team composition based on results:

Activated Specialists:
${activatedSpecialists.map(s => `- ${s.type}: ${Math.round(s.performanceScore * 100)}% performance, ${s.estimatedCapacity}% capacity`).join('\n')}

Conflicts:
${conflicts.map(c => `- ${c.specialist}: ${c.issue} (${c.severity})`).join('\n')}

Context: "${context}"
Requested: ${validSpecialists.join(', ')}

Provide optimization:
1. Specific recommendations (array)
2. Suggested additional specialists (array)
3. Priority adjustments needed
4. Alternative approaches

Respond in JSON format with keys: recommendations, suggestedAdditions, priorityAdjustments, alternatives`;
            const optimizationResponse = await claudeCodeInvoker_js_1.claudeCodeInvoker.invokePlanning(optimizationPrompt, { timeout: 20000 });
            let teamOptimization;
            if (optimizationResponse.success) {
                try {
                    teamOptimization = JSON.parse(optimizationResponse.output);
                    logger_js_1.default.info('Claude Code team optimization completed', { teamOptimization });
                }
                catch (parseError) {
                    logger_js_1.default.warn('Failed to parse optimization response, using fallback');
                    teamOptimization = generateTeamOptimization(activatedSpecialists, conflicts, context, validSpecialists);
                }
            }
            else {
                logger_js_1.default.error('Claude Code optimization failed, using fallback', { error: optimizationResponse.error });
                teamOptimization = generateTeamOptimization(activatedSpecialists, conflicts, context, validSpecialists);
            }
            // Claude Code-powered performance prediction
            const performancePrompt = `Predict team performance for expanded team:

Team Composition:
${activatedSpecialists.map(s => `- ${s.type}: ${Math.round(s.performanceScore * 100)}% performance, ${Math.round(s.contextMatch * 100)}% context match`).join('\n')}

Conflicts: ${conflicts.length}
Duration: ${duration || 60} minutes
Context: "${context}"
Efficiency: ${Math.round(expansion.efficiency * 100)}%

Predict:
1. Success probability (0-1)
2. Productivity boost factor (1.0+ means improvement)
3. Quality score (0-1)
4. Time improvement estimate
5. Risk assessment

Respond in JSON format with keys: successRate, productivityBoost, qualityScore, timeImprovement, riskAssessment`;
            const performanceResponse = await claudeCodeInvoker_js_1.claudeCodeInvoker.invokeExecution(performancePrompt, { timeout: 10000 });
            let performance;
            if (performanceResponse.success) {
                try {
                    performance = JSON.parse(performanceResponse.output);
                    // Add estimated completion time
                    const improvementPercent = Math.round((performance.productivityBoost - 1) * 100);
                    performance.estimatedCompletion = `Improved by ${improvementPercent}% (${Math.round((duration || 60) / performance.productivityBoost)} min estimated)`;
                    logger_js_1.default.info('Claude Code performance prediction completed', { performance });
                }
                catch (parseError) {
                    logger_js_1.default.warn('Failed to parse performance response, using fallback');
                    performance = predictTeamPerformance(activatedSpecialists, conflicts, expansion, duration || 60);
                }
            }
            else {
                logger_js_1.default.error('Claude Code performance prediction failed, using fallback', { error: performanceResponse.error });
                performance = predictTeamPerformance(activatedSpecialists, conflicts, expansion, duration || 60);
            }
            // Team expansion pattern recording replaced by Claude Code analytics
            logger_js_1.default.info('Team expansion completed', {
                type: 'team_expansion',
                complexity: expansion.urgency,
                teams: validSpecialists,
                duration: duration || 60,
                success: activatedSpecialists.length > 0 && conflicts.filter(c => c.severity === 'high').length === 0
            });
            const response = {
                content: [{
                        type: "text",
                        text: `🚀 **Dynamic Team Expansion Completed!**

**Expansion Summary**:
- **Specialists Requested**: ${specialists.length}
- **Successfully Activated**: ${activatedSpecialists.length}
- **Conflicts Detected**: ${conflicts.length}
- **Context**: ${context}
- **Duration**: ${duration || 60} minutes

**Claude Code Expansion Analysis**:
- **Urgency Level**: ${expansion.urgency}
- **Team Fit Score**: ${Math.round(expansion.teamFit * 100)}%
- **Resource Efficiency**: ${Math.round(expansion.efficiency * 100)}%
- **Context Match**: ${Math.round(expansion.contextScore * 100)}%
${expansion.riskFactors?.length > 0 ? `- **Risk Factors**: ${expansion.riskFactors.join(', ')}` : ''}

${activatedSpecialists.length > 0 ? `**✅ Successfully Activated Specialists (${activatedSpecialists.length})**:
${activatedSpecialists.map(s => `- **${s.type}** (\`${s.id}\`)
    - **Expertise**: ${s.expertise}
    - **Capacity**: ${s.estimatedCapacity}%
    - **Performance Score**: ${Math.round(s.performanceScore * 100)}%
    - **Context Match**: ${Math.round(s.contextMatch * 100)}%`).join('\n')}

` : ''}${conflicts.length > 0 ? `**⚠️ Issues & Conflicts (${conflicts.length})**:
${conflicts.map((c) => {
                            const severityIcon = c.severity === 'high' ? '🚨' : c.severity === 'medium' ? '⚠️' : 'ℹ️';
                            return `- ${severityIcon} **${c.specialist}**: ${c.issue}${c.currentLoad ? ` (${c.currentLoad}% loaded)` : ''}
    - **Suggestion**: ${c.suggestion}`;
                        }).join('\n')}

` : ''}**📊 Team Performance Prediction**:
- **Success Probability**: ${Math.round(performance.successRate * 100)}%
- **Productivity Boost**: ${Math.round(performance.productivityBoost * 100)}%
- **Quality Score**: ${Math.round(performance.qualityScore * 100)}%
- **Estimated Completion**: ${performance.estimatedCompletion}

**🎯 Claude Code Team Optimization**:
${teamOptimization.recommendations.map((r) => `- ${r}`).join('\n')}

${teamOptimization.priorityAdjustments ? `**Priority Adjustments**:
${teamOptimization.priorityAdjustments.map((p) => `- ${p}`).join('\n')}` : ''}

${teamOptimization.alternatives ? `**Alternative Approaches**:
${teamOptimization.alternatives.map((a) => `- ${a}`).join('\n')}` : ''}

${teamOptimization.suggestedAdditions.length > 0 ? `
**💡 Suggested Additional Specialists**:
${teamOptimization.suggestedAdditions.map((s) => `- **${s}**: ${index_js_1.SPECIALISTS[s]?.expertise || 'Specialized expertise'}`).join('\n')}` : ''}

**Summary**: Team expanded with ${activatedSpecialists.length} specialists optimized for the current context. ${conflicts.length > 0 ? `${conflicts.filter(c => c.severity === 'high').length} high-priority conflicts require attention.` : 'All specialists activated successfully.'}`
                    }]
            };
            return response;
        }
        catch (error) {
            return (0, common_js_1.formatError)('dynamicTeamExpander', error, { params });
        }
    });
});
// Enhanced helper functions for dynamic team expansion
function analyzeExpansionContext(context, specialists) {
    const contextLower = context.toLowerCase();
    // Analyze urgency based on context keywords
    const urgencyKeywords = {
        critical: ['critical', 'urgent', 'emergency', 'immediate', 'blocker'],
        high: ['important', 'priority', 'deadline', 'asap', 'quickly'],
        normal: ['standard', 'normal', 'regular', 'planned'],
        low: ['future', 'research', 'investigation', 'optional']
    };
    let urgency = 'normal';
    for (const [level, keywords] of Object.entries(urgencyKeywords)) {
        if (keywords.some(keyword => contextLower.includes(keyword))) {
            urgency = level;
            break;
        }
    }
    // Calculate team fit based on specialist alignment with context
    const contextSpecialistMatch = calculateContextSpecialistMatch(context, specialists);
    const teamFit = contextSpecialistMatch;
    // Calculate efficiency based on team size and context complexity
    const efficiency = Math.max(0.5, 1 - (specialists.length * 0.05) + contextSpecialistMatch);
    return {
        urgency,
        teamFit,
        efficiency,
        contextScore: contextSpecialistMatch
    };
}
function calculateContextSpecialistMatch(context, specialists) {
    const contextLower = context.toLowerCase();
    let matches = 0;
    for (const specialist of specialists) {
        const specialistData = index_js_1.SPECIALISTS[specialist];
        if (specialistData) {
            const expertiseKeywords = specialistData.expertise.toLowerCase().split(' ');
            const matchCount = expertiseKeywords.filter(keyword => contextLower.includes(keyword.toLowerCase())).length;
            if (matchCount > 0) {
                matches += matchCount / expertiseKeywords.length;
            }
        }
    }
    return Math.min(1.0, matches / specialists.length);
}
function assessSpecialistActivation(specialistType, currentLoad, context, contextScore) {
    // Check if specialist can be activated
    if (currentLoad >= 0.95) {
        return {
            success: false,
            capacity: 0,
            performanceScore: 0,
            contextMatch: 0,
            error: 'Specialist at maximum capacity',
            severity: 'high',
            suggestion: 'Wait for current tasks to complete or find alternative specialist'
        };
    }
    const capacity = Math.round((1 - currentLoad) * 100);
    const specialist = index_js_1.SPECIALISTS[specialistType];
    // Calculate context match for this specific specialist
    const contextMatch = specialist ?
        calculateContextSpecialistMatch(context, [specialistType]) : 0.5;
    // Calculate performance score based on load and context match
    const performanceScore = Math.max(0.6, (1 - currentLoad * 0.3) * (0.7 + contextMatch * 0.3));
    return {
        success: true,
        capacity,
        performanceScore,
        contextMatch
    };
}
function generateTeamOptimization(activatedSpecialists, conflicts, context, requestedSpecialists) {
    const recommendations = [];
    const suggestedAdditions = [];
    // Generate recommendations based on activation results
    if (conflicts.length > 0) {
        const highSeverityConflicts = conflicts.filter(c => c.severity === 'high').length;
        if (highSeverityConflicts > 0) {
            recommendations.push(`Address ${highSeverityConflicts} high-priority specialist conflicts immediately`);
        }
        recommendations.push('Consider staggering specialist activation to reduce resource conflicts');
    }
    if (activatedSpecialists.length < requestedSpecialists.length * 0.7) {
        recommendations.push('Low activation rate - consider alternative specialists or timing');
    }
    const avgPerformance = activatedSpecialists.reduce((sum, s) => sum + s.performanceScore, 0) / Math.max(activatedSpecialists.length, 1);
    if (avgPerformance < 0.8) {
        recommendations.push('Specialist performance below optimal - review workload distribution');
    }
    // Suggest additional specialists based on context
    const contextLower = context.toLowerCase();
    const specialistSuggestions = {
        'graphics': ['shader-wizard', 'dx12-specialist'],
        'performance': ['profiler-expert', 'optimization-specialist'],
        'testing': ['qa-engineer', 'automation-specialist'],
        'architecture': ['ecs-specialist', 'memory-expert']
    };
    for (const [keyword, specs] of Object.entries(specialistSuggestions)) {
        if (contextLower.includes(keyword)) {
            suggestedAdditions.push(...specs.filter(spec => !requestedSpecialists.includes(spec) && spec in index_js_1.SPECIALISTS));
        }
    }
    if (recommendations.length === 0) {
        recommendations.push('Current team expansion is well-optimized for the given context');
    }
    return {
        recommendations,
        suggestedAdditions: [...new Set(suggestedAdditions)].slice(0, 3) // Limit to 3 suggestions
    };
}
function predictTeamPerformance(activatedSpecialists, conflicts, expansion, duration) {
    // Calculate success rate based on activation results and conflicts
    const baseSuccessRate = 0.8;
    const activationBonus = (activatedSpecialists.length * 0.05);
    const conflictPenalty = conflicts.reduce((penalty, c) => {
        return penalty + (c.severity === 'high' ? 0.2 : c.severity === 'medium' ? 0.1 : 0.05);
    }, 0);
    const successRate = Math.max(0.4, Math.min(1.0, baseSuccessRate + activationBonus - conflictPenalty));
    // Calculate productivity boost
    const avgPerformance = activatedSpecialists.reduce((sum, s) => sum + s.performanceScore, 0) / Math.max(activatedSpecialists.length, 1);
    const productivityBoost = 1.0 + (activatedSpecialists.length * 0.15) + (avgPerformance * 0.3);
    // Calculate quality score
    const avgContextMatch = activatedSpecialists.reduce((sum, s) => sum + s.contextMatch, 0) / Math.max(activatedSpecialists.length, 1);
    const qualityScore = Math.max(0.6, 0.7 + (avgContextMatch * 0.2) + (expansion.efficiency * 0.1));
    // Estimate completion improvement
    const improvementPercent = Math.round((productivityBoost - 1) * 100);
    const estimatedCompletion = `Improved by ${improvementPercent}% (${Math.round(duration / productivityBoost)} min estimated)`;
    return {
        successRate,
        productivityBoost,
        qualityScore,
        estimatedCompletion
    };
}
//# sourceMappingURL=dynamicTeamExpander.js.map