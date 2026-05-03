'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClaimForm({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
        Claim This Item
      </button>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Claim Item</h3>
          <button onClick={() => setIsOpen(false)} className="modal-close">&times;</button>
        </div>
        
        {success ? (
          <div className="modal-body">
            <div className="alert alert-success">
              <strong>Claim Submitted Successfully!</strong>
              <p style={{ marginTop: '5px' }}>Your claim is pending review by the administrator. You can check the status on your dashboard.</p>
            </div>
            <div className="modal-footer" style={{ borderTop: 'none', padding: 0, marginTop: '20px' }}>
               <button onClick={() => setIsOpen(false)} className="btn btn-outline-dark">Close</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="alert alert-error">{error}</div>}
              
              <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '16px' }}>
                To claim this item, please provide proof of ownership. This can include specific details only the owner would know, serial numbers, or a link to a photo of the item.
              </p>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Proof Details <span>*</span></label>
                <textarea 
                  name="proofDetails" 
                  className="form-control"
                  required 
                  placeholder="Describe specific identifying marks, serial numbers, or context of how you lost it..."
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline-dark">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
