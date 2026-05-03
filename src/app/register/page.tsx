'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/login?registered=true');
      } else {
        const result = await res.json();
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <main className="form-page" style={{ maxWidth: '640px' }}>
        <div className="form-card">
          <div className="form-header">
            <div className="form-icon">🎓</div>
            <h2>Create an Account</h2>
            <p>Join the SE VLabs Institute LFMS</p>
          </div>
          
          <div className="form-body">
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name <span>*</span></label>
                  <input type="text" name="name" className={`form-control ${error ? 'error' : ''}`} placeholder="John Doe" required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email Address <span>*</span></label>
                  <input type="email" name="email" className={`form-control ${error ? 'error' : ''}`} placeholder="john@institute.edu" required />
                  <div className="form-hint">Must be an @institute.edu address</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password <span>*</span></label>
                <input type="password" name="password" className={`form-control ${error ? 'error' : ''}`} placeholder="Create a strong password" required />
              </div>

              <hr className="form-divider" />

              <div className="form-group">
                <label className="form-label">Account Recovery Question <span>*</span></label>
                <select name="securityQuestion" className="form-control" required defaultValue="">
                  <option value="" disabled>Select a security question...</option>
                  <option value="What was your childhood nickname?">What was your childhood nickname?</option>
                  <option value="What is the name of your favorite childhood friend?">What is the name of your favorite childhood friend?</option>
                  <option value="What city were you born in?">What city were you born in?</option>
                  <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                </select>
                <div className="form-hint">Used to recover your account if you forget your password.</div>
              </div>

              <div className="form-group">
                <label className="form-label">Recovery Answer <span>*</span></label>
                <input type="text" name="securityAnswer" className={`form-control ${error ? 'error' : ''}`} placeholder="Your answer" required />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              
              <div className="form-footer">
                Already have an account? <Link href="/login">Sign in here</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
