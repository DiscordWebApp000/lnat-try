import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug Webhook başlatıldı');
    
    // Request bilgilerini logla
    console.log('📡 Method:', request.method);
    console.log('🌐 URL:', request.url);
    console.log('📋 Headers:', Object.fromEntries(request.headers.entries()));
    
    // Body'yi al
    let body;
    try {
      body = await request.json();
      console.log('📥 JSON Body:', body);
    } catch (error) {
      console.log('❌ JSON parse error:', error);
      const textBody = await request.text();
      console.log('📄 Text Body:', textBody);
      body = { raw: textBody };
    }
    
    // Basit yanıt döndür
    return NextResponse.json({
      status: 'OK',
      message: 'Debug webhook çalışıyor',
      received: {
        method: request.method,
        body: body,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Debug webhook error:', error);
    
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'Debug webhook GET endpoint çalışıyor',
    timestamp: new Date().toISOString()
  });
}
