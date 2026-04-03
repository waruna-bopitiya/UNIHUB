import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params
  try {
    // TODO: Implement get single comment endpoint
    return NextResponse.json({
      status: 'success',
      data: null
    })
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params
  try {
    // TODO: Implement update comment endpoint
    return NextResponse.json({
      status: 'success',
      message: 'Comment updated'
    })
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params
  try {
    // TODO: Implement delete comment endpoint
    return NextResponse.json({
      status: 'success',
      message: 'Comment deleted'
    })
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
