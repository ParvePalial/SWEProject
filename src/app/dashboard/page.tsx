import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function UserDashboard() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Fetch items reported by the user
  const reportedItems = await prisma.item.findMany({
    where: { reporterId: session.userId },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch claims made by the user
  const claims = await prisma.claim.findMany({
    where: { claimerId: session.userId },
    include: { item: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Dashboard</h1>

      <div style={{ display: 'grid', gap: '3rem' }}>
        
        {/* User's Posts */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
            <h2>Items I Reported</h2>
            <Link href="/post-item" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>+ Report Item</Link>
          </div>
          
          {reportedItems.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>You haven't reported any items yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {reportedItems.map(item => (
                <Link href={`/item/${item.id}`} key={item.id} className="glass-panel item-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <strong>{item.name}</strong>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '1rem', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                      {item.type}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Status: <strong style={{ color: item.status === 'PUBLISHED' ? 'var(--success)' : 'inherit' }}>{item.status}</strong>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(item.date).toLocaleDateString()}</div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* User's Claims */}
        <section>
          <h2 style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>My Claims</h2>
          {claims.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>You haven't claimed any items yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {claims.map(claim => (
                <div key={claim.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}><Link href={`/item/${claim.item.id}`} style={{ color: 'var(--accent-primary)' }}>{claim.item.name}</Link></h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{new Date(claim.createdAt).toLocaleDateString()}</span>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      backgroundColor: claim.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : claim.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: claim.status === 'APPROVED' ? 'var(--success)' : claim.status === 'REJECTED' ? 'var(--danger)' : 'var(--warning)'
                    }}>
                      {claim.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
