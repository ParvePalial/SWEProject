import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists (basic check)
    try {
      await writeFile(join(uploadDir, filename), buffer);
    } catch (e) {
      // If folder doesn't exist, try to create it (or fail gracefully)
      const fs = require('fs');
      if (!fs.existsSync(uploadDir)){
          fs.mkdirSync(uploadDir, { recursive: true });
      }
      await writeFile(join(uploadDir, filename), buffer);
    }

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
