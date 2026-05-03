'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SecurityCheckContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!email) {
      router.push('/login');
      return;
    }

    fetch(`/api/auth/security-check?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setQuestion(data.question);
        }
      })
      .catch(() => setError('Failed to load security question'))
      .finally(() => setFetching(false));
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const answer = formData.get('answer') as string;

    try {
      const res = await fetch('/api/auth/security-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, answer }),
      });

      const result = await res.json();

      if (res.ok) {
        // Redirect to reset password page with token
        router.push(`/reset-password?token=${encodeURIComponent(result.resetToken)}`);
      } else {
        setError(result.error || 'Check failed');
        if (res.status === 403) {
          // Suspended
          setTimeout(() => router.push('/login'), 3000);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="container" style={{ padding: '4rem 0' }}>Loading...</div>;

  return (
    <div className="glass-panel" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
      <h2>Security Check</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You have failed login 3 times. Please answer your security question to continue.</p>

      {error && <div className="form-error" style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Question</label>
          <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
            {question}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Your Answer</label>
          <input type="text" name="answer" required placeholder="Enter your answer" />
        </div>

        <button type="submit" className="btn btn-warning" style={{ width: '100%', marginTop: '1rem', background: 'var(--warning)', color: '#000' }} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Answer'}
        </button>
      </form>
    </div>
  );
}

export default function SecurityCheck() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SecurityCheckContent />
    </Suspense>
  );
}
