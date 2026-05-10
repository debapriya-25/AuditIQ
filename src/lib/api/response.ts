import { NextResponse } from 'next/server';

/**
 * Standardized API Response Utilities.
 * Ensures consistent payload shapes across the entire backend.
 */
export const apiResponse = {
  /**
   * Returns a standard 200 OK or 201 Created JSON response.
   */
  success: <T>(payload: T, status = 200, headers?: Record<string, string>) => {
    return NextResponse.json(payload, { 
      status, 
      ...(headers ? { headers } : {}) 
    });
  },

  /**
   * Returns a paginated JSON response wrapper.
   */
  paginated: <T>(data: T[], total: number, page: number, pageSize: number) => {
    return NextResponse.json({
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    });
  },

  /**
   * Returns a 202 Accepted response for background/async workloads.
   */
  accepted: (message = 'Request accepted for processing') => {
    return NextResponse.json({ success: true, message }, { status: 202 });
  },

  /**
   * Returns a 204 No Content response.
   */
  noContent: () => {
    return new NextResponse(null, { status: 204 });
  }
};
