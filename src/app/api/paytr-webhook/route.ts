import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔍 PayTR Webhook başlatıldı');
  
  // PayTR webhook yanıtı (PayTR'nin beklediği format)
  return NextResponse.json({
    status: 'success'
  });
}

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'PayTR Webhook GET çalışıyor'
  });
}
