import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function FlaggedComments() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/flagged-comments');
      setItems(data.items || []);
    } catch (err) {
      console.error('Failed to load flagged comments', err);
      toast.error('Could not load flagged comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/flagged-comments/${id}/approve`);
      toast.success('Approved');
      fetchItems();
    } catch (err) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/flagged-comments/${id}/reject`);
      toast.success('Rejected');
      fetchItems();
    } catch (err) {
      toast.error('Failed to reject');
    }
  };

  if (loading) return <div className="page-container"><p>Loading flagged comments…</p></div>;

  return (
    <div className="page-container" style={{ padding: '0px', maxWidth: '900px', margin: '0 auto', marginTop: '-50px' }}>
      <div style={{ marginTop: 80 }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: 16, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13 }}>← Back</button>
        <h8 className="gradient-text flex text-2xl ml-5 text-center justify-center mb-5 font-bold">Flagged Comments</h8>
        {items.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)' }}>No flagged items</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {items.map((it) => (
              <div key={it._id} className="glass-card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700 }}>{it.text}</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-tertiary)' }}>{it.sourceType} • {new Date(it.createdAt).toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleApprove(it._id)} className="btn btn-success btn-sm text-green-600">Approve</button>
                    <button onClick={() => handleReject(it._id)} className="btn btn-error btn-sm text-red-500">Reject</button>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <pre style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{JSON.stringify(it.moderation || {}, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
