import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryRun } from '@/lib/sqlite';
import { getSession } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || '';
    const category = searchParams.get('category') || '';

    let sql = `
      SELECT i.*, u.name as reporterName 
      FROM Item i
      LEFT JOIN User u ON i.reporterId = u.id
      WHERE i.status = 'PUBLISHED'
    `;
    const params: any[] = [];

    if (query) {
      sql += ` AND (i.name LIKE ? OR i.description LIKE ? OR i.location LIKE ?)`;
      const q = `%${query}%`;
      params.push(q, q, q);
    }
    if (type) {
      sql += ` AND i.type = ?`;
      params.push(type);
    }
    if (category) {
      sql += ` AND i.category = ?`;
      params.push(category);
    }

    sql += ` ORDER BY i.createdAt DESC`;

    const items = await queryAll(sql, params);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Fetch items error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, name, description, category, location, date, imagePath } = await req.json();

    if (!type || !name || !description || !category || !location || !date) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // All items (LOST and FOUND) now need verification before being published
    const status = 'PENDING_VERIFICATION';
    const id = crypto.randomUUID();

    await queryRun(
      'INSERT INTO Item (id, type, name, description, category, location, date, imagePath, status, reporterId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, type, name, description, category, location, date, imagePath, status, session.userId, new Date().toISOString(), new Date().toISOString()]
    );

    return NextResponse.json({ message: 'Item posted successfully', itemId: id }, { status: 201 });
  } catch (error) {
    console.error('Post item error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
