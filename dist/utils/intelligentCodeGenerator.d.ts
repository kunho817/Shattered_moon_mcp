/**
 * 지능형 코드 생성 시스템
 * AI 기반 고급 코드 생성, 품질 분석, 최적화 및 맞춤화
 */
export interface CodeGenerationRequest {
    id: string;
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
    targetFramerate?: number;
    maxLatency?: number;
    memoryBudget?: number;
    cpuBudget?: number;
    scalability: 'single_core' | 'multi_core' | 'gpu_accelerated';
    cacheEfficiency: 'low' | 'medium' | 'high' | 'critical';
}
export interface QualityRequirement {
    codeStyle: 'google' | 'microsoft' | 'llvm' | 'custom';
    documentationLevel: 'minimal' | 'standard' | 'comprehensive';
    testCoverage: number;
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
    modernFeatures: boolean;
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
    readability: number;
    testability: number;
    reusability: number;
    documentation: number;
    consistency: number;
    overallScore: number;
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
    securityScore: number;
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
    modifiability: number;
    extensibility: number;
    debuggability: number;
    portability: number;
    overallScore: number;
}
export interface ComplianceReport {
    standardsCompliance: StandardCompliance[];
    bestPractices: BestPracticeCheck[];
    violations: ComplianceViolation[];
    overallCompliance: number;
}
export interface StandardCompliance {
    standard: string;
    version: string;
    compliance: number;
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
    estimatedEffort: number;
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
declare class IntelligentCodeGenerator {
    private generationHistory;
    private codePatterns;
    private qualityTemplates;
    private performanceCache;
    constructor();
    /**
     * 메인 지능형 코드 생성 함수
     */
    generateIntelligentCode(request: CodeGenerationRequest, strategy?: Partial<CodeGenerationStrategy>): Promise<GeneratedCode>;
    /**
     * 요청 분석 및 최적화
     */
    private analyzeAndOptimizeRequest;
    /**
     * 전문가 추천
     */
    private recommendSpecialists;
    /**
     * 코드 파일 생성
     */
    private generateCodeFiles;
    /**
     * 메인 파일 생성
     */
    private generateMainFile;
    /**
     * 코드 생성 프롬프트 구축
     */
    private buildCodeGenerationPrompt;
    /**
     * 종합적 코드 분석
     */
    private performComprehensiveAnalysis;
    /**
     * 최적화 패스 적용
     */
    private applyOptimizationPasses;
    /**
     * 문서 생성
     */
    private generateDocumentation;
    /**
     * 테스트 생성
     */
    private generateTests;
    /**
     * 유틸리티 메서드들
     */
    private selectAIModel;
    private extractCodeFromResponse;
    private generateFilename;
    private extractDependencies;
    private countLines;
    private estimateComplexity;
    private generateTemplateFile;
    private generateComponentTemplate;
    private generateSystemTemplate;
    private generateShaderTemplate;
    private generateEventTemplate;
    private generateUtilityTemplate;
    private generateBasicAnalysis;
    private generateBasicDocumentation;
    private generateTestForFile;
    private generateAlternatives;
    private applyOptimization;
    private updateLearningPatterns;
    private initializePatterns;
    private initializeQualityTemplates;
    /**
     * 성능 메트릭 조회
     */
    getPerformanceMetrics(): {
        totalGenerations: number;
        averageQualityScore: number;
        averageComplexityGrade: string;
        patternCount: number;
        cacheSize: number;
        successRate: number;
    };
    private calculateAverageQuality;
    private calculateAverageComplexity;
    private calculateSuccessRate;
    /**
     * 시스템 초기화
     */
    reset(): void;
    /**
     * Refine generation strategy with detailed planning
     */
    private refineGenerationStrategy;
    /**
     * Generate supporting files for the code
     */
    private generateSupportingFiles;
}
export declare const intelligentCodeGenerator: IntelligentCodeGenerator;
export {};
//# sourceMappingURL=intelligentCodeGenerator.d.ts.map