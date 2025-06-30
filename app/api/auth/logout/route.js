import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    cookieStore.delete('token'); // Delete the httpOnly token cookie

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch (error) {
    console.error('API /api/auth/logout error:', error);
    return NextResponse.json({ message: 'Internal server error during logout' }, { status: 500 });
  }
}
