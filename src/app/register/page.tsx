'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="glass-panel" style={{ maxWidth: '500px', margin: '4rem auto', padding: '2rem' }}>
      <h2>Create an Account</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Join the SE VLabs Institute LFMS.</p>

      {error && <div className="form-error" style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" name="name" required placeholder="John Doe" />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" name="email" required placeholder="john@institute.edu" />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" name="password" required placeholder="••••••••" />
        </div>

        <div className="form-group">
          <label className="form-label">Security Question</label>
          <select name="securityQuestion" required defaultValue="">
            <option value="" disabled>Select a question...</option>
            <option value="What was your childhood nickname?">What was your childhood nickname?</option>
            <option value="What is the name of your favorite childhood friend?">What is the name of your favorite childhood friend?</option>
            <option value="What city were you born in?">What city were you born in?</option>
            <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Security Answer</label>
          <input type="text" name="securityAnswer" required placeholder="Your answer..." />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        Already have an account? <a href="/login" style={{ color: 'var(--accent-primary)' }}>Login here</a>
      </p>
    </div>
  );
}
