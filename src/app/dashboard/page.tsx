import { queryAll } from '@/lib/sqlite';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function UserDashboard() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Fetch items reported by the user
  const reportedItems: any[] = await queryAll(
    'SELECT * FROM Item WHERE reporterId = ? ORDER BY createdAt DESC',
    [session.userId]
  );

  // Fetch claims made by the user
  const claims: any[] = await queryAll(`
    SELECT c.*, i.name as itemName 
    FROM Claim c 
    JOIN Item i ON c.itemId = i.id 
    WHERE c.claimerId = ? 
    ORDER BY c.createdAt DESC
  `, [session.userId]);

  // Map for UI compatibility
  claims.forEach(c => {
    c.item = { name: c.itemName };
  });

  const foundItemsCount = reportedItems.filter(i => i.type === 'FOUND').length;
  const lostItemsCount = reportedItems.filter(i => i.type === 'LOST').length;

  return (
    <div className="page dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-label">Main Menu</div>
        <Link href="/dashboard" className="sidebar-item active">
          <span className="icon">📊</span> Overview
        </Link>
        <Link href="/post-item?type=LOST" className="sidebar-item">
          <span className="icon">🔍</span> Report Lost Item
        </Link>
        <Link href="/post-item?type=FOUND" className="sidebar-item">
          <span className="icon">📢</span> Register Found Item
        </Link>
      </aside>

      <main className="dashboard-main">
        <h1 className="dashboard-title">User Dashboard</h1>
        <p className="dashboard-subtitle">Manage your reported items and claims.</p>

        {/* Stats */}
        <div className="stat-cards">
          <div className="stat-card blue">
            <div className="stat-card-icon">📁</div>
            <div className="stat-card-number">{reportedItems.length}</div>
            <div className="stat-card-label">Total Posts</div>
          </div>
          <div className="stat-card red">
            <div className="stat-card-icon">🔍</div>
            <div className="stat-card-number">{lostItemsCount}</div>
            <div className="stat-card-label">Items Lost</div>
          </div>
          <div className="stat-card green">
            <div className="stat-card-icon">📢</div>
            <div className="stat-card-number">{foundItemsCount}</div>
            <div className="stat-card-label">Items Found</div>
          </div>
          <div className="stat-card gold">
            <div className="stat-card-icon">📝</div>
            <div className="stat-card-number">{claims.length}</div>
            <div className="stat-card-label">Total Claims</div>
          </div>
        </div>

        {/* Claims Table */}
        <div className="data-table-wrap">
          <div className="data-table-header">
            <h3 className="data-table-title">My Claims</h3>
          </div>
          {claims.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <div className="empty-title">No claims found</div>
              <div className="empty-desc">You haven't claimed any items yet.</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Date Claimed</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(claim => (
                  <tr key={claim.id}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{claim.item.name}</td>
                    <td>{new Date(claim.createdAt).toLocaleDateString()}</td>
                    <td><span className={`item-badge badge-${claim.status}`}>{claim.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <Link href={`/item/${claim.itemId}`} className="btn btn-outline-dark btn-xs">View Item</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* User Posts Grid */}
        <div className="data-table-wrap" style={{ background: 'transparent', border: 'none', overflow: 'visible' }}>
          <div className="data-table-header" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
            <h3 className="data-table-title">My Posts</h3>
          </div>
          
          {reportedItems.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <div className="empty-icon">📁</div>
              <div className="empty-title">No posts found</div>
              <div className="empty-desc">You haven't reported any items yet.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {reportedItems.map(item => (
                <Link href={`/item/${item.id}`} key={item.id} className={`item-card ${item.type.toLowerCase()}`}>
                  <div>
                    <span className={`item-badge badge-${item.type}`}>{item.type}</span>
                    <span className={`item-badge badge-${item.status}`} style={{ marginLeft: '6px' }}>{item.status.replace('_', ' ')}</span>
                  </div>
                  <div className="item-title">{item.name}</div>
                  <div className="item-desc">{item.description}</div>
                  <div className="item-footer">
                    <div className="item-date">{new Date(item.date).toLocaleDateString()}</div>
                    <div style={{ color: 'var(--blue)', fontSize: '12px', fontWeight: 600 }}>Manage →</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
