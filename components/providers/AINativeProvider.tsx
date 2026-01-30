'use client';

import { ReactNode, createContext, useContext, useMemo } from 'react';
import { AINativeClient } from '@ainative/sdk';

interface AINativeContextValue {
    client: AINativeClient;
}

const AINativeContext = createContext<AINativeContextValue | null>(null);

interface AINativeProviderWrapperProps {
    children: ReactNode;
}

/**
 * AINative SDK Provider Wrapper
 *
 * Wraps the application with AINative SDK context, providing access to:
 * - AINativeClient for API operations
 * - ZeroDB operations via client.zerodb
 * - Agent Swarm operations via client.agentSwarm
 *
 * Configuration is read from environment variables:
 * - NEXT_PUBLIC_AINATIVE_API_KEY: API key for authentication
 * - NEXT_PUBLIC_AINATIVE_BASE_URL: Base URL for API (defaults to https://api.ainative.studio)
 */
export default function AINativeProviderWrapper({ children }: AINativeProviderWrapperProps) {
    const client = useMemo(() => {
        return new AINativeClient({
            apiKey: process.env.NEXT_PUBLIC_AINATIVE_API_KEY || '',
            baseUrl: process.env.NEXT_PUBLIC_AINATIVE_BASE_URL || 'https://api.ainative.studio',
        });
    }, []);

    return (
        <AINativeContext.Provider value={{ client }}>
            {children}
        </AINativeContext.Provider>
    );
}

/**
 * Hook to access AINative SDK client
 */
export function useAINative(): AINativeContextValue {
    const context = useContext(AINativeContext);
    if (!context) {
        throw new Error('useAINative must be used within an AINativeProvider');
    }
    return context;
}
