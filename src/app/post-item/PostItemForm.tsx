'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostItemForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      let imagePath = null;
      if (imageFile) {
        const fileData = new FormData();
        fileData.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: fileData
        });
        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json();
          imagePath = uploadResult.url;
        } else {
          setError('Image upload failed');
          setLoading(false);
          return;
        }
      }

      const postData = {
        type: data.type,
        name: data.name,
        category: data.category,
        description: data.description,
        location: data.location,
        date: data.date,
        imagePath
      };

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const result = await res.json();
        setError(result.error || 'Failed to post item');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="form-error" style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>{error}</div>}

      <div className="form-group">
        <label className="form-label">Report Type</label>
        <select name="type" required defaultValue="LOST">
          <option value="LOST">I Lost an Item</option>
          <option value="FOUND">I Found an Item</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Item Name</label>
        <input type="text" name="name" required placeholder="e.g. Blue Backpack" />
      </div>

      <div className="form-group">
        <label className="form-label">Category</label>
        <select name="category" required defaultValue="">
          <option value="" disabled>Select Category</option>
          <option value="Electronics">Electronics</option>
          <option value="Documents">Documents/ID</option>
          <option value="Accessories">Accessories</option>
          <option value="Stationery">Stationery</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Date (Lost or Found)</label>
        <input type="date" name="date" required />
      </div>

      <div className="form-group">
        <label className="form-label">Location</label>
        <input type="text" name="location" required placeholder="e.g. Main Library, 2nd Floor" />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea name="description" required rows={4} placeholder="Provide details like color, brand, specific marks..."></textarea>
      </div>

      <div className="form-group">
        <label className="form-label">Upload Image (Optional)</label>
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} style={{ padding: '0.5rem' }} />
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  );
}
