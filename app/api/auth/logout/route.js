// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Correct import for cookies

// Force this route to be dynamic to ensure cookies() is correctly handled.
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Accessing cookies directly. With 'force-dynamic', Next.js should handle this correctly.
    cookies().delete('token'); // Delete the httpOnly token cookie

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch (error) {
    console.error('API /api/auth/logout error:', error);
    return NextResponse.json({ message: 'Internal server error during logout' }, { status: 500 });
  }
}
