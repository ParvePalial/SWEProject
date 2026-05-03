import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminControls from './AdminControls';

export default async function AdminDashboard() {
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch pending items
  const pendingItems = await prisma.item.findMany({
    where: { status: 'PENDING_VERIFICATION' },
    include: { reporter: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch pending claims
  const pendingClaims = await prisma.claim.findMany({
    where: { status: 'PENDING' },
    include: { 
      item: true,
      claimer: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  // Fetch suspended users
  const suspendedUsers = await prisma.user.findMany({
    where: { isSuspended: true },
    select: { id: true, name: true, email: true, loginAttempts: true }
  });

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Administrator Dashboard</h1>

      <div style={{ display: 'grid', gap: '3rem' }}>
        
        {/* Pending Items */}
        <section>
          <h2 style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>Items Pending Verification</h2>
          {pendingItems.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No items pending verification.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {pendingItems.map(item => (
                <div key={item.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem' }}>{item.name} <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>({item.type})</span></h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Reported by: {item.reporter.name} | Category: {item.category} | Loc: {item.location}</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{item.description}</p>
                  </div>
                  <AdminControls type="item" id={item.id} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending Claims */}
        <section>
          <h2 style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>Pending Claim Requests</h2>
          {pendingClaims.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No pending claims.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {pendingClaims.map(claim => (
                <div key={claim.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, marginRight: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem' }}>Claim for: {claim.item.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Claimed by: {claim.claimer.name} ({claim.claimer.email})</p>
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                      <strong>Proof Details:</strong><br />
                      {claim.proofDetails}
                    </div>
                  </div>
                  <AdminControls type="claim" id={claim.id} itemId={claim.item.id} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Suspended Users */}
        <section>
          <h2 style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>Suspended Accounts</h2>
          {suspendedUsers.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No suspended accounts.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {suspendedUsers.map(user => (
                <div key={user.id} className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block' }}>{user.name}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.email} (Failed Attempts: {user.loginAttempts})</span>
                  </div>
                  <AdminControls type="user" id={user.id} />
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
