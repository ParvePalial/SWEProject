import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, securityQuestion, securityAnswer } = await req.json();

    if (!name || !email || !password || !securityQuestion || !securityAnswer) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase(), 10);

    // First user becomes ADMIN, rest USER
    const count = await prisma.user.count();
    const role = count === 0 ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        securityQuestion,
        securityAnswerHash,
        role,
      },
    });

    return NextResponse.json({ message: 'User registered successfully', userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
