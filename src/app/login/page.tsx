'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (searchParams.get('registered')) {
      setMsg('Registration successful! Please login.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (res.ok) {
        router.push('/dashboard');
        router.refresh(); // Refresh layout to update navbar session state
      } else {
        setError(result.error || 'Login failed');
        if (result.requireSecurityCheck) {
          router.push(`/security-check?email=${encodeURIComponent(email)}`);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
      <h2>Welcome Back</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Login to your LFMS account.</p>

      {msg && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '0.5rem' }}>{msg}</div>}
      {error && <div className="form-error" style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" name="email" required placeholder="john@institute.edu" />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" name="password" required placeholder="••••••••" />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        Don't have an account? <a href="/register" style={{ color: 'var(--accent-primary)' }}>Register here</a>
      </p>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
