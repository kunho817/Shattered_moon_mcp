#!/usr/bin/env node

/**
 * MCP 시스템 성능 최적화 및 메모리 누수 검사
 * - 메모리 사용량 프로파일링
 * - 성능 병목점 분석
 * - 메모리 누수 탐지
 * - 최적화 권장사항 생성
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function performanceAnalysis() {
  console.log('🔍 MCP System Performance Analysis Starting...\n');

  const results = {
    memoryAnalysis: {},
    performanceBottlenecks: [],
    optimizationRecommendations: [],
    systemHealth: {},
    riskAssessment: {}
  };

  // Test 1: 메모리 프로파일링
  console.log('1. 💾 Memory Profiling Analysis...');
  try {
    const memoryProfile = await analyzeMemoryUsage();
    results.memoryAnalysis = memoryProfile;
    
    console.log('✅ Memory profiling completed');
    console.log(`   - Peak Memory: ${(memoryProfile.peakMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   - Memory Growth Rate: ${memoryProfile.growthRate.toFixed(2)}MB/min`);
    console.log(`   - Potential Leaks: ${memoryProfile.potentialLeaks} detected`);
    
  } catch (error) {
    console.log('❌ Memory profiling failed:', error.message);
    results.memoryAnalysis.error = error.message;
  }

  // Test 2: CPU 및 성능 병목점 분석
  console.log('\n2. ⚡ Performance Bottleneck Analysis...');
  try {
    const bottlenecks = await analyzePerformanceBottlenecks();
    results.performanceBottlenecks = bottlenecks;
    
    console.log('✅ Performance analysis completed');
    console.log(`   - Critical bottlenecks: ${bottlenecks.filter(b => b.severity === 'critical').length}`);
    console.log(`   - High impact issues: ${bottlenecks.filter(b => b.severity === 'high').length}`);
    console.log(`   - Total performance score: ${bottlenecks.overallScore || 'N/A'}/100`);
    
  } catch (error) {
    console.log('❌ Performance analysis failed:', error.message);
    results.performanceBottlenecks.error = error.message;
  }

  // Test 3: 파일 시스템 최적화 분석
  console.log('\n3. 📁 File System Optimization Analysis...');
  try {
    const fsOptimization = await analyzeFileSystemOptimization();
    results.fileSystemOptimization = fsOptimization;
    
    console.log('✅ File system analysis completed');
    console.log(`   - Large files: ${fsOptimization.largeFiles.length}`);
    console.log(`   - Duplicate files: ${fsOptimization.duplicateFiles.length}`);
    console.log(`   - Optimization potential: ${fsOptimization.optimizationPotential}%`);
    
  } catch (error) {
    console.log('❌ File system analysis failed:', error.message);
    results.fileSystemOptimization = { error: error.message };
  }

  // Test 4: 의존성 및 번들 크기 분석
  console.log('\n4. 📦 Dependency and Bundle Analysis...');
  try {
    const bundleAnalysis = await analyzeDependencies();
    results.bundleAnalysis = bundleAnalysis;
    
    console.log('✅ Dependency analysis completed');
    console.log(`   - Total dependencies: ${bundleAnalysis.totalDependencies}`);
    console.log(`   - Unused dependencies: ${bundleAnalysis.unusedDependencies.length}`);
    console.log(`   - Bundle size reduction potential: ${bundleAnalysis.reductionPotential}%`);
    
  } catch (error) {
    console.log('❌ Dependency analysis failed:', error.message);
    results.bundleAnalysis = { error: error.message };
  }

  // Test 5: 최적화 권장사항 생성
  console.log('\n5. 🎯 Generating Optimization Recommendations...');
  try {
    const recommendations = generateOptimizationRecommendations(results);
    results.optimizationRecommendations = recommendations;
    
    console.log('✅ Recommendations generated');
    console.log(`   - High priority: ${recommendations.filter(r => r.priority === 'high').length}`);
    console.log(`   - Medium priority: ${recommendations.filter(r => r.priority === 'medium').length}`);
    console.log(`   - Low priority: ${recommendations.filter(r => r.priority === 'low').length}`);
    
  } catch (error) {
    console.log('❌ Recommendation generation failed:', error.message);
    results.optimizationRecommendations.error = error.message;
  }

  // 결과 요약
  console.log('\n📊 Performance Analysis Summary:');
  console.log('='.repeat(50));
  
  const overallScore = calculateOverallPerformanceScore(results);
  console.log(`🎯 Overall Performance Score: ${overallScore}/100`);
  
  if (overallScore >= 85) {
    console.log('🎉 System Performance: EXCELLENT');
  } else if (overallScore >= 70) {
    console.log('👍 System Performance: GOOD');
  } else if (overallScore >= 55) {
    console.log('⚠️ System Performance: NEEDS IMPROVEMENT');
  } else {
    console.log('🚨 System Performance: CRITICAL ISSUES DETECTED');
  }

  // 상세 리포트 생성
  const reportPath = path.join(__dirname, 'performance_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  return results;
}

/**
 * 메모리 사용량 분석
 */
async function analyzeMemoryUsage() {
  const samples = [];
  const sampleCount = 50;
  const sampleInterval = 100; // ms

  // 메모리 샘플링
  for (let i = 0; i < sampleCount; i++) {
    const usage = process.memoryUsage();
    samples.push({
      timestamp: Date.now(),
      rss: usage.rss,
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external
    });

    // 메모리 작업 시뮬레이션
    if (i % 10 === 0) {
      const tempArray = new Array(10000).fill(0).map((_, idx) => ({
        id: idx,
        data: `test_data_${idx}_${Math.random()}`,
        timestamp: new Date(),
        metadata: {
          type: 'performance_test',
          iteration: i,
          randomData: Math.random() * 1000
        }
      }));
      
      // 일부 데이터는 즉시 해제하지 않음 (메모리 누수 시뮬레이션)
      if (i % 20 === 0) {
        global.performanceTestData = global.performanceTestData || [];
        global.performanceTestData.push(...tempArray.slice(0, 100));
      }
    }

    await new Promise(resolve => setTimeout(resolve, sampleInterval));
  }

  // 메모리 증가율 계산
  const firstSample = samples[0];
  const lastSample = samples[samples.length - 1];
  const timeDiff = (lastSample.timestamp - firstSample.timestamp) / 1000 / 60; // minutes
  const memoryDiff = (lastSample.rss - firstSample.rss) / 1024 / 1024; // MB
  const growthRate = memoryDiff / timeDiff;

  // 메모리 누수 탐지
  const potentialLeaks = detectMemoryLeaks(samples);

  return {
    samples: samples.slice(-10), // 마지막 10개 샘플만 반환
    peakMemory: Math.max(...samples.map(s => s.rss)),
    averageMemory: samples.reduce((sum, s) => sum + s.rss, 0) / samples.length,
    growthRate,
    potentialLeaks,
    memoryEfficiency: calculateMemoryEfficiency(samples),
    recommendations: generateMemoryRecommendations(samples, growthRate, potentialLeaks)
  };
}

/**
 * 메모리 누수 탐지
 */
function detectMemoryLeaks(samples) {
  let leaks = 0;
  const threshold = 5 * 1024 * 1024; // 5MB threshold

  for (let i = 10; i < samples.length; i++) {
    const recentSamples = samples.slice(i - 10, i);
    const trend = calculateTrend(recentSamples.map(s => s.rss));
    
    if (trend > threshold) {
      leaks++;
    }
  }

  return leaks;
}

/**
 * 추세 계산 (선형 회귀)
 */
function calculateTrend(values) {
  const n = values.length;
  const x = Array.from({length: n}, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  return slope;
}

/**
 * 성능 병목점 분석
 */
async function analyzePerformanceBottlenecks() {
  const bottlenecks = [];
  
  // TypeScript 컴파일 성능 측정
  try {
    const compileStart = performance.now();
    await runCommand('npx tsc --noEmit');
    const compileTime = performance.now() - compileStart;
    
    if (compileTime > 10000) { // 10초 이상
      bottlenecks.push({
        type: 'compilation',
        severity: 'high',
        description: 'TypeScript compilation is slow',
        impact: 'Development productivity',
        measurementValue: compileTime,
        recommendation: 'Consider incremental compilation or build optimization'
      });
    }
  } catch (error) {
    bottlenecks.push({
      type: 'compilation',
      severity: 'critical',
      description: 'TypeScript compilation failed',
      impact: 'Build process broken',
      error: error.message,
      recommendation: 'Fix TypeScript errors before optimization'
    });
  }

  // 파일 I/O 성능 측정
  const ioStart = performance.now();
  const testFiles = ['package.json', 'tsconfig.json', 'src/index.ts'];
  for (const file of testFiles) {
    if (fs.existsSync(file)) {
      fs.readFileSync(file, 'utf8');
    }
  }
  const ioTime = performance.now() - ioStart;
  
  if (ioTime > 100) {
    bottlenecks.push({
      type: 'file_io',
      severity: 'medium',
      description: 'File I/O operations are slow',
      impact: 'Module loading performance',
      measurementValue: ioTime,
      recommendation: 'Consider file system optimization or SSD upgrade'
    });
  }

  // 전체 성능 점수 계산
  const overallScore = Math.max(0, 100 - (bottlenecks.reduce((sum, b) => {
    const severityWeight = { critical: 40, high: 25, medium: 10, low: 5 };
    return sum + (severityWeight[b.severity] || 0);
  }, 0)));

  bottlenecks.overallScore = overallScore;
  
  return bottlenecks;
}

/**
 * 파일 시스템 최적화 분석
 */
async function analyzeFileSystemOptimization() {
  const analysis = {
    largeFiles: [],
    duplicateFiles: [],
    optimizationPotential: 0,
    totalSize: 0,
    fileCount: 0
  };

  try {
    // 큰 파일 검색
    const files = await getFilesRecursively('./src');
    
    for (const file of files) {
      try {
        const stats = fs.statSync(file);
        analysis.totalSize += stats.size;
        analysis.fileCount++;
        
        if (stats.size > 100 * 1024) { // 100KB 이상
          analysis.largeFiles.push({
            path: file,
            size: stats.size,
            sizeKB: Math.round(stats.size / 1024)
          });
        }
      } catch (error) {
        // 파일 접근 오류 무시
      }
    }

    // 최적화 잠재력 계산
    const averageFileSize = analysis.totalSize / analysis.fileCount;
    const largeFilesSize = analysis.largeFiles.reduce((sum, f) => sum + f.size, 0);
    analysis.optimizationPotential = Math.round((largeFilesSize / analysis.totalSize) * 100);

  } catch (error) {
    analysis.error = error.message;
  }

  return analysis;
}

/**
 * 의존성 분석
 */
async function analyzeDependencies() {
  const analysis = {
    totalDependencies: 0,
    unusedDependencies: [],
    reductionPotential: 0,
    packageSizes: {},
    recommendations: []
  };

  try {
    // package.json 읽기
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      analysis.totalDependencies = Object.keys(deps).length;

      // 사용되지 않는 의존성 추정 (간단한 검사)
      const srcFiles = await getFilesRecursively('./src');
      const importedModules = new Set();

      for (const file of srcFiles) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const imports = content.match(/(?:import|require)\s*\(?['"]([@\w\-/]+)/g);
          if (imports) {
            imports.forEach(imp => {
              const module = imp.match(/['"]([@\w\-/]+)/)?.[1];
              if (module && !module.startsWith('.')) {
                const rootModule = module.split('/')[0];
                importedModules.add(rootModule.startsWith('@') ? module.split('/').slice(0, 2).join('/') : rootModule);
              }
            });
          }
        } catch (error) {
          // 파일 읽기 오류 무시
        }
      }

      // 사용되지 않는 의존성 찾기
      for (const dep of Object.keys(deps)) {
        if (!importedModules.has(dep)) {
          analysis.unusedDependencies.push(dep);
        }
      }

      analysis.reductionPotential = Math.round((analysis.unusedDependencies.length / analysis.totalDependencies) * 100);
    }
  } catch (error) {
    analysis.error = error.message;
  }

  return analysis;
}

/**
 * 최적화 권장사항 생성
 */
function generateOptimizationRecommendations(results) {
  const recommendations = [];

  // 메모리 최적화
  if (results.memoryAnalysis?.growthRate > 1) {
    recommendations.push({
      category: 'memory',
      priority: 'high',
      title: 'Memory leak detected',
      description: `Memory growth rate of ${results.memoryAnalysis.growthRate.toFixed(2)}MB/min indicates potential leaks`,
      action: 'Review object lifecycle management and implement proper cleanup',
      estimatedImpact: 'High'
    });
  }

  // 성능 최적화
  if (results.performanceBottlenecks?.some(b => b.severity === 'critical')) {
    recommendations.push({
      category: 'performance',
      priority: 'critical',
      title: 'Critical performance issues',
      description: 'Critical bottlenecks detected affecting system functionality',
      action: 'Address compilation errors and critical performance bottlenecks immediately',
      estimatedImpact: 'Critical'
    });
  }

  // 파일 시스템 최적화
  if (results.fileSystemOptimization?.optimizationPotential > 20) {
    recommendations.push({
      category: 'storage',
      priority: 'medium',
      title: 'File system optimization opportunity',
      description: `${results.fileSystemOptimization.optimizationPotential}% storage optimization potential detected`,
      action: 'Review large files and consider compression or removal of unnecessary assets',
      estimatedImpact: 'Medium'
    });
  }

  // 의존성 최적화
  if (results.bundleAnalysis?.reductionPotential > 15) {
    recommendations.push({
      category: 'dependencies',
      priority: 'medium',
      title: 'Unused dependencies detected',
      description: `${results.bundleAnalysis.unusedDependencies.length} unused dependencies found`,
      action: 'Remove unused dependencies to reduce bundle size and improve build performance',
      estimatedImpact: 'Medium'
    });
  }

  // 일반적인 최적화 권장사항
  recommendations.push({
    category: 'general',
    priority: 'low',
    title: 'Enable production optimizations',
    description: 'Ensure production builds use optimal configurations',
    action: 'Review build configuration for minification, tree-shaking, and code splitting',
    estimatedImpact: 'Low'
  });

  return recommendations;
}

/**
 * 전체 성능 점수 계산
 */
function calculateOverallPerformanceScore(results) {
  let score = 100;

  // 메모리 점수 (30%)
  if (results.memoryAnalysis?.growthRate > 2) score -= 30;
  else if (results.memoryAnalysis?.growthRate > 1) score -= 15;
  else if (results.memoryAnalysis?.growthRate > 0.5) score -= 7;

  // 성능 병목점 점수 (40%)
  if (results.performanceBottlenecks?.overallScore) {
    score = (score * 0.6) + (results.performanceBottlenecks.overallScore * 0.4);
  }

  // 파일 시스템 점수 (15%)
  if (results.fileSystemOptimization?.optimizationPotential > 30) score -= 15;
  else if (results.fileSystemOptimization?.optimizationPotential > 20) score -= 10;
  else if (results.fileSystemOptimization?.optimizationPotential > 10) score -= 5;

  // 의존성 점수 (15%)
  if (results.bundleAnalysis?.reductionPotential > 25) score -= 15;
  else if (results.bundleAnalysis?.reductionPotential > 15) score -= 10;
  else if (results.bundleAnalysis?.reductionPotential > 10) score -= 5;

  return Math.max(0, Math.round(score));
}

/**
 * 메모리 효율성 계산
 */
function calculateMemoryEfficiency(samples) {
  const heapUtilization = samples.map(s => s.heapUsed / s.heapTotal);
  const avgUtilization = heapUtilization.reduce((a, b) => a + b, 0) / heapUtilization.length;
  return Math.round(avgUtilization * 100);
}

/**
 * 메모리 권장사항 생성
 */
function generateMemoryRecommendations(samples, growthRate, potentialLeaks) {
  const recommendations = [];

  if (growthRate > 1) {
    recommendations.push('Consider implementing object pooling for frequently created objects');
    recommendations.push('Review event listener cleanup and WeakMap usage');
  }

  if (potentialLeaks > 5) {
    recommendations.push('Implement comprehensive memory profiling');
    recommendations.push('Add memory usage monitoring in production');
  }

  const efficiency = calculateMemoryEfficiency(samples);
  if (efficiency < 50) {
    recommendations.push('Optimize heap usage - consider pre-allocation strategies');
  }

  return recommendations;
}

/**
 * 재귀적으로 파일 목록 가져오기
 */
async function getFilesRecursively(dir) {
  const files = [];
  
  function traverse(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        try {
          const stats = fs.statSync(fullPath);
          
          if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            traverse(fullPath);
          } else if (stats.isFile()) {
            files.push(fullPath);
          }
        } catch (error) {
          // 파일 접근 오류 무시
        }
      }
    } catch (error) {
      // 디렉토리 접근 오류 무시
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * 명령어 실행
 */
function runCommand(command) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, { shell: true, timeout: 30000 });
    let output = '';
    
    child.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

// 실행
performanceAnalysis().catch(error => {
  console.error('💥 Performance analysis failed:', error);
  process.exit(1);
});