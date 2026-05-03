import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || ''; // LOST or FOUND
    const category = searchParams.get('category') || '';

    // Only fetch items that are either LOST, or FOUND & PUBLISHED
    const items = await prisma.item.findMany({
      where: {
        AND: [
          {
            OR: [
              { type: 'LOST' },
              { type: 'FOUND', status: 'PUBLISHED' }
            ]
          },
          query ? {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
              { location: { contains: query } }
            ]
          } : {},
          type ? { type } : {},
          category ? { category } : {}
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: { reporter: { select: { name: true } } }
    });

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

    // Lost items are published immediately. Found items need verification.
    const status = type === 'LOST' ? 'PUBLISHED' : 'PENDING_VERIFICATION';

    const item = await prisma.item.create({
      data: {
        type,
        name,
        description,
        category,
        location,
        date,
        imagePath,
        status,
        reporterId: session.userId,
      }
    });

    return NextResponse.json({ message: 'Item posted successfully', item }, { status: 201 });
  } catch (error) {
    console.error('Post item error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
