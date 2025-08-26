import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'PayTR Webhook Test Endpoint çalışıyor!',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🧪 PayTR Webhook Test - POST request alındı:', body);
    
    return NextResponse.json({
      success: true,
      message: 'PayTR Webhook Test başarılı!',
      receivedData: body,
      timestamp: new Date().toISOString(),
      status: 'OK'
    });
    
  } catch (error) {
    console.error('🧪 PayTR Webhook Test hatası:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Webhook test hatası',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
