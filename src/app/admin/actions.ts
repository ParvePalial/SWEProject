'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
}

export async function approveItem(itemId: string) {
  await checkAdmin();
  await prisma.item.update({
    where: { id: itemId },
    data: { status: 'PUBLISHED' }
  });
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function rejectItem(itemId: string) {
  await checkAdmin();
  await prisma.item.delete({
    where: { id: itemId }
  });
  revalidatePath('/admin');
}

export async function approveClaim(claimId: string, itemId: string) {
  await checkAdmin();
  
  // Update claim
  await prisma.claim.update({
    where: { id: claimId },
    data: { status: 'APPROVED' }
  });

  // Reject all other claims for this item
  await prisma.claim.updateMany({
    where: { itemId, id: { not: claimId } },
    data: { status: 'REJECTED' }
  });

  // Mark item as returned
  await prisma.item.update({
    where: { id: itemId },
    data: { status: 'RETURNED' }
  });

  revalidatePath('/admin');
}

export async function rejectClaim(claimId: string) {
  await checkAdmin();
  await prisma.claim.update({
    where: { id: claimId },
    data: { status: 'REJECTED' }
  });
  revalidatePath('/admin');
}

export async function reactivateUser(userId: string) {
  await checkAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { isSuspended: false, loginAttempts: 0 }
  });
  revalidatePath('/admin');
}
