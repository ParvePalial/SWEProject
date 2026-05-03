import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryRun } from '@/lib/sqlite';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, securityQuestion, securityAnswer } = await req.json();

    if (!name || !email || !password || !securityQuestion || !securityAnswer) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const existingUser = await queryOne('SELECT id FROM User WHERE email = ?', [email]);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase(), 10);

    // Check count for role assignment
    const countRow: any = await queryOne('SELECT COUNT(*) as count FROM User');
    const role = countRow.count === 0 ? 'ADMIN' : 'USER';
    const id = crypto.randomUUID();

    await queryRun(
      'INSERT INTO User (id, name, email, passwordHash, securityQuestion, securityAnswerHash, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, passwordHash, securityQuestion, securityAnswerHash, role, new Date().toISOString(), new Date().toISOString()]
    );

    return NextResponse.json({ message: 'User registered successfully', userId: id }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
