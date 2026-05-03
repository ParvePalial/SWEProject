import { queryAll } from '@/lib/sqlite';
import Link from 'next/link';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams;
  const q = params.q || '';
  const type = params.type || '';
  const category = params.category || '';

  let sql = `
    SELECT i.*, u.name as reporterName 
    FROM Item i
    LEFT JOIN User u ON i.reporterId = u.id
    WHERE i.status = 'PUBLISHED'
  `;
  const sqlParams: any[] = [];

  if (q) {
    sql += ` AND (i.name LIKE ? OR i.description LIKE ? OR i.location LIKE ?)`;
    const search = `%${q}%`;
    sqlParams.push(search, search, search);
  }
  if (type) {
    sql += ` AND i.type = ?`;
    sqlParams.push(type);
  }
  if (category) {
    sql += ` AND i.category = ?`;
    sqlParams.push(category);
  }

  sql += ` ORDER BY i.createdAt DESC`;

  const items = await queryAll(sql, sqlParams);

  // Calculate stats based on all items
  const foundItemsCount = items.filter((i: any) => i.type === 'FOUND').length;
  const lostItemsCount = items.filter((i: any) => i.type === 'LOST').length;
  const returnedItemsCount = items.filter((i: any) => i.status === 'RETURNED').length;

  return (
    <div className="page">
      <main>
        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-badge">🎓 SE VLabs Institute</div>
          <h1>Lost & <span>Found</span></h1>
          <p>A centralized digital platform to report lost items, register found items, and submit claim requests within the campus.</p>
          <div className="hero-actions">
            <a href="#search-section" className="btn btn-primary">Search Items</a>
            <Link href="/post-item?type=LOST" className="btn btn-outline">Report an Item</Link>
          </div>
        </section>

        {/* STATS BAR */}
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-number">{foundItemsCount}</div>
            <div className="stat-label">Items Found</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{lostItemsCount}</div>
            <div className="stat-label">Items Lost</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{returnedItemsCount}</div>
            <div className="stat-label">Successfully Returned</div>
          </div>
        </div>

        {/* SEARCH SECTION */}
        <section className="search-section" id="search-section">
          <div className="search-wrap">
            <div className="search-title">Search Directory</div>
            <form className="search-row" method="GET">
              <div className="search-input-wrap">
                <span className="search-icon">🔍</span>
                <input type="text" name="q" className="search-input" placeholder="What are you looking for?" defaultValue={q} />
              </div>
              <select name="type" className="search-select" defaultValue={type}>
                <option value="">All Types</option>
                <option value="LOST">Lost Items</option>
                <option value="FOUND">Found Items</option>
              </select>
              <select name="category" className="search-select" defaultValue={category}>
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Documents">Documents/ID</option>
                <option value="Accessories">Accessories</option>
                <option value="Stationery">Stationery</option>
                <option value="Other">Other</option>
              </select>
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
          </div>
        </section>

        {/* TABS (Handled by Search Params in Next.js, but mapping visual style) */}
        <div className="tabs">
          <Link href="/?type=" className={`tab ${!type ? 'active' : ''}`}>All Items</Link>
          <Link href="/?type=LOST" className={`tab ${type === 'LOST' ? 'active' : ''}`}>Lost</Link>
          <Link href="/?type=FOUND" className={`tab ${type === 'FOUND' ? 'active' : ''}`}>Found</Link>
        </div>

        {/* ITEMS GRID */}
        <section className="items-section">
          <div className="items-container">
            <div className="items-header">
              <div className="items-count">Showing <strong>{items.length}</strong> items</div>
            </div>
            
            {items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📂</div>
                <div className="empty-title">No items found</div>
                <div className="empty-desc">Try adjusting your search filters.</div>
              </div>
            ) : (
              <div className="items-grid">
              {items.map((item: any) => (
                <Link href={`/item/${item.id}`} key={item.id} className={`item-card ${item.type.toLowerCase()}`}>
                  {item.imagePath && (
                    <div className="item-card-image">
                      <img src={item.imagePath} alt={item.name} />
                    </div>
                  )}
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className={`item-badge badge-${item.type}`}>{item.type}</span>
                      <span className={`item-badge badge-${item.status}`} style={{ opacity: 0.8 }}>{item.status.replace('_', ' ')}</span>
                    </div>
                    <div className="item-title">{item.name}</div>
                    <div className="item-desc">{item.description}</div>
                    <div className="item-meta">
                      <div className="item-meta-tag">📍 {item.location}</div>
                      <div className="item-meta-tag">🏷️ {item.category}</div>
                    </div>
                    <div className="item-footer">
                      <div className="item-date">{new Date(item.date).toLocaleDateString()}</div>
                      <div style={{ color: 'var(--blue)', fontSize: '12px', fontWeight: 600 }}>View Details →</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
