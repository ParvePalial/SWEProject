import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    if (item.type !== 'FOUND') {
      return NextResponse.json({ error: 'Can only claim FOUND items.' }, { status: 400 });
    }

    // Prevent duplicate claims from same user for same item
    const existingClaim = await prisma.claim.findFirst({
      where: { itemId, claimerId: session.userId }
    });

    if (existingClaim) {
      return NextResponse.json({ error: 'You have already submitted a claim for this item.' }, { status: 400 });
    }

    const claim = await prisma.claim.create({
      data: {
        itemId,
        claimerId: session.userId,
        proofDetails,
        status: 'PENDING'
      }
    });

    // Optionally update item status to CLAIMED (if single claim locks it) 
    // but requirements say "Multiple claims may exist for a single item, but only one can be approved."
    // So we don't change item status here. Admin handles it.

    return NextResponse.json({ message: 'Claim submitted successfully', claim }, { status: 201 });
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

    const claims = await prisma.claim.findMany({
      where: { claimerId: session.userId },
      include: { item: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(claims);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
