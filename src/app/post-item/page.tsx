import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PostItemForm from './PostItemForm';

export default async function PostItemPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 style={{ textAlign: 'center' }}>Report an Item</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Please provide the details of the item you have lost or found.
      </p>
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <PostItemForm />
      </div>
    </div>
  );
}
