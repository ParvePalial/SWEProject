import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryRun } from '@/lib/sqlite';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';

const secretKey = process.env.JWT_SECRET || 'fallback_secret_for_dev';
const key = new TextEncoder().encode(secretKey);

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const user: any = await queryOne('SELECT securityQuestion FROM User WHERE email = ?', [email]);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ question: user.securityQuestion });
}

export async function POST(req: NextRequest) {
  try {
    const { email, answer } = await req.json();

    if (!email || !answer) {
      return NextResponse.json({ error: 'Email and answer are required.' }, { status: 400 });
    }

    const user: any = await queryOne('SELECT * FROM User WHERE email = ?', [email]);
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    const isMatch = await bcrypt.compare(answer.toLowerCase(), user.securityAnswerHash);

    if (!isMatch) {
      await queryRun('UPDATE User SET isSuspended = 1 WHERE id = ?', [user.id]);
      return NextResponse.json({ error: 'Incorrect answer. Account has been suspended.' }, { status: 403 });
    }

    // Reset login attempts since they answered correctly
    await queryRun('UPDATE User SET loginAttempts = 0 WHERE id = ?', [user.id]);

    // Generate a reset token valid for 15 mins
    const resetToken = await new SignJWT({ userId: user.id, purpose: 'reset' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(key);

    // In a real system, we'd send this via email.
    // For this prototype, we'll return it so the frontend can redirect.
    return NextResponse.json({ 
      message: 'Security answer correct. A password reset link has been generated.',
      resetToken 
    }, { status: 200 });
  } catch (error) {
    console.error('Security check error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
