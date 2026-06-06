import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    console.log('✅ Auth config loaded successfully');
    console.log('✅ Providers configured:', authOptions.providers?.length);
    
    return NextResponse.json({
      status: 'AUTH CONFIG OK',
      providersCount: authOptions.providers?.length,
      hasAdapter: !!authOptions.adapter,
    });
  } catch (error) {
    console.error('❌ Auth config failed to load:', error);
    return NextResponse.json({
      status: 'AUTH CONFIG FAILED',
      error: error.message,
    }, { status: 500 });
  }
}
