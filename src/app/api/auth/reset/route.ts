import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'fallback_secret_for_dev';
const key = new TextEncoder().encode(secretKey);

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }

    let payload;
    try {
      const verified = await jwtVerify(token, key);
      payload = verified.payload;
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
    }

    if (payload.purpose !== 'reset') {
      return NextResponse.json({ error: 'Invalid token type.' }, { status: 400 });
    }

    const userId = payload.userId as string;
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return NextResponse.json({ message: 'Password reset successful. You can now login.' }, { status: 200 });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
