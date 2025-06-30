import { NextResponse } from 'next/server';
import crypto from 'crypto'; // Node.js built-in module for token generation
import nodemailer from 'nodemailer'; // For sending emails
import connectDB from '../../../../Lib/config/db';
import { User } from '../../../../Lib/models/BlogModel';

export async function POST(request) {
  await connectDB();

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    const user = await User.findOne({ email });

    // IMPORTANT: For security, always respond with a generic success message
    // even if the user is not found, to prevent email enumeration attacks.
    if (!user) {
      return NextResponse.json({ message: 'If a matching account is found, a password reset link will be sent to your email.' }, { status: 200 });
    }

    // Generate a unique token
    const token = crypto.randomBytes(20).toString('hex');

    // Set token and expiry on the user
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        // Do not fail on invalid certs (for self-signed certs or local dev, remove in production if using valid certs)
        rejectUnauthorized: false
      }
    });

    // Construct the reset URL
    // Ensure NEXT_PUBLIC_BASE_URL is set in your .env.local or environment variables
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Sosumi Blog Password Reset',
      html: `
        <p>You are receiving this because you (or someone else) has requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>This link is valid for 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'If a matching account is found, a password reset link will be sent to your email.' }, { status: 200 });

  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json({ message: 'An error occurred while sending the reset email.' }, { status: 500 });
  }
}
