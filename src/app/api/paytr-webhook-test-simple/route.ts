import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'PayTR Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    method: 'GET'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🧪 PayTR Webhook Test - POST request alındı:', body);
    
    return NextResponse.json({
      status: 'OK',
      message: 'PayTR Webhook POST request başarılı!',
      receivedData: body,
      timestamp: new Date().toISOString(),
      method: 'POST'
    });
    
  } catch (error) {
    console.error('🧪 PayTR Webhook Test hatası:', error);
    
    return NextResponse.json({
      status: 'ERROR',
      error: 'Webhook test hatası',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
