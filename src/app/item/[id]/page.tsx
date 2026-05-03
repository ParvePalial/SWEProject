import { queryOne } from '@/lib/sqlite';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ClaimForm from './ClaimForm';

export default async function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const item: any = await queryOne(`
    SELECT i.*, u.name as reporterName 
    FROM Item i 
    LEFT JOIN User u ON i.reporterId = u.id 
    WHERE i.id = ?
  `, [id]);

  if (!item) return notFound();

  // Map direct query result to look like Prisma object for the UI
  item.reporter = { name: item.reporterName };

  if (item.type === 'FOUND' && item.status === 'PENDING_VERIFICATION') {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return notFound();
    }
  }

  const session = await getSession();
  const isLoggedIn = !!session;

  return (
    <div className="page" style={{ background: 'var(--cream)', padding: '40px 0' }}>
      <main>
        <div className="detail-section">
          
          <Link href="/" style={{ display: 'inline-block', marginBottom: '20px', color: 'var(--text-light)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            ← Back to Directory
          </Link>
          
          <div className="detail-card">
            
            <div className="detail-hero">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className={`item-badge badge-${item.type}`} style={{ background: 'rgba(255,255,255,0.2)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.4)', marginBottom: '12px' }}>
                    {item.type}
                  </span>
                  <span className={`item-badge badge-${item.status}`} style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', marginLeft: '8px' }}>
                    {item.status.replace('_', ' ')}
                  </span>
                  <h2>{item.name}</h2>
                  <div className="detail-meta">
                    <div className="detail-meta-item">📅 {new Date(item.date).toLocaleDateString()}</div>
                    <div className="detail-meta-item">📍 {item.location}</div>
                    <div className="detail-meta-item">🏷️ {item.category}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="detail-body">
              <div className="detail-grid">
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="detail-field">
                    <div className="detail-field-label">Description</div>
                    <div className="detail-field-value" style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                      {item.description}
                    </div>
                  </div>
                </div>
                
                <div className="detail-field">
                  <div className="detail-field-label">Reference ID</div>
                  <div className="detail-field-value mono" style={{ fontSize: '13px' }}>{item.id}</div>
                </div>
                
                <div className="detail-field">
                  <div className="detail-field-label">Reported By</div>
                  <div className="detail-field-value">{item.reporter.name}</div>
                </div>
                
                {item.imagePath && (
                  <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                    <div className="detail-field-label" style={{ marginBottom: '10px' }}>Image Attachment</div>
                    <div style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--cream-dark)' }}>
                      <img src={item.imagePath} alt={item.name} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }} />
                    </div>
                  </div>
                )}
                
              </div>
              
              <hr className="form-divider" style={{ margin: '32px 0' }} />
              
              <div>
                {item.type === 'FOUND' && item.status === 'PUBLISHED' && (
                  <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '24px', textAlign: 'center' }}>
                    <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', color: 'var(--navy)', marginBottom: '8px' }}>Is this yours?</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '20px' }}>
                      If you are the owner of this item, you can submit a claim request. You will need to provide proof of ownership.
                    </p>
                    {isLoggedIn ? (
                      <div style={{ maxWidth: '250px', margin: '0 auto' }}>
                        <ClaimForm itemId={item.id} />
                      </div>
                    ) : (
                      <div style={{ maxWidth: '250px', margin: '0 auto' }}>
                        <Link href={`/login`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Login to Claim</Link>
                      </div>
                    )}
                  </div>
                )}

                {item.type === 'LOST' && (
                  <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '24px', textAlign: 'center' }}>
                    <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', color: 'var(--navy)', marginBottom: '8px' }}>Did you find this?</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '20px' }}>
                      If you found this item, please report it to help the owner get it back.
                    </p>
                    <div style={{ maxWidth: '250px', margin: '0 auto' }}>
                      <Link href="/post-item?type=FOUND" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Report as Found</Link>
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
