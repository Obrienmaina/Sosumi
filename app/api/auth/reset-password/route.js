import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '../../../../Lib/config/db';
import { User } from '../../../../Lib/models/blogmodel';

export async function POST(request) {
  await connectDB();

  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ message: 'Token and new password are required.' }, { status: 400 });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token is not expired
    });

    if (!user) {
      return NextResponse.json({ message: 'Password reset token is invalid or has expired.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user's password and clear reset token fields
    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined; // Remove the token
    user.resetPasswordExpires = undefined; // Remove the expiry
    await user.save();

    return NextResponse.json({ message: 'Your password has been successfully reset!' }, { status: 200 });

  } catch (error) {
    console.error('Reset password API error:', error);
    return NextResponse.json({ message: 'An error occurred while resetting your password.' }, { status: 500 });
  }
}
