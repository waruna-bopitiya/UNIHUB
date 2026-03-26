import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement QNA categories endpoint
    return NextResponse.json({
      status: 'success',
      message: 'QNA categories endpoint',
      data: []
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch categories',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
