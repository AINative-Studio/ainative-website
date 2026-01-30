import { NextResponse } from 'next/server';

/**
 * Web Vitals Analytics Endpoint
 * Receives performance metrics from the frontend
 */
export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Log vitals in development for debugging
        if (process.env.NODE_ENV === 'development') {
            console.log('[Vitals]', data);
        }

        // TODO: In production, forward to analytics service
        // await analyticsService.trackVitals(data);

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false }, { status: 400 });
    }
}
