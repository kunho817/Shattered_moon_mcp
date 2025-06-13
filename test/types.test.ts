import { describe, it, expect } from '@jest/globals';
import { 
  DistributedTaskSchema,
  CodeGenerateSchema,
  VIRTUAL_TEAMS,
  SPECIALISTS 
} from '../src/types/index';

describe('Schema Validation', () => {
  it('should validate distributed task manager params', () => {
    const validParams = {
      task: 'Test task',
      complexity: 'medium' as const,
      priority: 5
    };

    expect(() => DistributedTaskSchema.parse(validParams)).not.toThrow();
  });

  it('should validate code generator params', () => {
    const validParams = {
      type: 'component' as const,
      name: 'TestComponent'
    };

    expect(() => CodeGenerateSchema.parse(validParams)).not.toThrow();
  });

  it('should reject invalid complexity', () => {
    const invalidParams = {
      task: 'Test task',
      complexity: 'invalid' as any
    };

    expect(() => DistributedTaskSchema.parse(invalidParams)).toThrow();
  });
});

describe('Virtual Teams', () => {
  it('should have all required teams defined', () => {
    const expectedTeams = [
      'planning', 'backend', 'frontend', 'testing', 
      'documentation', 'performance', 'devops'
    ];

    expectedTeams.forEach(team => {
      expect(VIRTUAL_TEAMS).toHaveProperty(team);
      expect(VIRTUAL_TEAMS[team as keyof typeof VIRTUAL_TEAMS]).toHaveProperty('name');
      expect(VIRTUAL_TEAMS[team as keyof typeof VIRTUAL_TEAMS]).toHaveProperty('specialists');
    });
  });
});

describe('Specialists', () => {
  it('should have all required specialists defined', () => {
    const requiredSpecialists = [
      'shader-wizard', 'dx12-specialist', 'memory-expert',
      'algorithm-specialist', 'concurrency-expert'
    ];

    requiredSpecialists.forEach(specialist => {
      expect(SPECIALISTS).toHaveProperty(specialist);
      expect(SPECIALISTS[specialist as keyof typeof SPECIALISTS]).toHaveProperty('expertise');
    });
  });

  it('should have at least 20 specialists', () => {
    expect(Object.keys(SPECIALISTS).length).toBeGreaterThanOrEqual(20);
  });
});