'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClaimForm({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const proofDetails = formData.get('proofDetails') as string;

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, proofDetails })
      });

      if (res.ok) {
        setSuccess(true);
        router.refresh();
      } else {
        const result = await res.json();
        setError(result.error || 'Failed to submit claim');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '0.5rem' }}>
        <strong>Claim Submitted Successfully!</strong>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Your claim is pending review by the administrator. You can check the status on your dashboard.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="form-error" style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>{error}</div>}

      <div className="form-group">
        <label className="form-label">Proof of Ownership</label>
        <textarea 
          name="proofDetails" 
          required 
          rows={5} 
          placeholder="Please describe specific details only the owner would know, or upload proof images via an external link..."
        ></textarea>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Claim'}
      </button>
    </form>
  );
}
