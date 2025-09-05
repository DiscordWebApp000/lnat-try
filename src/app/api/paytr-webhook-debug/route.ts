import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 PayTR Webhook başlatıldı');
    
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
    
    // PayTR webhook yanıtı (PayTR'nin beklediği format)
    return NextResponse.json({
      status: 'success'
    });
    
  } catch (error) {
    console.error('❌ PayTR Webhook error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
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
