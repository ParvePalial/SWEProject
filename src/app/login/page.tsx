'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
        router.refresh();
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
    <div className="page">
      <main className="form-page">
        <div className="form-card">
          <div className="form-header">
            <div className="form-icon">🔐</div>
            <h2>Welcome Back</h2>
            <p>Login to your SE VLabs account</p>
          </div>
          
          <div className="form-body">
            {msg && <div className="alert alert-success">{msg}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address <span>*</span></label>
                <input type="email" name="email" className={`form-control ${error ? 'error' : ''}`} placeholder="e.g., student@institute.edu" required />
              </div>
              
              <div className="form-group">
                <label className="form-label">Password <span>*</span></label>
                <input type="password" name="password" className={`form-control ${error ? 'error' : ''}`} placeholder="••••••••" required />
                <div style={{ textAlign: 'right', marginTop: '6px' }}>
                  <a href="#" style={{ fontSize: '12px', color: 'var(--blue)', textDecoration: 'none' }}>Forgot password?</a>
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
              
              <hr className="form-divider" />
              
              <div className="form-footer">
                Don't have an account? <Link href="/register">Register here</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="page"><main className="form-page"><div className="spinner"></div></main></div>}>
      <LoginContent />
    </Suspense>
  );
}
