import { DynamicTeamExpanderParams, SPECIALISTS } from '../types/index.js';
import { withServices, calculateSpecialistLoad, formatError } from '../utils/common.js';
import logger from '../utils/logger.js';

export const dynamicTeamExpander = withServices(
  'dynamicTeamExpander',
  async (services, params: DynamicTeamExpanderParams) => {
    const { stateManager, performanceMonitor, aiEngine } = services;
    
    return await performanceMonitor.measure(
      'dynamic_team_expander',
      'expand',
      async () => {
        try {
          logger.info('Executing dynamic team expander', { params });

          const { specialists, context, duration } = params;
          const activatedSpecialists: any[] = [];
          const conflicts: any[] = [];
          
          // Validate specialists exist
          const validSpecialists = specialists.filter(spec => spec in SPECIALISTS);
          if (validSpecialists.length !== specialists.length) {
            const invalidSpecs = specialists.filter(spec => !(spec in SPECIALISTS));
            logger.warn('Invalid specialists detected', { invalidSpecs });
          }

          // Enhanced AI-powered expansion analysis based on context
          const contextAnalysis = analyzeExpansionContext(context, validSpecialists);
          const expansion = {
            urgency: contextAnalysis.urgency,
            teamFit: contextAnalysis.teamFit,
            efficiency: contextAnalysis.efficiency,
            contextScore: contextAnalysis.contextScore
          };

          // Real specialist conflict detection and resource assessment
          for (const specialistType of validSpecialists) {
            const specialist = SPECIALISTS[specialistType as keyof typeof SPECIALISTS];
            
            // Use real specialist load calculation
            const currentLoad = calculateSpecialistLoad(services, specialistType);
            logger.info('Specialist load calculated', { specialistType, currentLoad });
            
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
            const activationResult = assessSpecialistActivation(
              specialistType, 
              currentLoad, 
              context, 
              expansion.contextScore
            );

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
            } else {
              conflicts.push({
                specialist: specialistType,
                issue: activationResult.error || 'Activation failed',
                severity: activationResult.severity || 'medium',
                suggestion: activationResult.suggestion || 'Try again later'
              });
            }
          }

          // Enhanced AI recommendations for team composition
          const teamOptimization = generateTeamOptimization(
            activatedSpecialists, 
            conflicts, 
            context, 
            validSpecialists
          );

          // Enhanced team performance prediction based on real data
          const performance = predictTeamPerformance(
            activatedSpecialists,
            conflicts,
            expansion,
            duration || 60
          );

          // Record expansion pattern for learning with enhanced data
          aiEngine.recordTaskPattern({
            type: 'team_expansion',
            complexity: expansion.urgency as any,
            teams: validSpecialists,
            duration: duration || 60,
            success: activatedSpecialists.length > 0 && conflicts.filter(c => c.severity === 'high').length === 0
          });

          const response = {
            content: [{
              type: "text" as const,
              text: `🚀 **Dynamic Team Expansion Completed!**

**Expansion Summary**:
- **Specialists Requested**: ${specialists.length}
- **Successfully Activated**: ${activatedSpecialists.length}
- **Conflicts Detected**: ${conflicts.length}
- **Context**: ${context}
- **Duration**: ${duration || 60} minutes

**AI Expansion Analysis**:
- **Urgency Level**: ${expansion.urgency}
- **Team Fit Score**: ${Math.round(expansion.teamFit * 100)}%
- **Resource Efficiency**: ${Math.round(expansion.efficiency * 100)}%
- **Context Match**: ${Math.round(expansion.contextScore * 100)}%

${activatedSpecialists.length > 0 ? `**✅ Successfully Activated Specialists (${activatedSpecialists.length})**:
${activatedSpecialists.map(s => 
  `- **${s.type}** (\`${s.id}\`)
    - **Expertise**: ${s.expertise}
    - **Capacity**: ${s.estimatedCapacity}%
    - **Performance Score**: ${Math.round(s.performanceScore * 100)}%
    - **Context Match**: ${Math.round(s.contextMatch * 100)}%`
).join('\n')}

` : ''}${conflicts.length > 0 ? `**⚠️ Issues & Conflicts (${conflicts.length})**:
${conflicts.map((c: any) => {
  const severityIcon = c.severity === 'high' ? '🚨' : c.severity === 'medium' ? '⚠️' : 'ℹ️';
  return `- ${severityIcon} **${c.specialist}**: ${c.issue}${c.currentLoad ? ` (${c.currentLoad}% loaded)` : ''}
    - **Suggestion**: ${c.suggestion}`;
}).join('\n')}

` : ''}**📊 Team Performance Prediction**:
- **Success Probability**: ${Math.round(performance.successRate * 100)}%
- **Productivity Boost**: ${Math.round(performance.productivityBoost * 100)}%
- **Quality Score**: ${Math.round(performance.qualityScore * 100)}%
- **Estimated Completion**: ${performance.estimatedCompletion}

**🎯 AI Team Optimization**:
${teamOptimization.recommendations.map((r: string) => `- ${r}`).join('\n')}

${teamOptimization.suggestedAdditions.length > 0 ? `
**💡 Suggested Additional Specialists**:
${teamOptimization.suggestedAdditions.map((s: string) => `- **${s}**: ${SPECIALISTS[s as keyof typeof SPECIALISTS]?.expertise || 'Specialized expertise'}`).join('\n')}` : ''}

**Summary**: Team expanded with ${activatedSpecialists.length} specialists optimized for the current context. ${conflicts.length > 0 ? `${conflicts.filter(c => c.severity === 'high').length} high-priority conflicts require attention.` : 'All specialists activated successfully.'}`
            }]
          };

          return response;
        } catch (error) {
          return formatError('dynamicTeamExpander', error, { params });
        }
      }
    );
  }
);

// Enhanced helper functions for dynamic team expansion

function analyzeExpansionContext(context: string, specialists: string[]): {
  urgency: 'low' | 'normal' | 'high' | 'critical';
  teamFit: number;
  efficiency: number;
  contextScore: number;
} {
  const contextLower = context.toLowerCase();
  
  // Analyze urgency based on context keywords
  const urgencyKeywords = {
    critical: ['critical', 'urgent', 'emergency', 'immediate', 'blocker'],
    high: ['important', 'priority', 'deadline', 'asap', 'quickly'],
    normal: ['standard', 'normal', 'regular', 'planned'],
    low: ['future', 'research', 'investigation', 'optional']
  };
  
  let urgency: 'low' | 'normal' | 'high' | 'critical' = 'normal';
  for (const [level, keywords] of Object.entries(urgencyKeywords)) {
    if (keywords.some(keyword => contextLower.includes(keyword))) {
      urgency = level as any;
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

function calculateContextSpecialistMatch(context: string, specialists: string[]): number {
  const contextLower = context.toLowerCase();
  let matches = 0;
  
  for (const specialist of specialists) {
    const specialistData = SPECIALISTS[specialist as keyof typeof SPECIALISTS];
    if (specialistData) {
      const expertiseKeywords = specialistData.expertise.toLowerCase().split(' ');
      const matchCount = expertiseKeywords.filter(keyword => 
        contextLower.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount > 0) {
        matches += matchCount / expertiseKeywords.length;
      }
    }
  }
  
  return Math.min(1.0, matches / specialists.length);
}

function assessSpecialistActivation(
  specialistType: string,
  currentLoad: number,
  context: string,
  contextScore: number
): {
  success: boolean;
  capacity: number;
  performanceScore: number;
  contextMatch: number;
  error?: string;
  severity?: string;
  suggestion?: string;
} {
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
  const specialist = SPECIALISTS[specialistType as keyof typeof SPECIALISTS];
  
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

function generateTeamOptimization(
  activatedSpecialists: any[],
  conflicts: any[],
  context: string,
  requestedSpecialists: string[]
): {
  recommendations: string[];
  suggestedAdditions: string[];
} {
  const recommendations: string[] = [];
  const suggestedAdditions: string[] = [];
  
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
  const specialistSuggestions: { [key: string]: string[] } = {
    'graphics': ['shader-wizard', 'dx12-specialist'],
    'performance': ['profiler-expert', 'optimization-specialist'],
    'testing': ['qa-engineer', 'automation-specialist'],
    'architecture': ['ecs-specialist', 'memory-expert']
  };
  
  for (const [keyword, specs] of Object.entries(specialistSuggestions)) {
    if (contextLower.includes(keyword)) {
      suggestedAdditions.push(...specs.filter(spec => 
        !requestedSpecialists.includes(spec) && spec in SPECIALISTS
      ));
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

function predictTeamPerformance(
  activatedSpecialists: any[],
  conflicts: any[],
  expansion: any,
  duration: number
): {
  successRate: number;
  productivityBoost: number;
  qualityScore: number;
  estimatedCompletion: string;
} {
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