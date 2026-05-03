import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import ClaimForm from './ClaimForm';

export default async function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const item = await prisma.item.findUnique({
    where: { id },
    include: { reporter: { select: { name: true } } }
  });

  if (!item) return notFound();

  // If item is found but pending verification, only admin can see it (simplification for now)
  if (item.type === 'FOUND' && item.status === 'PENDING_VERIFICATION') {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return notFound();
    }
  }

  const session = await getSession();
  const isLoggedIn = !!session;

  return (
    <div className="container" style={{ paddingTop: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      
      {/* Item Details */}
      <div className="glass-panel" style={{ flex: '1 1 500px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2>{item.name}</h2>
          <span style={{ 
            padding: '0.25rem 0.75rem', 
            borderRadius: '1rem', 
            fontWeight: 600,
            backgroundColor: item.type === 'LOST' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: item.type === 'LOST' ? 'var(--danger)' : 'var(--success)'
          }}>
            {item.type}
          </span>
        </div>

        {item.imagePath && (
          <div style={{ width: '100%', height: '300px', background: 'var(--bg-secondary)', borderRadius: '0.5rem', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <img src={item.imagePath} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        )}

        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          <div><strong style={{ color: 'var(--text-muted)' }}>Category:</strong> {item.category}</div>
          <div><strong style={{ color: 'var(--text-muted)' }}>Date:</strong> {new Date(item.date).toLocaleDateString()}</div>
          <div><strong style={{ color: 'var(--text-muted)' }}>Location:</strong> {item.location}</div>
          <div><strong style={{ color: 'var(--text-muted)' }}>Reported By:</strong> {item.reporter.name}</div>
          <div><strong style={{ color: 'var(--text-muted)' }}>Status:</strong> {item.status}</div>
          
          <div>
            <strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Description:</strong> 
            <p style={{ whiteSpace: 'pre-wrap' }}>{item.description}</p>
          </div>
        </div>
      </div>

      {/* Claim Section */}
      <div style={{ flex: '1 1 300px' }}>
        {item.type === 'FOUND' && item.status === 'PUBLISHED' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Is this yours?</h3>
            {isLoggedIn ? (
              <ClaimForm itemId={item.id} />
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>
                You must be <a href="/login" style={{ color: 'var(--accent-primary)' }}>logged in</a> to submit a claim for this item.
              </p>
            )}
          </div>
        )}

        {item.type === 'LOST' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Did you find this?</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              If you found this item, please <a href="/post-item" style={{ color: 'var(--accent-primary)' }}>report it as Found</a> and our security team will link it to this owner.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
