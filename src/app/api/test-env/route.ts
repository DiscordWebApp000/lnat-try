import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envVars = {
      PAYTR_MERCHANT_ID: process.env.PAYTR_MERCHANT_ID ? 'SET' : 'NOT SET',
      PAYTR_MERCHANT_KEY: process.env.PAYTR_MERCHANT_KEY ? 'SET' : 'NOT SET',
      PAYTR_MERCHANT_SALT: process.env.PAYTR_MERCHANT_SALT ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      // Hash test
      testHash: process.env.PAYTR_MERCHANT_KEY ? 'KEY_EXISTS' : 'NO_KEY'
    };

    return NextResponse.json({
      success: true,
      environment: envVars,
      message: 'Environment variables check'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
