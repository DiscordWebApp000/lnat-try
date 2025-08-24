import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🧪 ===== TEST PAYTR LINK API START =====');
  
  try {
    console.log('🧪 Basic test - API is reachable');
    
    const body = await request.json();
    console.log('🧪 Request body:', body);
    
    console.log('🧪 Environment variables:');
    console.log('🧪 NODE_ENV:', process.env.NODE_ENV);
    console.log('🧪 PAYTR_MERCHANT_ID:', process.env.PAYTR_MERCHANT_ID ? 'SET' : 'NOT SET');
    console.log('🧪 PAYTR_MERCHANT_KEY:', process.env.PAYTR_MERCHANT_KEY ? 'SET' : 'NOT SET');
    console.log('🧪 PAYTR_MERCHANT_SALT:', process.env.PAYTR_MERCHANT_SALT ? 'SET' : 'NOT SET');
    console.log('🧪 NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'NOT SET');
    
    // PayTR Link API test
    console.log('🧪 Testing PayTR Link API configuration...');
    
    // Hash test
    const crypto = await import('crypto');
    const testData = 'Test Product' + '2999' + 'TL' + '0' + 'product' + 'tr' + '1';
    const testHash = crypto.createHmac('sha256', 'test_key')
      .update(testData + 'test_salt')
      .digest('base64');
    
    return NextResponse.json({
      success: true,
      message: 'PayTR Link API Test başarılı',
      timestamp: new Date().toISOString(),
      body: body,
      config: {
        merchant_id: process.env.PAYTR_MERCHANT_ID ? 'SET' : 'NOT SET',
        merchant_key: process.env.PAYTR_MERCHANT_KEY ? 'SET' : 'NOT SET',
        merchant_salt: process.env.PAYTR_MERCHANT_SALT ? 'SET' : 'NOT SET',
        app_url: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
        test_mode: process.env.NODE_ENV !== 'production'
      },
      hash_test: {
        test_data: testData,
        test_hash: testHash,
        hash_length: testHash.length
      }
    });
    
  } catch (error) {
    console.error('🧪 Test API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test API hatası',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'PayTR Link API Test GET çalışıyor',
    timestamp: new Date().toISOString(),
    api_type: 'PayTR Link API',
    features: [
      'Link oluşturma',
      'Link silme',
      'SMS gönderme',
      'Email gönderme',
      'Webhook callback',
      'Hash doğrulama'
    ]
  });
}
