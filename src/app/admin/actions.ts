'use server';

import { queryRun } from '@/lib/sqlite';
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
  await queryRun('UPDATE Item SET status = ? WHERE id = ?', ['PUBLISHED', itemId]);
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function rejectItem(itemId: string) {
  await checkAdmin();
  await queryRun('DELETE FROM Item WHERE id = ?', [itemId]);
  revalidatePath('/admin');
}

export async function approveClaim(claimId: string, itemId: string) {
  await checkAdmin();
  
  // Update claim
  await queryRun('UPDATE Claim SET status = ? WHERE id = ?', ['APPROVED', claimId]);

  // Reject all other claims for this item
  await queryRun('UPDATE Claim SET status = ? WHERE itemId = ? AND id != ?', ['REJECTED', itemId, claimId]);

  // Mark item as returned
  await queryRun('UPDATE Item SET status = ? WHERE id = ?', ['RETURNED', itemId]);

  revalidatePath('/admin');
}

export async function rejectClaim(claimId: string) {
  await checkAdmin();
  await queryRun('UPDATE Claim SET status = ? WHERE id = ?', ['REJECTED', claimId]);
  revalidatePath('/admin');
}

export async function reactivateUser(userId: string) {
  await checkAdmin();
  await queryRun('UPDATE User SET isSuspended = 0, loginAttempts = 0 WHERE id = ?', [userId]);
  revalidatePath('/admin');
}
