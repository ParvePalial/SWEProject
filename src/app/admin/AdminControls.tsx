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
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <button 
          onClick={() => handleAction('approve')} 
          disabled={isPending}
          className="btn btn-primary" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          {isPending ? '...' : 'Approve'}
        </button>
        <button 
          onClick={() => handleAction('reject')} 
          disabled={isPending}
          className="btn btn-danger" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          {isPending ? '...' : 'Reject'}
        </button>
      </div>
    );
  }

  if (type === 'user') {
    return (
      <button 
        onClick={() => handleAction('reactivate')} 
        disabled={isPending}
        className="btn btn-secondary" 
        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
      >
        {isPending ? '...' : 'Reactivate Account'}
      </button>
    );
  }

  return null;
}
