import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { queryOne, queryRun, queryAll } from '@/lib/sqlite';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, proofDetails } = await req.json();

    if (!itemId || !proofDetails) {
      return NextResponse.json({ error: 'Item ID and Proof details are required.' }, { status: 400 });
    }

    // Check if item exists and is a found item
    const item: any = await queryOne('SELECT * FROM Item WHERE id = ?', [itemId]);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    if (item.type !== 'FOUND') {
      return NextResponse.json({ error: 'Can only claim FOUND items.' }, { status: 400 });
    }

    // Prevent duplicate claims from same user for same item
    const existingClaim = await queryOne('SELECT id FROM Claim WHERE itemId = ? AND claimerId = ?', [itemId, session.userId]);

    if (existingClaim) {
      return NextResponse.json({ error: 'You have already submitted a claim for this item.' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    await queryRun(
      'INSERT INTO Claim (id, itemId, claimerId, proofDetails, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, itemId, session.userId, proofDetails, 'PENDING', new Date().toISOString(), new Date().toISOString()]
    );

    return NextResponse.json({ message: 'Claim submitted successfully', claimId: id }, { status: 201 });
  } catch (error) {
    console.error('Submit claim error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Get claims for the logged-in user
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const claims = await queryAll(`
      SELECT c.*, i.name as itemName 
      FROM Claim c 
      JOIN Item i ON c.itemId = i.id 
      WHERE c.claimerId = ? 
      ORDER BY c.createdAt DESC
    `, [session.userId]);

    // Map for UI compatibility
    claims.forEach((c: any) => {
      c.item = { name: c.itemName };
    });

    return NextResponse.json(claims);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
