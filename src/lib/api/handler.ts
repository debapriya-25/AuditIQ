import { ApiContext, createApiContext } from './context';
import { NextResponse } from 'next/server';

export type NextRouteContext = {
  params?: Record<string, string | string[]>;
};

export type RouteHandler = (
  ctx: ApiContext,
  routeContext: NextRouteContext
) => Promise<Response> | Response;

/**
 * Reusable Next.js API Route wrapper.
 * Orchestrates the request lifecycle: ensures standard logging, executes 
 * security guards, injects dependencies, and centralizes try/catch error formatting.
 */
export function withRouteHandler(handler: RouteHandler) {
  return async function (
    req: Request,
    routeContext: NextRouteContext
  ): Promise<Response> {
    let handleApiError: ((err: unknown) => Response) | undefined;
    
    try {
      // 1. Initialize Context & Initial Security Guards (payload size limit)
      const contextSetup = createApiContext(req);
      const { context } = contextSetup;
      handleApiError = contextSetup.handleApiError;

      // 2. Execute business handler with dependency injection
      return await handler(context, routeContext || {});
      
    } catch (err) {
      // 3. Centralized typed error handling
      if (handleApiError) {
        return handleApiError(err);
      }
      
      // Ultimate fallback if context creation itself crashes (highly unlikely)
      console.error('FATAL: Context creation failed before error handler bound', err);
      return NextResponse.json(
        { error: 'An unexpected error occurred. Please try again.' }, 
        { status: 500 }
      );
    }
  };
}
