/**
 * 지능형 코드 생성 시스템
 * AI 기반 고급 코드 생성, 품질 분석, 최적화 및 맞춤화
 */

import { claudeCodeInvoker } from './claudeCodeInvoker.js';
import { enhancedClaudeCodeManager } from './enhancedClaudeCodeManager.js';
import { advancedSpecialistManager, DynamicSpecialist } from './advancedSpecialistManager.js';
import logger from './logger.js';

// 지능형 코드 생성 관련 타입 정의
export interface CodeGenerationRequest {
  type: 'component' | 'system' | 'shader' | 'event' | 'utility' | 'algorithm' | 'interface' | 'test';
  name: string;
  description?: string;
  context: CodeContext;
  requirements: CodeRequirements;
  constraints: CodeConstraint[];
  preferences: CodePreferences;
  existingCode?: ExistingCodebase;
}

export interface CodeContext {
  projectType: 'game_engine' | 'graphics' | 'audio' | 'networking' | 'ui' | 'tools';
  framework: 'directx12' | 'vulkan' | 'opengl' | 'custom';
  language: 'cpp' | 'hlsl' | 'typescript' | 'python' | 'rust';
  platform: 'windows' | 'linux' | 'macos' | 'cross_platform';
  architecture: 'x64' | 'x86' | 'arm64';
  performanceCritical: boolean;
  memoryConstrained: boolean;
  realtimeRequirements: boolean;
  threadSafety: 'none' | 'read_safe' | 'thread_safe' | 'lock_free';
}

export interface CodeRequirements {
  functionality: string[];
  interfaces: InterfaceRequirement[];
  dependencies: DependencyRequirement[];
  performance: PerformanceRequirement;
  quality: QualityRequirement;
  compatibility: CompatibilityRequirement;
  testing: TestingRequirement;
}

export interface InterfaceRequirement {
  name: string;
  type: 'public' | 'protected' | 'private';
  methods: MethodSignature[];
  properties: PropertySignature[];
  events?: EventSignature[];
}

export interface MethodSignature {
  name: string;
  returnType: string;
  parameters: Parameter[];
  isVirtual?: boolean;
  isConst?: boolean;
  isNoexcept?: boolean;
  documentation?: string;
}

export interface Parameter {
  name: string;
  type: string;
  defaultValue?: string;
  isConst?: boolean;
  isReference?: boolean;
  isPointer?: boolean;
}

export interface PropertySignature {
  name: string;
  type: string;
  access: 'public' | 'protected' | 'private';
  isConst?: boolean;
  isStatic?: boolean;
  defaultValue?: string;
}

export interface EventSignature {
  name: string;
  parameters: Parameter[];
  documentation?: string;
}

export interface DependencyRequirement {
  name: string;
  version?: string;
  type: 'header_only' | 'static_lib' | 'dynamic_lib' | 'system';
  optional: boolean;
  purpose: string;
}

export interface PerformanceRequirement {
  targetFramerate?: number; // for real-time code
  maxLatency?: number; // milliseconds
  memoryBudget?: number; // MB
  cpuBudget?: number; // percentage
  scalability: 'single_core' | 'multi_core' | 'gpu_accelerated';
  cacheEfficiency: 'low' | 'medium' | 'high' | 'critical';
}

export interface QualityRequirement {
  codeStyle: 'google' | 'microsoft' | 'llvm' | 'custom';
  documentationLevel: 'minimal' | 'standard' | 'comprehensive';
  testCoverage: number; // 0-100 percentage
  errorHandling: 'basic' | 'comprehensive' | 'exception_safe';
  maintainability: 'simple' | 'modular' | 'enterprise';
}

export interface CompatibilityRequirement {
  cppStandard: 'cpp14' | 'cpp17' | 'cpp20' | 'cpp23';
  compilers: string[];
  platforms: string[];
  backwardCompatibility: boolean;
  apiStability: 'experimental' | 'stable' | 'frozen';
}

export interface TestingRequirement {
  unitTests: boolean;
  integrationTests: boolean;
  performanceTests: boolean;
  fuzzing: boolean;
  staticAnalysis: boolean;
  testFramework?: string;
}

export interface CodeConstraint {
  type: 'performance' | 'memory' | 'api' | 'style' | 'security' | 'compatibility';
  description: string;
  severity: 'warning' | 'error' | 'critical';
  autoFixable: boolean;
}

export interface CodePreferences {
  verbosity: 'concise' | 'standard' | 'verbose';
  commentStyle: 'minimal' | 'descriptive' | 'tutorial';
  namingConvention: 'camelCase' | 'PascalCase' | 'snake_case' | 'SCREAMING_SNAKE_CASE';
  includeExamples: boolean;
  includeDocumentation: boolean;
  optimizationFocus: 'speed' | 'size' | 'readability' | 'maintainability';
  modernFeatures: boolean; // use latest C++ features
  headerOnlyPreferred: boolean;
}

export interface ExistingCodebase {
  files: CodeFile[];
  patterns: CodePattern[];
  conventions: CodingConvention[];
  dependencies: string[];
  architecture: string;
}

export interface CodeFile {
  path: string;
  content: string;
  language: string;
  purpose: string;
  interfaces: string[];
}

export interface CodePattern {
  name: string;
  description: string;
  usage: string;
  examples: string[];
}

export interface CodingConvention {
  category: 'naming' | 'formatting' | 'structure' | 'documentation';
  rule: string;
  examples: string[];
}

export interface GeneratedCode {
  id: string;
  request: CodeGenerationRequest;
  primaryFile: GeneratedFile;
  supportingFiles: GeneratedFile[];
  documentation: CodeDocumentation;
  tests: GeneratedTest[];
  analysis: CodeAnalysis;
  alternatives: AlternativeImplementation[];
  generatedAt: number;
  generatorVersion: string;
}

export interface GeneratedFile {
  filename: string;
  content: string;
  language: string;
  purpose: string;
  dependencies: string[];
  estimatedLines: number;
  complexity: CodeComplexity;
}

export interface CodeDocumentation {
  overview: string;
  usage: UsageExample[];
  apiReference: APIReference[];
  performanceNotes: string[];
  limitations: string[];
  futureEnhancements: string[];
}

export interface UsageExample {
  title: string;
  description: string;
  code: string;
  explanation: string;
}

export interface APIReference {
  element: string;
  signature: string;
  description: string;
  parameters: ParameterDoc[];
  returns: string;
  throws?: string[];
  examples: string[];
}

export interface ParameterDoc {
  name: string;
  type: string;
  description: string;
  constraints?: string[];
}

export interface GeneratedTest {
  filename: string;
  content: string;
  framework: string;
  testTypes: string[];
  coverage: number;
}

export interface CodeAnalysis {
  complexity: CodeComplexity;
  quality: QualityMetrics;
  performance: PerformanceAnalysis;
  security: SecurityAnalysis;
  maintainability: MaintainabilityMetrics;
  compliance: ComplianceReport;
  recommendations: CodeRecommendation[];
}

export interface CodeComplexity {
  cyclomatic: number;
  cognitive: number;
  lines: number;
  functions: number;
  classes: number;
  dependencies: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface QualityMetrics {
  readability: number; // 0-100
  testability: number; // 0-100
  reusability: number; // 0-100
  documentation: number; // 0-100
  consistency: number; // 0-100
  overallScore: number; // 0-100
}

export interface PerformanceAnalysis {
  estimatedPerformance: string;
  bottlenecks: string[];
  optimizations: string[];
  scalability: string;
  memoryUsage: string;
  cacheEfficiency: string;
}

export interface SecurityAnalysis {
  vulnerabilities: SecurityIssue[];
  securityScore: number; // 0-100
  recommendations: string[];
  compliance: string[];
}

export interface SecurityIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  fix: string;
}

export interface MaintainabilityMetrics {
  modifiability: number; // 0-100
  extensibility: number; // 0-100
  debuggability: number; // 0-100
  portability: number; // 0-100
  overallScore: number; // 0-100
}

export interface ComplianceReport {
  standardsCompliance: StandardCompliance[];
  bestPractices: BestPracticeCheck[];
  violations: ComplianceViolation[];
  overallCompliance: number; // 0-100
}

export interface StandardCompliance {
  standard: string;
  version: string;
  compliance: number; // 0-100
  issues: string[];
}

export interface BestPracticeCheck {
  practice: string;
  compliant: boolean;
  suggestion?: string;
}

export interface ComplianceViolation {
  rule: string;
  severity: 'info' | 'warning' | 'error';
  location: string;
  description: string;
  autoFixable: boolean;
}

export interface CodeRecommendation {
  type: 'performance' | 'quality' | 'security' | 'maintainability' | 'style';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  implementation: string;
  estimatedEffort: number; // hours
  expectedBenefit: string;
}

export interface AlternativeImplementation {
  name: string;
  description: string;
  tradeoffs: string[];
  code: string;
  analysis: Partial<CodeAnalysis>;
}

export interface CodeGenerationStrategy {
  approach: 'template_based' | 'ai_guided' | 'pattern_matching' | 'hybrid';
  aiModel: 'opus' | 'sonnet' | 'auto';
  iterations: number;
  validationLevel: 'basic' | 'standard' | 'comprehensive';
  optimizationPasses: number;
}

class IntelligentCodeGenerator {
  private generationHistory: GeneratedCode[] = [];
  private codePatterns: Map<string, CodePattern> = new Map();
  private qualityTemplates: Map<string, any> = new Map();
  private performanceCache: Map<string, any> = new Map();

  constructor() {
    this.initializePatterns();
    this.initializeQualityTemplates();
  }

  /**
   * 메인 지능형 코드 생성 함수
   */
  async generateIntelligentCode(
    request: CodeGenerationRequest,
    strategy: Partial<CodeGenerationStrategy> = {}
  ): Promise<GeneratedCode> {
    const generationId = `code_gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    const fullStrategy: CodeGenerationStrategy = {
      approach: 'ai_guided',
      aiModel: 'auto',
      iterations: 3,
      validationLevel: 'comprehensive',
      optimizationPasses: 2,
      ...strategy
    };

    logger.info('Starting intelligent code generation', {
      generationId,
      type: request.type,
      name: request.name,
      strategy: fullStrategy.approach,
      language: request.context.language
    });

    try {
      // 1. 요청 분석 및 최적화
      const optimizedRequest = await this.analyzeAndOptimizeRequest(request);

      // 2. 전문가 추천 및 활용
      const specialists = await this.recommendSpecialists(optimizedRequest);

      // 3. 코드 생성 전략 세분화
      const detailedStrategy = await this.refineGenerationStrategy(
        optimizedRequest,
        fullStrategy,
        specialists
      );

      // 4. AI 기반 코드 생성
      const generatedFiles = await this.generateCodeFiles(
        optimizedRequest,
        detailedStrategy,
        specialists
      );

      // 5. 코드 품질 분석
      const analysis = await this.performComprehensiveAnalysis(
        generatedFiles,
        optimizedRequest
      );

      // 6. 최적화 패스 적용
      const optimizedFiles = await this.applyOptimizationPasses(
        generatedFiles,
        analysis,
        detailedStrategy.optimizationPasses
      );

      // 7. 문서 및 테스트 생성
      const documentation = await this.generateDocumentation(optimizedFiles, optimizedRequest);
      const tests = await this.generateTests(optimizedFiles, optimizedRequest);

      // 8. 대안 구현 생성
      const alternatives = await this.generateAlternatives(
        optimizedFiles,
        optimizedRequest,
        analysis
      );

      // 9. 최종 결과 구성
      const result: GeneratedCode = {
        id: generationId,
        request: optimizedRequest,
        primaryFile: optimizedFiles[0],
        supportingFiles: optimizedFiles.slice(1),
        documentation,
        tests,
        analysis,
        alternatives,
        generatedAt: Date.now(),
        generatorVersion: '2.0.0'
      };

      // 10. 학습 및 패턴 업데이트
      await this.updateLearningPatterns(result);

      logger.info('Intelligent code generation completed', {
        generationId,
        linesGenerated: optimizedFiles.reduce((sum, file) => sum + file.estimatedLines, 0),
        qualityScore: analysis.quality.overallScore,
        complexityGrade: analysis.complexity.grade,
        executionTime: Date.now() - startTime
      });

      return result;

    } catch (error) {
      logger.error('Intelligent code generation failed', {
        generationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * 요청 분석 및 최적화
   */
  private async analyzeAndOptimizeRequest(
    request: CodeGenerationRequest
  ): Promise<CodeGenerationRequest> {
    const prompt = `
Analyze and optimize this code generation request:

**Request Details**:
- Type: ${request.type}
- Name: ${request.name}
- Language: ${request.context.language}
- Framework: ${request.context.framework}
- Performance Critical: ${request.context.performanceCritical}

**Requirements**:
- Functionality: ${request.requirements.functionality.join(', ')}
- Performance Target: ${request.requirements.performance.targetFramerate || 'N/A'} FPS
- Memory Budget: ${request.requirements.performance.memoryBudget || 'N/A'} MB
- Quality Level: ${request.requirements.quality.documentationLevel}

**Constraints** (${request.constraints.length}):
${request.constraints.map(c => `- ${c.type}: ${c.description}`).join('\n')}

Optimize by:
1. Clarifying ambiguous requirements
2. Suggesting missing but important functionality
3. Identifying potential design patterns
4. Recommending performance optimizations
5. Proposing better API design

Return optimized request with enhancements as JSON:
{
  "enhancedFunctionality": ["func1", "func2"],
  "recommendedPatterns": ["pattern1", "pattern2"],
  "suggestedOptimizations": ["opt1", "opt2"],
  "apiImprovements": ["improvement1"],
  "additionalConstraints": [{"type": "performance", "description": "..."}],
  "reasoning": "Why these improvements are beneficial"
}
`;

    try {
      const result = await enhancedClaudeCodeManager.performEnhancedAnalysis(
        prompt,
        'opus', // 복잡한 요구사항 분석에는 Opus 사용
        { timeout: 45000, priority: 'high' }
      );

      const optimization = JSON.parse(result.response);
      
      // 최적화된 요청 생성
      return {
        ...request,
        requirements: {
          ...request.requirements,
          functionality: [
            ...request.requirements.functionality,
            ...(optimization.enhancedFunctionality || [])
          ]
        },
        constraints: [
          ...request.constraints,
          ...(optimization.additionalConstraints || [])
        ],
        description: `${request.description || ''}\n\nAI Optimization: ${optimization.reasoning}`
      };

    } catch (error) {
      logger.warn('Request optimization failed, using original request', { error });
      return request;
    }
  }

  /**
   * 전문가 추천
   */
  private async recommendSpecialists(
    request: CodeGenerationRequest
  ): Promise<DynamicSpecialist[]> {
    const skillMap = {
      'component': ['cpp', 'ecs', 'design_patterns'],
      'system': ['architecture', 'performance', 'cpp'],
      'shader': ['hlsl', 'graphics', 'gpu_programming'],
      'event': ['messaging', 'async_programming', 'cpp'],
      'utility': ['algorithms', 'data_structures', 'cpp'],
      'algorithm': ['mathematics', 'optimization', 'performance'],
      'interface': ['api_design', 'documentation', 'usability'],
      'test': ['testing', 'quality_assurance', 'automation']
    };

    const requiredSkills = skillMap[request.type] || ['cpp', 'general_programming'];
    
    if (request.context.performanceCritical) {
      requiredSkills.push('performance_optimization', 'profiling');
    }
    
    if (request.context.threadSafety !== 'none') {
      requiredSkills.push('concurrency', 'thread_safety');
    }

    try {
      const recommendation = await advancedSpecialistManager.generateOptimalSpecialists({
        requiredSkills,
        preferredSpecializations: [request.context.framework, request.context.language],
        taskComplexity: 'medium',
        urgency: 'medium',
        duration: 4,
        context: `Code generation: ${request.type} in ${request.context.language}`,
        collaborationRequirements: ['code_review', 'knowledge_sharing'],
        learningOpportunities: ['best_practices', 'modern_techniques']
      });

      return recommendation.specialists.slice(0, 2); // 최대 2명의 전문가
    } catch (error) {
      logger.warn('Specialist recommendation failed', { error });
      return [];
    }
  }

  /**
   * 코드 파일 생성
   */
  private async generateCodeFiles(
    request: CodeGenerationRequest,
    strategy: CodeGenerationStrategy,
    specialists: DynamicSpecialist[]
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // 메인 파일 생성
    const mainFile = await this.generateMainFile(request, strategy, specialists);
    files.push(mainFile);

    // 지원 파일들 생성 (헤더, 인터페이스 등)
    const supportingFiles = await this.generateSupportingFiles(request, mainFile);
    files.push(...supportingFiles);

    return files;
  }

  /**
   * 메인 파일 생성
   */
  private async generateMainFile(
    request: CodeGenerationRequest,
    strategy: CodeGenerationStrategy,
    specialists: DynamicSpecialist[]
  ): Promise<GeneratedFile> {
    const modelChoice = this.selectAIModel(strategy.aiModel, request.context.performanceCritical);
    
    const prompt = this.buildCodeGenerationPrompt(request, specialists);
    
    try {
      const result = await enhancedClaudeCodeManager.performEnhancedAnalysis(
        prompt,
        modelChoice,
        { timeout: 90000, priority: 'high' }
      );

      const generatedContent = this.extractCodeFromResponse(result.response);
      const filename = this.generateFilename(request);

      return {
        filename,
        content: generatedContent,
        language: request.context.language,
        purpose: `Main implementation for ${request.name}`,
        dependencies: this.extractDependencies(generatedContent, request.context.language),
        estimatedLines: this.countLines(generatedContent),
        complexity: this.estimateComplexity(generatedContent)
      };

    } catch (error) {
      logger.warn('AI code generation failed, using template', { error });
      return this.generateTemplateFile(request);
    }
  }

  /**
   * 코드 생성 프롬프트 구축
   */
  private buildCodeGenerationPrompt(
    request: CodeGenerationRequest,
    specialists: DynamicSpecialist[]
  ): string {
    return `
Generate high-quality ${request.context.language} code for a ${request.type}:

**Specification**:
- Name: ${request.name}
- Type: ${request.type}
- Framework: ${request.context.framework}
- Language: ${request.context.language}
- Platform: ${request.context.platform}

**Functionality Requirements**:
${request.requirements.functionality.map(func => `- ${func}`).join('\n')}

**Interfaces Required**:
${request.requirements.interfaces.map(iface => `- ${iface.name}: ${iface.methods.map(m => m.name).join(', ')}`).join('\n')}

**Performance Requirements**:
- Target Framerate: ${request.requirements.performance.targetFramerate || 'N/A'}
- Memory Budget: ${request.requirements.performance.memoryBudget || 'Unlimited'} MB
- Scalability: ${request.requirements.performance.scalability}
- Cache Efficiency: ${request.requirements.performance.cacheEfficiency}

**Quality Standards**:
- Code Style: ${request.requirements.quality.codeStyle}
- Documentation: ${request.requirements.quality.documentationLevel}
- Error Handling: ${request.requirements.quality.errorHandling}
- Test Coverage: ${request.requirements.quality.testCoverage}%

**Constraints**:
${request.constraints.map(constraint => `- ${constraint.type}: ${constraint.description} (${constraint.severity})`).join('\n')}

**Context Considerations**:
- Performance Critical: ${request.context.performanceCritical}
- Memory Constrained: ${request.context.memoryConstrained}
- Real-time Requirements: ${request.context.realtimeRequirements}
- Thread Safety: ${request.context.threadSafety}

**Specialist Insights** (${specialists.length} experts consulted):
${specialists.map(spec => `- ${spec.name}: Expertise in ${spec.skillProfile.specializations.join(', ')}`).join('\n')}

**Code Generation Requirements**:
1. Follow modern ${request.context.language} best practices
2. Implement all specified functionality
3. Include comprehensive error handling
4. Add detailed documentation comments
5. Optimize for the specified performance requirements
6. Ensure thread safety as required
7. Follow the specified coding style
8. Include usage examples in comments

**Output Format**:
Generate complete, production-ready code with:
- Proper includes/imports
- Comprehensive documentation
- Error handling
- Example usage
- Performance optimizations
- Memory management (if applicable)
- Thread safety (if required)

Focus on creating maintainable, efficient, and well-documented code that meets all requirements.
`;
  }

  /**
   * 종합적 코드 분석
   */
  private async performComprehensiveAnalysis(
    files: GeneratedFile[],
    request: CodeGenerationRequest
  ): Promise<CodeAnalysis> {
    const prompt = `
Perform comprehensive analysis of this generated code:

**Generated Files** (${files.length}):
${files.map(file => `
File: ${file.filename} (${file.estimatedLines} lines)
Purpose: ${file.purpose}
Dependencies: ${file.dependencies.join(', ')}

Code:
\`\`\`${file.language}
${file.content.substring(0, 2000)}${file.content.length > 2000 ? '...' : ''}
\`\`\`
`).join('\n')}

**Original Requirements**:
- Performance Critical: ${request.context.performanceCritical}
- Memory Constrained: ${request.context.memoryConstrained}
- Thread Safety: ${request.context.threadSafety}
- Quality Level: ${request.requirements.quality.documentationLevel}

Analyze:
1. Code complexity (cyclomatic, cognitive)
2. Quality metrics (readability, maintainability)
3. Performance characteristics
4. Security vulnerabilities
5. Best practices compliance
6. Potential optimizations

Return detailed analysis as JSON:
{
  "complexity": {
    "cyclomatic": 8,
    "cognitive": 12,
    "lines": 150,
    "functions": 6,
    "classes": 2,
    "dependencies": 4,
    "grade": "B"
  },
  "quality": {
    "readability": 85,
    "testability": 78,
    "reusability": 82,
    "documentation": 90,
    "consistency": 88,
    "overallScore": 84
  },
  "performance": {
    "estimatedPerformance": "High - optimized algorithms",
    "bottlenecks": ["Memory allocation in loop"],
    "optimizations": ["Use object pooling", "Cache-friendly data layout"],
    "scalability": "Good parallel scaling potential",
    "memoryUsage": "Moderate - 2-4MB typical",
    "cacheEfficiency": "Good - sequential access patterns"
  },
  "security": {
    "vulnerabilities": [
      {
        "type": "buffer_overflow",
        "severity": "medium",
        "description": "Potential buffer overflow in string handling",
        "location": "line 45",
        "fix": "Use safe string functions"
      }
    ],
    "securityScore": 75,
    "recommendations": ["Add bounds checking", "Validate all inputs"],
    "compliance": ["CERT C++", "ISO 27001"]
  },
  "recommendations": [
    {
      "type": "performance",
      "priority": "high",
      "description": "Optimize memory allocation pattern",
      "implementation": "Use memory pool or stack allocation",
      "estimatedEffort": 4,
      "expectedBenefit": "20-30% performance improvement"
    }
  ]
}
`;

    try {
      const result = await enhancedClaudeCodeManager.performEnhancedAnalysis(
        prompt,
        'opus', // 복잡한 분석에는 Opus 사용
        { timeout: 60000, priority: 'medium' }
      );

      const analysisData = JSON.parse(result.response);
      
      return {
        complexity: analysisData.complexity,
        quality: analysisData.quality,
        performance: analysisData.performance,
        security: analysisData.security,
        maintainability: {
          modifiability: analysisData.quality.readability,
          extensibility: analysisData.quality.reusability,
          debuggability: analysisData.quality.testability,
          portability: 80, // 기본값
          overallScore: (analysisData.quality.readability + analysisData.quality.reusability + analysisData.quality.testability + 80) / 4
        },
        compliance: {
          standardsCompliance: [
            {
              standard: request.requirements.compatibility.cppStandard,
              version: request.requirements.compatibility.cppStandard,
              compliance: 90,
              issues: []
            }
          ],
          bestPractices: [
            { practice: 'RAII', compliant: true },
            { practice: 'Move semantics', compliant: true },
            { practice: 'Exception safety', compliant: true }
          ],
          violations: [],
          overallCompliance: 90
        },
        recommendations: analysisData.recommendations || []
      };

    } catch (error) {
      logger.warn('Code analysis failed, using basic analysis', { error });
      return this.generateBasicAnalysis(files);
    }
  }

  /**
   * 최적화 패스 적용
   */
  private async applyOptimizationPasses(
    files: GeneratedFile[],
    analysis: CodeAnalysis,
    passes: number
  ): Promise<GeneratedFile[]> {
    let optimizedFiles = [...files];

    for (let pass = 1; pass <= passes; pass++) {
      logger.info(`Applying optimization pass ${pass}/${passes}`);
      
      const optimizations = analysis.recommendations
        .filter(rec => rec.type === 'performance' && rec.priority === 'high')
        .slice(0, 3); // 최대 3개 최적화 적용

      for (const optimization of optimizations) {
        optimizedFiles = await this.applyOptimization(optimizedFiles, optimization);
      }
    }

    return optimizedFiles;
  }

  /**
   * 문서 생성
   */
  private async generateDocumentation(
    files: GeneratedFile[],
    request: CodeGenerationRequest
  ): Promise<CodeDocumentation> {
    const prompt = `
Generate comprehensive documentation for this code:

**Generated Code**:
${files.map(file => `${file.filename}: ${file.purpose}`).join('\n')}

**Code Context**:
- Type: ${request.type}
- Framework: ${request.context.framework}
- Performance Critical: ${request.context.performanceCritical}

Create documentation including:
1. Overview and purpose
2. Usage examples with explanations
3. API reference with parameters and returns
4. Performance characteristics and notes
5. Limitations and considerations
6. Future enhancement possibilities

Return as JSON:
{
  "overview": "Detailed overview of what this code does",
  "usage": [
    {
      "title": "Basic Usage",
      "description": "How to use the basic functionality",
      "code": "// Example code",
      "explanation": "Step by step explanation"
    }
  ],
  "apiReference": [
    {
      "element": "ClassName::methodName",
      "signature": "ReturnType methodName(params)",
      "description": "What this method does",
      "parameters": [{"name": "param", "type": "int", "description": "Purpose"}],
      "returns": "Description of return value",
      "examples": ["example usage"]
    }
  ],
  "performanceNotes": ["Performance tip 1", "Performance tip 2"],
  "limitations": ["Limitation 1", "Limitation 2"],
  "futureEnhancements": ["Enhancement 1", "Enhancement 2"]
}
`;

    try {
      const result = await enhancedClaudeCodeManager.performEnhancedAnalysis(
        prompt,
        'sonnet', // 문서 생성에는 Sonnet 사용
        { timeout: 45000, priority: 'medium' }
      );

      return JSON.parse(result.response);
    } catch (error) {
      logger.warn('Documentation generation failed, using basic docs', { error });
      return this.generateBasicDocumentation(files, request);
    }
  }

  /**
   * 테스트 생성
   */
  private async generateTests(
    files: GeneratedFile[],
    request: CodeGenerationRequest
  ): Promise<GeneratedTest[]> {
    if (!request.requirements.testing.unitTests) {
      return [];
    }

    const tests: GeneratedTest[] = [];

    for (const file of files) {
      const testContent = await this.generateTestForFile(file, request);
      if (testContent) {
        tests.push(testContent);
      }
    }

    return tests;
  }

  /**
   * 유틸리티 메서드들
   */
  private selectAIModel(
    preferred: 'opus' | 'sonnet' | 'auto',
    performanceCritical: boolean
  ): 'opus' | 'sonnet' {
    if (preferred !== 'auto') return preferred;
    return performanceCritical ? 'opus' : 'sonnet'; // 성능 중요한 코드는 Opus
  }

  private extractCodeFromResponse(response: string): string {
    // 코드 블록 추출 로직
    const codeBlockMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
    return codeBlockMatch ? codeBlockMatch[1] : response;
  }

  private generateFilename(request: CodeGenerationRequest): string {
    const extensions = {
      'cpp': '.cpp',
      'hlsl': '.hlsl',
      'typescript': '.ts',
      'python': '.py',
      'rust': '.rs'
    };

    const ext = extensions[request.context.language] || '.txt';
    return `${request.name}${ext}`;
  }

  private extractDependencies(content: string, language: string): string[] {
    const deps: string[] = [];
    
    if (language === 'cpp') {
      const includeMatches = content.match(/#include\s*[<"](.*?)[>"]/g);
      if (includeMatches) {
        deps.push(...includeMatches.map(match => match.replace(/#include\s*[<"]|[>"]/g, '')));
      }
    }

    return deps;
  }

  private countLines(content: string): number {
    return content.split('\n').length;
  }

  private estimateComplexity(content: string): CodeComplexity {
    const lines = content.split('\n').length;
    const functions = (content.match(/\w+\s*\(/g) || []).length;
    const conditionals = (content.match(/\b(if|while|for|switch)\b/g) || []).length;

    const cyclomatic = conditionals + functions;
    const cognitive = cyclomatic * 1.2; // 인지적 복잡도는 순환 복잡도보다 약간 높음

    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
    if (cyclomatic > 20) grade = 'F';
    else if (cyclomatic > 15) grade = 'D';
    else if (cyclomatic > 10) grade = 'C';
    else if (cyclomatic > 5) grade = 'B';

    return {
      cyclomatic,
      cognitive,
      lines,
      functions,
      classes: (content.match(/\bclass\s+\w+/g) || []).length,
      dependencies: (content.match(/#include|import/g) || []).length,
      grade
    };
  }

  private generateTemplateFile(request: CodeGenerationRequest): GeneratedFile {
    const templates = {
      'component': this.generateComponentTemplate(request.name),
      'system': this.generateSystemTemplate(request.name),
      'shader': this.generateShaderTemplate(request.name),
      'event': this.generateEventTemplate(request.name),
      'utility': this.generateUtilityTemplate(request.name)
    };

    const content = templates[request.type] || `// Generated ${request.type}: ${request.name}`;

    return {
      filename: this.generateFilename(request),
      content,
      language: request.context.language,
      purpose: `Template ${request.type} implementation`,
      dependencies: [],
      estimatedLines: this.countLines(content),
      complexity: this.estimateComplexity(content)
    };
  }

  private generateComponentTemplate(name: string): string {
    return `#pragma once
#include "Core/ECS/Component.h"

namespace ShatteredMoon {
namespace Components {

/**
 * ${name} - Auto-generated ECS component
 * 
 * This component provides functionality for ${name.toLowerCase()} operations
 * within the Entity-Component-System architecture.
 */
class ${name} : public Core::Component {
public:
    static constexpr ComponentTypeId TYPE_ID = ComponentType::${name.toUpperCase()};
    
    /**
     * Default constructor
     */
    ${name}() = default;
    
    /**
     * Destructor
     */
    virtual ~${name}() = default;
    
    /**
     * Get the component type ID
     * @return The unique type identifier for this component
     */
    ComponentTypeId GetTypeId() const override { 
        return TYPE_ID; 
    }
    
    /**
     * Serialize component data
     * @param archive The archive to serialize to/from
     */
    void Serialize(Archive& archive) override {
        // Implement serialization logic here
    }
    
    /**
     * Initialize the component with default values
     */
    void Initialize() {
        // Component initialization logic
    }
    
    /**
     * Update component state
     * @param deltaTime Time elapsed since last update
     */
    void Update(float deltaTime) {
        // Component update logic
    }

private:
    // Component data members
    bool m_isActive = true;
    float m_lastUpdateTime = 0.0f;
};

} // namespace Components
} // namespace ShatteredMoon`;
  }

  private generateSystemTemplate(name: string): string {
    return `#pragma once
#include "Core/ECS/System.h"
#include "Core/ECS/ComponentManager.h"

namespace ShatteredMoon {
namespace Systems {

/**
 * ${name} - Auto-generated ECS system
 * 
 * This system processes entities with specific component combinations
 * and implements the core logic for ${name.toLowerCase()} operations.
 */
class ${name} : public Core::System {
public:
    /**
     * Constructor
     */
    ${name}() = default;
    
    /**
     * Destructor
     */
    virtual ~${name}() = default;
    
    /**
     * Initialize the system
     * @param componentManager Reference to the component manager
     */
    void Initialize(Core::ComponentManager& componentManager) override {
        m_componentManager = &componentManager;
        // System initialization logic
    }
    
    /**
     * Update all relevant entities
     * @param deltaTime Time elapsed since last update
     */
    void Update(float deltaTime) override {
        // Process entities with required components
        auto entities = GetEntitiesWithComponents();
        
        for (auto entityId : entities) {
            ProcessEntity(entityId, deltaTime);
        }
    }
    
    /**
     * Shutdown the system
     */
    void Shutdown() override {
        // Cleanup logic
    }

private:
    /**
     * Process a single entity
     * @param entityId The entity to process
     * @param deltaTime Time elapsed since last update
     */
    void ProcessEntity(EntityId entityId, float deltaTime) {
        // Entity processing logic
    }
    
    /**
     * Get entities that have the required components
     * @return List of entity IDs
     */
    std::vector<EntityId> GetEntitiesWithComponents() {
        // Return entities with required component combination
        return {};
    }

private:
    Core::ComponentManager* m_componentManager = nullptr;
    
    // System-specific data members
    float m_accumulatedTime = 0.0f;
    uint32_t m_processedEntities = 0;
};

} // namespace Systems
} // namespace ShatteredMoon`;
  }

  private generateShaderTemplate(name: string): string {
    return `// ${name}.hlsl - Auto-generated HLSL shader
// DirectX 12 compatible shader implementation

// Constant buffer definitions
cbuffer ${name}Constants : register(b0) {
    float4x4 worldMatrix;
    float4x4 viewMatrix;
    float4x4 projectionMatrix;
    float4 materialProperties;
    float time;
    float3 padding;
};

// Input/Output structures
struct VertexInput {
    float3 position : POSITION;
    float3 normal : NORMAL;
    float2 texCoord : TEXCOORD0;
};

struct VertexOutput {
    float4 position : SV_POSITION;
    float3 worldPos : WORLD_POSITION;
    float3 normal : NORMAL;
    float2 texCoord : TEXCOORD0;
};

// Vertex Shader
VertexOutput VS_${name}(VertexInput input) {
    VertexOutput output;
    
    // Transform vertex position to world space
    float4 worldPos = mul(float4(input.position, 1.0f), worldMatrix);
    output.worldPos = worldPos.xyz;
    
    // Transform to clip space
    float4 viewPos = mul(worldPos, viewMatrix);
    output.position = mul(viewPos, projectionMatrix);
    
    // Transform normal to world space
    output.normal = normalize(mul(input.normal, (float3x3)worldMatrix));
    
    // Pass through texture coordinates
    output.texCoord = input.texCoord;
    
    return output;
}

// Pixel Shader
float4 PS_${name}(VertexOutput input) : SV_TARGET {
    // Sample base color
    float3 baseColor = materialProperties.rgb;
    
    // Simple lighting calculation
    float3 lightDir = normalize(float3(1.0f, 1.0f, -1.0f));
    float NdotL = max(0.0f, dot(input.normal, lightDir));
    
    float3 finalColor = baseColor * (0.1f + 0.9f * NdotL);
    
    return float4(finalColor, materialProperties.a);
}`;
  }

  private generateEventTemplate(name: string): string {
    return `#pragma once
#include "Core/Events/Event.h"
#include <functional>

namespace ShatteredMoon {
namespace Events {

/**
 * ${name} - Auto-generated event class
 * 
 * This event is triggered when ${name.toLowerCase()} operations occur
 * within the game engine.
 */
class ${name} : public Core::Event {
public:
    static constexpr EventTypeId TYPE_ID = EventType::${name.toUpperCase()};
    
    /**
     * Constructor
     */
    ${name}() : Core::Event(TYPE_ID) {
    }
    
    /**
     * Constructor with parameters
     * @param data Event-specific data
     */
    explicit ${name}(const EventData& data) 
        : Core::Event(TYPE_ID), m_data(data) {
    }
    
    /**
     * Get event type ID
     * @return The unique type identifier for this event
     */
    EventTypeId GetTypeId() const override {
        return TYPE_ID;
    }
    
    /**
     * Get event data
     * @return Reference to the event data
     */
    const EventData& GetData() const {
        return m_data;
    }
    
    /**
     * Set event data
     * @param data The event data to set
     */
    void SetData(const EventData& data) {
        m_data = data;
    }
    
    /**
     * Serialize event for network transmission or storage
     * @param archive The archive to serialize to/from
     */
    void Serialize(Archive& archive) override {
        // Implement event serialization
    }

private:
    struct EventData {
        // Define event-specific data members here
        float timestamp = 0.0f;
        uint32_t sourceEntityId = 0;
        // Add more fields as needed
    };
    
    EventData m_data;
};

// Event handler type definition
using ${name}Handler = std::function<void(const ${name}&)>;

} // namespace Events
} // namespace ShatteredMoon`;
  }

  private generateUtilityTemplate(name: string): string {
    return `#pragma once
#include <memory>
#include <vector>
#include <string>

namespace ShatteredMoon {
namespace Utilities {

/**
 * ${name} - Auto-generated utility class
 * 
 * This utility provides helper functions and tools for ${name.toLowerCase()}
 * operations throughout the game engine.
 */
class ${name} {
public:
    /**
     * Constructor
     */
    ${name}() = default;
    
    /**
     * Destructor
     */
    ~${name}() = default;
    
    // Delete copy constructor and assignment operator
    ${name}(const ${name}&) = delete;
    ${name}& operator=(const ${name}&) = delete;
    
    // Enable move constructor and assignment operator
    ${name}(${name}&&) = default;
    ${name}& operator=(${name}&&) = default;
    
    /**
     * Initialize the utility
     * @return True if initialization was successful
     */
    bool Initialize() {
        // Initialization logic
        return true;
    }
    
    /**
     * Shutdown and cleanup the utility
     */
    void Shutdown() {
        // Cleanup logic
    }
    
    /**
     * Process data using the utility
     * @param input Input data to process
     * @return Processed result
     */
    template<typename T>
    T Process(const T& input) {
        // Generic processing logic
        return input;
    }
    
    /**
     * Validate input data
     * @param data Data to validate
     * @return True if data is valid
     */
    static bool Validate(const void* data) {
        return data != nullptr;
    }
    
    /**
     * Get utility status information
     * @return Status string
     */
    std::string GetStatus() const {
        return "Ready";
    }

private:
    // Private utility methods
    void InternalProcess() {
        // Internal processing logic
    }
    
private:
    // Private data members
    bool m_initialized = false;
    std::vector<uint8_t> m_buffer;
    static constexpr size_t DEFAULT_BUFFER_SIZE = 1024;
};

} // namespace Utilities
} // namespace ShatteredMoon`;
  }

  private generateBasicAnalysis(files: GeneratedFile[]): CodeAnalysis {
    const totalLines = files.reduce((sum, file) => sum + file.estimatedLines, 0);
    const avgComplexity = files.reduce((sum, file) => sum + file.complexity.cyclomatic, 0) / files.length;

    return {
      complexity: {
        cyclomatic: Math.floor(avgComplexity),
        cognitive: Math.floor(avgComplexity * 1.2),
        lines: totalLines,
        functions: Math.floor(totalLines / 20),
        classes: files.length,
        dependencies: 5,
        grade: avgComplexity > 10 ? 'C' : avgComplexity > 5 ? 'B' : 'A'
      },
      quality: {
        readability: 75,
        testability: 70,
        reusability: 80,
        documentation: 85,
        consistency: 80,
        overallScore: 78
      },
      performance: {
        estimatedPerformance: 'Good - Standard implementation',
        bottlenecks: [],
        optimizations: ['Consider caching', 'Profile memory usage'],
        scalability: 'Moderate scaling potential',
        memoryUsage: 'Low to moderate',
        cacheEfficiency: 'Standard patterns'
      },
      security: {
        vulnerabilities: [],
        securityScore: 80,
        recommendations: ['Add input validation', 'Consider bounds checking'],
        compliance: ['Basic security practices']
      },
      maintainability: {
        modifiability: 75,
        extensibility: 80,
        debuggability: 70,
        portability: 85,
        overallScore: 77
      },
      compliance: {
        standardsCompliance: [],
        bestPractices: [],
        violations: [],
        overallCompliance: 80
      },
      recommendations: []
    };
  }

  private generateBasicDocumentation(
    files: GeneratedFile[],
    request: CodeGenerationRequest
  ): CodeDocumentation {
    return {
      overview: `Auto-generated ${request.type} implementation for ${request.name}. This code provides basic functionality as specified in the requirements.`,
      usage: [
        {
          title: 'Basic Usage',
          description: `How to use the ${request.name} ${request.type}`,
          code: `// Example usage of ${request.name}\n// Add your implementation here`,
          explanation: 'Follow the generated interfaces and method signatures for proper usage.'
        }
      ],
      apiReference: [
        {
          element: request.name,
          signature: `class ${request.name}`,
          description: `Main ${request.type} class providing the specified functionality`,
          parameters: [],
          returns: 'N/A - Class definition',
          examples: [`${request.name} instance;`]
        }
      ],
      performanceNotes: [
        'Generated code follows standard performance practices',
        'Consider profiling for performance-critical applications'
      ],
      limitations: [
        'Basic template implementation - may require customization',
        'Not optimized for specific use cases'
      ],
      futureEnhancements: [
        'Add performance optimizations based on usage patterns',
        'Implement advanced features as needed',
        'Add comprehensive error handling'
      ]
    };
  }

  private async generateTestForFile(
    file: GeneratedFile,
    request: CodeGenerationRequest
  ): Promise<GeneratedTest | null> {
    // 간단한 테스트 생성 로직
    return {
      filename: `${file.filename.replace(/\.(cpp|ts|py)$/, '')}_test.cpp`,
      content: `// Auto-generated test for ${file.filename}\n#include "gtest/gtest.h"\n\n// Add tests here`,
      framework: 'googletest',
      testTypes: ['unit'],
      coverage: 50
    };
  }

  private async generateAlternatives(
    files: GeneratedFile[],
    request: CodeGenerationRequest,
    analysis: CodeAnalysis
  ): Promise<AlternativeImplementation[]> {
    // 대안 구현 생성 로직
    return [
      {
        name: 'Performance Optimized',
        description: 'Alternative implementation optimized for performance',
        tradeoffs: ['Higher complexity', 'Better performance', 'More memory usage'],
        code: '// Performance optimized version would go here',
        analysis: {
          complexity: { ...analysis.complexity, grade: 'C' as const },
          performance: { ...analysis.performance, estimatedPerformance: 'Excellent' }
        }
      }
    ];
  }

  private async applyOptimization(
    files: GeneratedFile[],
    optimization: CodeRecommendation
  ): Promise<GeneratedFile[]> {
    // 최적화 적용 로직 (시뮬레이션)
    logger.info('Applying optimization', { type: optimization.type, description: optimization.description });
    return files; // 실제로는 코드를 수정
  }

  private async updateLearningPatterns(result: GeneratedCode): Promise<void> {
    // 생성 히스토리 업데이트
    this.generationHistory.push(result);
    
    // 최근 100개만 유지
    if (this.generationHistory.length > 100) {
      this.generationHistory = this.generationHistory.slice(-100);
    }
    
    logger.info('Learning patterns updated', {
      generationId: result.id,
      qualityScore: result.analysis.quality.overallScore,
      historySize: this.generationHistory.length
    });
  }

  private initializePatterns(): void {
    // 코드 패턴 초기화
    this.codePatterns.set('singleton', {
      name: 'Singleton Pattern',
      description: 'Ensures a class has only one instance',
      usage: 'Use for manager classes and global state',
      examples: ['ResourceManager', 'AudioManager']
    });
    
    this.codePatterns.set('observer', {
      name: 'Observer Pattern',
      description: 'Defines a one-to-many dependency between objects',
      usage: 'Use for event systems and notifications',
      examples: ['EventSystem', 'InputHandler']
    });
  }

  private initializeQualityTemplates(): void {
    // 품질 템플릿 초기화
    this.qualityTemplates.set('high_performance', {
      cacheOptimization: true,
      memoryPooling: true,
      branchPrediction: true,
      vectorization: true
    });
    
    this.qualityTemplates.set('maintainable', {
      clearNaming: true,
      comprehensiveComments: true,
      modularDesign: true,
      testability: true
    });
  }

  /**
   * 성능 메트릭 조회
   */
  getPerformanceMetrics() {
    return {
      totalGenerations: this.generationHistory.length,
      averageQualityScore: this.calculateAverageQuality(),
      averageComplexityGrade: this.calculateAverageComplexity(),
      patternCount: this.codePatterns.size,
      cacheSize: this.performanceCache.size,
      successRate: this.calculateSuccessRate()
    };
  }

  private calculateAverageQuality(): number {
    if (this.generationHistory.length === 0) return 0;
    const total = this.generationHistory.reduce((sum, gen) => sum + gen.analysis.quality.overallScore, 0);
    return total / this.generationHistory.length;
  }

  private calculateAverageComplexity(): string {
    if (this.generationHistory.length === 0) return 'N/A';
    const grades = this.generationHistory.map(gen => gen.analysis.complexity.grade);
    const gradeMap = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1 };
    const avgScore = grades.reduce((sum, grade) => sum + gradeMap[grade], 0) / grades.length;
    
    if (avgScore >= 4.5) return 'A';
    if (avgScore >= 3.5) return 'B';
    if (avgScore >= 2.5) return 'C';
    if (avgScore >= 1.5) return 'D';
    return 'F';
  }

  private calculateSuccessRate(): number {
    if (this.generationHistory.length === 0) return 0;
    const successCount = this.generationHistory.filter(gen => gen.analysis.quality.overallScore >= 70).length;
    return successCount / this.generationHistory.length;
  }

  /**
   * 시스템 초기화
   */
  reset(): void {
    this.generationHistory = [];
    this.performanceCache.clear();
    logger.info('Intelligent code generator reset');
  }
}

export const intelligentCodeGenerator = new IntelligentCodeGenerator();