'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostItemForm({ initialType = 'LOST' }: { initialType?: 'LOST' | 'FOUND' }) {
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
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label className="form-label">Report Type <span>*</span></label>
        <select name="type" className="form-control" required defaultValue={initialType}>
          <option value="LOST">I Lost an Item</option>
          <option value="FOUND">I Found an Item</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Item Name <span>*</span></label>
          <input type="text" name="name" className="form-control" required placeholder="e.g. Blue Backpack" />
        </div>

        <div className="form-group">
          <label className="form-label">Category <span>*</span></label>
          <select name="category" className="form-control" required defaultValue="">
            <option value="" disabled>Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Documents">Documents/ID</option>
            <option value="Accessories">Accessories</option>
            <option value="Stationery">Stationery</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Date (Lost or Found) <span>*</span></label>
          <input type="date" name="date" className="form-control" required />
        </div>

        <div className="form-group">
          <label className="form-label">Location <span>*</span></label>
          <input type="text" name="location" className="form-control" required placeholder="e.g. Main Library" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description <span>*</span></label>
        <textarea name="description" className="form-control" required rows={4} placeholder="Provide details like color, brand, specific marks..."></textarea>
      </div>

      <div className="form-group">
        <label className="form-label">Upload Image (Optional)</label>
        <div className={`upload-area ${imageFile ? 'has-file' : ''}`} onClick={() => document.getElementById('imageUpload')?.click()}>
          <div className="upload-icon">{imageFile ? '✅' : '📷'}</div>
          <div className="upload-text">
            {imageFile ? (
              <span>{imageFile.name}</span>
            ) : (
              <><span>Click to upload</span> or drag and drop an image of the item</>
            )}
          </div>
          <input 
            type="file" 
            id="imageUpload"
            accept="image/*" 
            onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
            style={{ display: 'none' }} 
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  );
}
