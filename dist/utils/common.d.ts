import { getServices } from '../server/services.js';
/**
 * Higher-order function to wrap tool functions with services initialization
 */
export declare function withServices<T extends any[], R>(toolName: string, fn: (services: ReturnType<typeof getServices>, ...args: T) => Promise<R>): (...args: T) => Promise<R | {
    content: Array<{
        type: "text";
        text: string;
    }>;
}>;
/**
 * Validates and normalizes team names
 */
export declare function validateTeams(teams: string[] | string | undefined): string[];
/**
 * Calculates actual team utilization based on current tasks
 */
export declare function calculateTeamUtilization(services: ReturnType<typeof getServices>, teamName: string): number;
/**
 * Detects actual conflicts between teams based on shared resources and dependencies
 */
export declare function detectTeamConflicts(services: ReturnType<typeof getServices>, teams: string[]): Array<{
    id: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    teams: string[];
}>;
/**
 * Calculates actual specialist load based on current assignments
 */
export declare function calculateSpecialistLoad(services: ReturnType<typeof getServices>, specialistType: string): number;
/**
 * Enhanced error formatter for consistent error responses
 */
export declare function formatError(toolName: string, error: any, context?: any): {
    content: Array<{
        type: 'text';
        text: string;
    }>;
};
//# sourceMappingURL=common.d.ts.map