import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 PayTR Simple Webhook başlatıldı');
    
    // Request body'yi al
    let body;
    try {
      body = await request.json();
      console.log('📥 JSON Body:', body);
    } catch (error) {
      const textBody = await request.text();
      console.log('📄 Text Body:', textBody);
      body = { raw: textBody };
    }
    
    // Basit yanıt döndür
    return NextResponse.json({
      status: 'OK',
      message: 'PayTR webhook başarılı',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ PayTR Simple Webhook hatası:', error);
    
    return NextResponse.json({
      status: 'ERROR',
      error: 'Webhook hatası',
      message: error instanceof Error ? error.message : 'Bilinmeyen hata',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'PayTR Simple Webhook GET çalışıyor',
    timestamp: new Date().toISOString()
  });
}
