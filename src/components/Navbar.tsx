import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { handleLogout } from '@/app/actions';
import styles from './Navbar.module.css';

export default async function Navbar() {
  const session = await getSession();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoAccent}>LFMS</span> Institute
        </Link>
        <div className={styles.navLinks}>
          <Link href="/" className={styles.link}>Search Items</Link>
          {session ? (
            <>
              <Link href="/post-item" className={styles.link}>Report Item</Link>
              <Link href="/dashboard" className={styles.link}>Dashboard</Link>
              {session.role === 'ADMIN' && (
                <Link href="/admin" className={styles.link}>Admin</Link>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary">Login</Link>
              <Link href="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
        {session && (
          <div className={styles.authButtons}>
            <form action={handleLogout}>
              <button type="submit" className="btn btn-secondary">Logout</button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}
