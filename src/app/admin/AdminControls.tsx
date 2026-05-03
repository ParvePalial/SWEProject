'use client';
import { useTransition } from 'react';
import { approveItem, rejectItem, approveClaim, rejectClaim, reactivateUser } from './actions';

export default function AdminControls({ type, id, itemId }: { type: 'item' | 'claim' | 'user', id: string, itemId?: string }) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (action: 'approve' | 'reject' | 'reactivate') => {
    startTransition(async () => {
      try {
        if (type === 'item') {
          if (action === 'approve') await approveItem(id);
          if (action === 'reject') await rejectItem(id);
        } else if (type === 'claim') {
          if (action === 'approve' && itemId) await approveClaim(id, itemId);
          if (action === 'reject') await rejectClaim(id);
        } else if (type === 'user') {
          if (action === 'reactivate') await reactivateUser(id);
        }
      } catch (err) {
        console.error('Action failed', err);
        alert('Action failed');
      }
    });
  };

  if (type === 'item' || type === 'claim') {
    return (
      <div className="action-btns">
        <button 
          onClick={() => handleAction('approve')} 
          disabled={isPending}
          className="btn btn-success btn-xs" 
        >
          {isPending ? '...' : 'Approve'}
        </button>
        <button 
          onClick={() => handleAction('reject')} 
          disabled={isPending}
          className="btn btn-danger btn-xs" 
        >
          {isPending ? '...' : 'Reject'}
        </button>
      </div>
    );
  }

  if (type === 'user') {
    return (
      <div className="action-btns">
        <button 
          onClick={() => handleAction('reactivate')} 
          disabled={isPending}
          className="btn btn-outline-dark btn-xs" 
        >
          {isPending ? '...' : 'Reactivate'}
        </button>
      </div>
    );
  }

  return null;
}
