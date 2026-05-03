import { queryAll, queryOne } from '@/lib/sqlite';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminControls from './AdminControls';

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/');
  }

  const params = await searchParams;
  const view = params.view || 'overview';

  // Fetch data via direct SQL
  const pendingItems: any[] = await queryAll(`
    SELECT i.*, u.name as reporterName 
    FROM Item i 
    LEFT JOIN User u ON i.reporterId = u.id 
    WHERE i.status = 'PENDING_VERIFICATION' 
    ORDER BY i.createdAt DESC
  `);
  
  // Map for UI compatibility
  pendingItems.forEach(i => i.reporter = { name: i.reporterName });

  const pendingClaims: any[] = await queryAll(`
    SELECT c.*, i.name as itemName, u.name as claimerName, u.email as claimerEmail 
    FROM Claim c 
    JOIN Item i ON c.itemId = i.id 
    JOIN User u ON c.claimerId = u.id 
    WHERE c.status = 'PENDING' 
    ORDER BY c.createdAt ASC
  `);

  pendingClaims.forEach(c => {
    c.item = { id: c.itemId, name: c.itemName };
    c.claimer = { name: c.claimerName, email: c.claimerEmail };
  });

  const suspendedUsers: any[] = await queryAll(`
    SELECT id, name, email, loginAttempts 
    FROM User 
    WHERE isSuspended = 1
  `);

  const itemStats: any = await queryOne('SELECT COUNT(*) as count FROM Item');
  const userStats: any = await queryOne('SELECT COUNT(*) as count FROM User');

  const allItemsCount = itemStats.count;
  const allUsersCount = userStats.count;

  return (
    <div className="page dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-label">Admin Management</div>
        <Link href="/admin" className={`sidebar-item ${view === 'overview' ? 'active' : ''}`}>
          <span className="icon">📊</span> Overview
        </Link>
        <Link href="/admin?view=pending-posts" className={`sidebar-item ${view === 'pending-posts' ? 'active' : ''}`}>
          <span className="icon">📝</span> Review Posts
          {pendingItems.length > 0 && <span className="sidebar-badge">{pendingItems.length}</span>}
        </Link>
        <Link href="/admin?view=claims" className={`sidebar-item ${view === 'claims' ? 'active' : ''}`}>
          <span className="icon">🛡️</span> Claims
          {pendingClaims.length > 0 && <span className="sidebar-badge">{pendingClaims.length}</span>}
        </Link>
        <Link href="/admin?view=users" className={`sidebar-item ${view === 'users' ? 'active' : ''}`}>
          <span className="icon">👥</span> Users
          {suspendedUsers.length > 0 && <span className="sidebar-badge">{suspendedUsers.length}</span>}
        </Link>
      </aside>

      <main className="dashboard-main">
        <h1 className="dashboard-title">Administrator Dashboard</h1>
        <p className="dashboard-subtitle">Manage platform operations, verify posts, and oversee claims.</p>

        {view === 'overview' && (
          <div className="stat-cards">
            <div className="stat-card blue">
              <div className="stat-card-icon">📦</div>
              <div className="stat-card-number">{allItemsCount}</div>
              <div className="stat-card-label">Total Items</div>
            </div>
            <div className="stat-card gold">
              <div className="stat-card-icon">🛡️</div>
              <div className="stat-card-number">{pendingClaims.length}</div>
              <div className="stat-card-label">Pending Claims</div>
            </div>
            <div className="stat-card green">
              <div className="stat-card-icon">👥</div>
              <div className="stat-card-number">{allUsersCount}</div>
              <div className="stat-card-label">Total Users</div>
            </div>
            <div className="stat-card red">
              <div className="stat-card-icon">⚠️</div>
              <div className="stat-card-number">{suspendedUsers.length}</div>
              <div className="stat-card-label">Suspended Accs</div>
            </div>
          </div>
        )}

        {(view === 'overview' || view === 'pending-posts') && (
          <div className="data-table-wrap">
            <div className="data-table-header">
              <h3 className="data-table-title">Items Pending Verification</h3>
            </div>
            {pendingItems.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-icon">✅</div>
                <div className="empty-title">All caught up</div>
                <div className="empty-desc">No items pending verification.</div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Reported By</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingItems.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: 'var(--navy)' }}>
                        <Link href={`/item/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {item.name}
                        </Link>
                      </td>
                      <td><span className={`item-badge badge-${item.type}`}>{item.type}</span></td>
                      <td>{item.reporter.name}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>
                        <AdminControls type="item" id={item.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {(view === 'overview' || view === 'claims') && (
          <div className="data-table-wrap">
            <div className="data-table-header">
              <h3 className="data-table-title">Pending Claims</h3>
            </div>
            {pendingClaims.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-icon">✅</div>
                <div className="empty-title">All caught up</div>
                <div className="empty-desc">No claims pending approval.</div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Claimant</th>
                    <th>Proof Provided</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingClaims.map(claim => (
                    <tr key={claim.id}>
                      <td style={{ fontWeight: 600, color: 'var(--navy)' }}>
                        <Link href={`/item/${claim.item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {claim.item.name}
                        </Link>
                      </td>
                      <td>
                        {claim.claimer.name}<br/>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{claim.claimer.email}</span>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={claim.proofDetails}>
                          {claim.proofDetails}
                        </div>
                      </td>
                      <td>
                        <AdminControls type="claim" id={claim.id} itemId={claim.item.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {(view === 'overview' || view === 'users') && suspendedUsers.length > 0 && (
          <div className="data-table-wrap">
            <div className="data-table-header">
              <h3 className="data-table-title">Suspended Accounts</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Failed Logins</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suspendedUsers.map(user => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className="item-badge badge-lost">{user.loginAttempts}</span></td>
                    <td>
                      <AdminControls type="user" id={user.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  );
}
