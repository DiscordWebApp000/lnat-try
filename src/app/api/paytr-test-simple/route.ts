import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Simple PayTR Test Webhook başlatıldı');
    
    // Environment variables kontrolü
    const merchantId = process.env.PAYTR_MERCHANT_ID;
    const merchantKey = process.env.PAYTR_MERCHANT_KEY;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT;
    
    console.log('🔑 Environment Variables:');
    console.log('MERCHANT_ID:', merchantId ? 'SET' : 'MISSING');
    console.log('MERCHANT_KEY:', merchantKey ? 'SET' : 'MISSING');
    console.log('MERCHANT_SALT:', merchantSalt ? 'SET' : 'MISSING');
    
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
    
    return NextResponse.json({
      status: 'OK',
      message: 'Simple PayTR test webhook çalışıyor',
      environment: {
        merchantId: merchantId ? 'SET' : 'MISSING',
        merchantKey: merchantKey ? 'SET' : 'MISSING',
        merchantSalt: merchantSalt ? 'SET' : 'MISSING'
      },
      receivedData: body,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Simple PayTR Test Webhook hatası:', error);
    
    return NextResponse.json({
      status: 'ERROR',
      error: 'Simple webhook test hatası',
      message: error instanceof Error ? error.message : 'Bilinmeyen hata',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'Simple PayTR test webhook GET çalışıyor',
    timestamp: new Date().toISOString()
  });
}
