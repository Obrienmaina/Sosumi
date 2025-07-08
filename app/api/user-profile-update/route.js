import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '../../../Lib/config/db'; // Adjust path as needed
import { User } from '../../../Lib/models/blogmodel'; // Adjust path as needed
import formidable from 'formidable';
import fs from 'fs';

export async function POST(request) {
  try {
    const form = new formidable.IncomingForm();
    form.uploadDir = './uploads'; // Directory to store uploaded files
    form.keepExtensions = true;

    return new Promise((resolve) => {
      form.parse(request, async (err, fields, files) => {
        if (err) {
          console.error('Error parsing form:', err);
          return resolve(
            NextResponse.json({ message: 'Failed to process form data' }, { status: 500 })
          );
        }

        try {
          await connectDB();

          const token = cookies().get('token');

          if (!token?.value) {
            return resolve(
              NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
            );
          }

          let decoded;
          try {
            decoded = jwt.verify(token.value, process.env.JWT_SECRET);
          } catch {
            return resolve(
              NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 })
            );
          }

          const user = await User.findById(decoded.id);

          if (!user) {
            return resolve(
              NextResponse.json({ message: 'User not found' }, { status: 404 })
            );
          }

          if (files.profilePicture) {
            const oldPath = files.profilePicture.filepath;
            const newPath = `./uploads/${files.profilePicture.originalFilename}`;
            fs.renameSync(oldPath, newPath);
            fields.profilePictureUrl = `/uploads/${files.profilePicture.originalFilename}`;
          }

          const {
            firstName,
            lastName,
            country,
            agreedToTerms,
            bio,
            profilePictureUrl,
            gender,
            homepageUrl,
            company,
            city,
            interests
          } = fields;

          if (firstName !== undefined) user.firstName = firstName;
          if (lastName !== undefined) user.lastName = lastName;
          if (country !== undefined) user.country = country;
          if (agreedToTerms !== undefined) user.agreedToTerms = agreedToTerms;
          if (bio !== undefined) user.bio = bio;
          if (profilePictureUrl !== undefined) user.profilePictureUrl = profilePictureUrl;

          if (gender !== undefined) {
            user.gender = gender === '' ? null : gender;
          }

          if (homepageUrl !== undefined) user.homepageUrl = homepageUrl;
          if (company !== undefined) user.company = company;
          if (city !== undefined) user.city = city;
          if (interests !== undefined) user.interests = interests;

          await user.save();

          resolve(
            NextResponse.json({ message: 'Profile updated successfully!', user }, { status: 200 })
          );
        } catch (error) {
          console.error('Error updating profile:', error);

          if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return resolve(
              NextResponse.json({ message: messages.join(', ') }, { status: 400 })
            );
          }

          resolve(
            NextResponse.json({ message: 'Internal server error' }, { status: 500 })
          );
        }
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ message: 'Unexpected server error' }, { status: 500 });
  }
}
