import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams;
  const q = params.q || '';
  const type = params.type || '';
  const category = params.category || '';

  const queryParams = new URLSearchParams();
  if (q) queryParams.set('q', q);
  if (type) queryParams.set('type', type);
  if (category) queryParams.set('category', category);
  
  const queryStr = queryParams.toString();
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/items${queryStr ? `?${queryStr}` : ''}`;
  
  let items = [];
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      items = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch items');
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>Lost & Found</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
          Search for lost items or see what others have found across the institute campus.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '4rem', background: 'transparent', boxShadow: 'none' }}>
        <form className="search-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search Query</label>
            <input type="text" name="q" defaultValue={q} placeholder="Item name, description, location..." />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Type</label>
            <select name="type" defaultValue={type}>
              <option value="">All Items</option>
              <option value="LOST">Lost Items</option>
              <option value="FOUND">Found Items</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select name="category" defaultValue={category}>
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Documents">Documents/ID</option>
              <option value="Accessories">Accessories</option>
              <option value="Stationery">Stationery</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '46px' }}>Search</button>
        </form>
      </div>

      {/* Items Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {items.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <h3>No items found</h3>
            <p>Try adjusting your search filters.</p>
          </div>
        ) : (
          items.map((item: any) => (
            <Link href={`/item/${item.id}`} key={item.id} className="glass-panel item-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', transition: 'var(--transition)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ 
                  padding: '0.15rem 0.5rem', 
                  borderRadius: '4px', 
                  fontSize: '0.7rem', 
                  fontWeight: 600,
                  border: item.type === 'LOST' ? '1px solid var(--danger)' : '1px solid var(--success)',
                  color: item.type === 'LOST' ? 'var(--danger)' : 'var(--success)',
                  letterSpacing: '0.05em'
                }}>
                  {item.type}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(item.date).toLocaleDateString()}</span>
              </div>
              
              {item.imagePath && (
                <div style={{ width: '100%', height: '150px', background: 'var(--bg-secondary)', borderRadius: '0.5rem', marginBottom: '1rem', overflow: 'hidden' }}>
                  <img src={item.imagePath} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{item.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.description}
              </p>
              
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <div>📍 {item.location}</div>
                <div>🏷️ {item.category}</div>
              </div>
            </Link>
          ))
        )}
      </div>
      
      <style>{`
        .item-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}
