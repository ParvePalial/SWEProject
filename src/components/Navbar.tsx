import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { handleLogout } from '@/app/actions';
import { queryOne } from '@/lib/sqlite';

export default async function Navbar() {
  const session = await getSession();
  let user: any = null;
  if (session) {
    user = await queryOne('SELECT name FROM User WHERE id = ?', [session.userId]);
  }

  return (
    <nav>
      <Link href="/" className="nav-logo">
        <div className="nav-logo-icon">🔍</div>
        <div className="nav-logo-text">LF<span>MS</span></div>
      </Link>
      
      {!session ? (
        <div className="nav-links" id="nav-links-guest">
          <Link href="/" className="nav-btn">Home</Link>
          <div className="nav-separator"></div>
          <Link href="/login" className="nav-btn">Login</Link>
          <Link href="/register" className="nav-btn primary">Register</Link>
        </div>
      ) : session.role === 'ADMIN' ? (
        <div className="nav-links" id="nav-links-admin">
          <Link href="/admin" className="nav-btn">Dashboard</Link>
          <Link href="/admin?view=pending-posts" className="nav-btn">Review Posts</Link>
          <Link href="/admin?view=claims" className="nav-btn">Claims</Link>
          <Link href="/admin?view=users" className="nav-btn">Users</Link>
          <div className="nav-separator"></div>
          <div className="nav-user">
            <div className="nav-avatar" style={{ background: 'var(--gold)', color: 'var(--navy)' }}>A</div>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Admin</span>
          </div>
          <form action={handleLogout} style={{ display: 'inline' }}>
            <button type="submit" className="nav-btn">Logout</button>
          </form>
        </div>
      ) : (
        <div className="nav-links" id="nav-links-user">
          <Link href="/" className="nav-btn">Browse</Link>
          <Link href="/post-item?type=LOST" className="nav-btn">Post Lost</Link>
          <Link href="/post-item?type=FOUND" className="nav-btn">Post Found</Link>
          <Link href="/dashboard" className="nav-btn">My Dashboard</Link>
          <div className="nav-separator"></div>
          <div className="nav-user">
            <div className="nav-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{user?.name?.split(' ')[0] || 'User'}</span>
          </div>
          <form action={handleLogout} style={{ display: 'inline' }}>
            <button type="submit" className="nav-btn">Logout</button>
          </form>
        </div>
      )}
    </nav>
  );
}
