import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db.server';
import bcrypt from 'bcrypt';
import { login } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    if (user.isSuspended) {
      return NextResponse.json({ error: 'Account suspended. Contact administrator.' }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      const newAttempts = user.loginAttempts + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: newAttempts }
      });

      if (newAttempts >= 3) {
        return NextResponse.json({ error: 'Too many failed attempts.', requireSecurityCheck: true }, { status: 403 });
      }

      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Reset login attempts on success
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0 }
    });

    await login(user.id, user.role);

    return NextResponse.json({ message: 'Login successful' }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
