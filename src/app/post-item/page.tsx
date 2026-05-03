import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PostItemForm from './PostItemForm';

export default async function PostItemPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const params = await searchParams;
  const initialType = params.type === 'FOUND' ? 'FOUND' : 'LOST';

  return (
    <div className="page">
      <main className="form-page" style={{ maxWidth: '640px' }}>
        <div className="form-card">
          <div className="form-header">
            <div className="form-icon">📝</div>
            <h2>{initialType === 'FOUND' ? 'Register Found Item' : 'Report Lost Item'}</h2>
            <p>Please provide detailed information to help us {initialType === 'FOUND' ? 'find the owner' : 'recover your item'}.</p>
          </div>
          
          <div className="form-body">
            <PostItemForm initialType={initialType} />
          </div>
        </div>
      </main>
    </div>
  );
}
