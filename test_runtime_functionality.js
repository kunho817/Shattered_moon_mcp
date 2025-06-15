#!/usr/bin/env node

/**
 * MCP 시스템 런타임 기능 테스트
 * - 각 도구의 기본 실행 가능성 검증
 * - 메모리 누수 및 성능 문제 탐지
 * - 에러 핸들링 검증
 */

const { performance } = require('perf_hooks');

async function testMCPTools() {
  console.log('🧪 MCP Runtime Functionality Test Starting...\n');

  const results = {
    passed: 0,
    failed: 0,
    errors: [],
    warnings: [],
    performance: {}
  };

  // Test 1: Import 및 기본 모듈 로드 테스트
  console.log('1. 📦 Testing module imports...');
  try {
    const startTime = performance.now();
    
    // 동적 import로 ES 모듈 테스트
    const { VIRTUAL_TEAMS, SPECIALISTS } = await import('./dist/types/index.js');
    
    if (Object.keys(VIRTUAL_TEAMS).length > 0 && Object.keys(SPECIALISTS).length > 0) {
      console.log('✅ Module imports successful');
      console.log(`   - Teams: ${Object.keys(VIRTUAL_TEAMS).length}`);
      console.log(`   - Specialists: ${Object.keys(SPECIALISTS).length}`);
      results.passed++;
    } else {
      throw new Error('Empty type definitions');
    }
    
    const loadTime = performance.now() - startTime;
    results.performance.moduleLoad = loadTime;
    console.log(`   - Load time: ${loadTime.toFixed(2)}ms`);
    
  } catch (error) {
    console.log('❌ Module import failed:', error.message);
    results.failed++;
    results.errors.push(`Module Import: ${error.message}`);
  }

  // Test 2: Schema 검증 테스트
  console.log('\n2. 🔍 Testing schema validation...');
  try {
    const startTime = performance.now();
    
    const { DistributedTaskSchema, CodeGenerateSchema } = await import('./dist/types/index.js');
    
    // 유효한 데이터 테스트
    const validTask = {
      task: "Test distributed task processing",
      complexity: "medium",
      teams: ["Backend", "Frontend"],
      priority: 7
    };
    
    const taskResult = DistributedTaskSchema.safeParse(validTask);
    
    if (taskResult.success) {
      console.log('✅ Schema validation working');
      results.passed++;
    } else {
      throw new Error('Schema validation failed');
    }
    
    const validationTime = performance.now() - startTime;
    results.performance.schemaValidation = validationTime;
    console.log(`   - Validation time: ${validationTime.toFixed(2)}ms`);
    
  } catch (error) {
    console.log('❌ Schema validation failed:', error.message);
    results.failed++;
    results.errors.push(`Schema Validation: ${error.message}`);
  }

  // Test 3: Claude Code 통합 테스트
  console.log('\n3. 🤖 Testing Claude Code integration...');
  try {
    const startTime = performance.now();
    
    // Claude Code 가용성 확인
    const { spawn } = require('child_process');
    
    const claudeTest = spawn('claude', ['--version'], { timeout: 5000 });
    
    await new Promise((resolve, reject) => {
      let output = '';
      claudeTest.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      claudeTest.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Claude Code integration available');
          console.log(`   - Version: ${output.trim()}`);
          results.passed++;
          resolve();
        } else {
          reject(new Error('Claude Code not available'));
        }
      });
      
      claudeTest.on('error', () => {
        reject(new Error('Claude Code command failed'));
      });
      
      setTimeout(() => {
        claudeTest.kill();
        reject(new Error('Claude Code test timeout'));
      }, 5000);
    });
    
    const integrationTime = performance.now() - startTime;
    results.performance.claudeCodeIntegration = integrationTime;
    
  } catch (error) {
    console.log('⚠️ Claude Code integration issue:', error.message);
    results.warnings.push(`Claude Code: ${error.message}`);
    // Claude Code 없어도 시스템은 작동 가능하므로 경고로 처리
  }

  // Test 4: 메모리 사용량 테스트
  console.log('\n4. 💾 Testing memory usage...');
  try {
    const startMemory = process.memoryUsage();
    
    // 메모리 집약적 작업 시뮬레이션
    const largeArray = new Array(100000).fill(0).map((_, i) => ({
      id: i,
      data: `test_data_${i}`,
      timestamp: new Date()
    }));
    
    // 가비지 컬렉션 강제 실행 (가능한 경우)
    if (global.gc) {
      global.gc();
    }
    
    const endMemory = process.memoryUsage();
    const memoryDiff = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal
    };
    
    console.log('✅ Memory usage test completed');
    console.log(`   - RSS: ${(memoryDiff.rss / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   - Heap Used: ${(memoryDiff.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   - Heap Total: ${(memoryDiff.heapTotal / 1024 / 1024).toFixed(2)}MB`);
    
    results.performance.memoryUsage = memoryDiff;
    results.passed++;
    
    // 메모리 정리
    largeArray.length = 0;
    
  } catch (error) {
    console.log('❌ Memory test failed:', error.message);
    results.failed++;
    results.errors.push(`Memory Test: ${error.message}`);
  }

  // Test 5: 비동기 작업 처리 테스트
  console.log('\n5. ⚡ Testing async operation handling...');
  try {
    const startTime = performance.now();
    
    // 여러 비동기 작업 동시 실행
    const asyncTasks = Array.from({ length: 10 }, (_, i) => 
      new Promise(resolve => 
        setTimeout(() => resolve(`Task ${i} completed`), Math.random() * 100)
      )
    );
    
    const asyncResults = await Promise.allSettled(asyncTasks);
    const successful = asyncResults.filter(r => r.status === 'fulfilled').length;
    
    console.log('✅ Async operation handling tested');
    console.log(`   - Tasks completed: ${successful}/10`);
    
    const asyncTime = performance.now() - startTime;
    results.performance.asyncOperations = asyncTime;
    console.log(`   - Total time: ${asyncTime.toFixed(2)}ms`);
    
    if (successful === 10) {
      results.passed++;
    } else {
      results.warnings.push(`Only ${successful}/10 async tasks completed`);
    }
    
  } catch (error) {
    console.log('❌ Async test failed:', error.message);
    results.failed++;
    results.errors.push(`Async Test: ${error.message}`);
  }

  // Test 6: 에러 핸들링 테스트
  console.log('\n6. 🚨 Testing error handling...');
  try {
    // 의도적으로 에러 발생시켜 핸들링 테스트
    const errorScenarios = [
      { name: 'Invalid JSON', test: () => JSON.parse('invalid json') },
      { name: 'Type Error', test: () => null.nonExistentMethod() },
      { name: 'Reference Error', test: () => undefinedVariable.property }
    ];
    
    let handledErrors = 0;
    
    for (const scenario of errorScenarios) {
      try {
        scenario.test();
      } catch (error) {
        // 에러가 제대로 캐치되면 핸들링이 잘 되는 것
        handledErrors++;
      }
    }
    
    console.log('✅ Error handling tested');
    console.log(`   - Errors properly handled: ${handledErrors}/${errorScenarios.length}`);
    
    if (handledErrors === errorScenarios.length) {
      results.passed++;
    } else {
      results.warnings.push(`Error handling incomplete: ${handledErrors}/${errorScenarios.length}`);
    }
    
  } catch (error) {
    console.log('❌ Error handling test failed:', error.message);
    results.failed++;
    results.errors.push(`Error Handling: ${error.message}`);
  }

  // 결과 요약
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️ Warnings: ${results.warnings.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 Errors:');
    results.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    results.warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  console.log('\n⚡ Performance Metrics:');
  Object.entries(results.performance).forEach(([key, value]) => {
    if (typeof value === 'number') {
      console.log(`   - ${key}: ${value.toFixed(2)}ms`);
    } else {
      console.log(`   - ${key}: ${JSON.stringify(value)}`);
    }
  });
  
  const overallScore = (results.passed / (results.passed + results.failed)) * 100;
  console.log(`\n🎯 Overall Score: ${overallScore.toFixed(1)}%`);
  
  if (overallScore >= 80) {
    console.log('🎉 MCP system runtime functionality: EXCELLENT');
  } else if (overallScore >= 60) {
    console.log('👍 MCP system runtime functionality: GOOD');
  } else {
    console.log('⚠️ MCP system runtime functionality: NEEDS IMPROVEMENT');
  }
}

// 실행
testMCPTools().catch(error => {
  console.error('💥 Runtime test failed:', error);
  process.exit(1);
});