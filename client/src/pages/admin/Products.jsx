import { useEffect, useRef, useState } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Camera, X, Sparkles, Upload, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const emptyForm = { name: '', category: '', description: '', price: '', cost: '', stock_qty: '', low_stock_threshold: '5', unit: 'pcs' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [scanModal, setScanModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState([]);
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/products'); setProducts(data); }
    catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = p => { setEditing(p); setForm({ ...p }); setModal(true); };
  const closeModal = () => { setModal(false); };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/products/${editing.id}`, form); toast.success('Product updated'); }
      else { await api.post('/products', form); toast.success('Product added'); }
      closeModal(); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const { data } = await api.post('/products/analyze-receipt', {
          imageBase64: reader.result.split(',')[1],
          mimeType: file.type
        });
        setScanned(data.items);
      } catch (err) { toast.error(err.response?.data?.error || 'AI scan failed'); }
      finally { setScanning(false); }
    };
    reader.readAsDataURL(file);
  };

  const commitScan = async () => {
    try {
      await api.post('/products/batch', { items: scanned });
      toast.success(`Imported ${scanned.length} products`);
      setScanModal(false); setScanned([]); load();
    } catch { toast.error('Import failed'); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: 38 }} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => setScanModal(true)}>
            <Camera size={16} /> AI Receipt Scan
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Selling Price</th>
              <th>Cost Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const low = p.stock_qty <= (p.low_stock_threshold || 5);
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                  </td>
                  <td><span className="badge badge-accent">{p.category || 'General'}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-light)' }}>₹{p.price}</td>
                  <td style={{ color: 'var(--text-muted)' }}>₹{p.cost || 0}</td>
                  <td>{p.stock_qty} {p.unit}</td>
                  <td>
                    {low
                      ? <span className="status-pill status-inactive"><AlertCircle size={10} /> Low Stock</span>
                      : <span className="status-pill status-active"><CheckCircle2 size={10} /> OK</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}><Edit2 size={13} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">PRODUCT NAME *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">CATEGORY</label>
                  <input className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">SELLING PRICE *</label>
                  <input className="form-input" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">COST PRICE</label>
                  <input className="form-input" type="number" step="0.01" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">STOCK QUANTITY</label>
                  <input className="form-input" type="number" value={form.stock_qty} onChange={e => setForm({ ...form, stock_qty: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">LOW STOCK ALERT</label>
                  <input className="form-input" type="number" value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">UNIT</label>
                  <select className="form-select" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                    <option>pcs</option><option>kg</option><option>box</option><option>pair</option><option>set</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">DESCRIPTION</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update Product' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Scan Modal */}
      {scanModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: scanned.length > 0 ? 760 : 600 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={18} color="var(--accent-light)" />
                <h3 className="modal-title">
                  {scanned.length > 0 ? 'AI Extracted Products' : 'AI Receipt Scanner'}
                </h3>
              </div>
              <button className="modal-close" onClick={() => { setScanModal(false); setScanned([]); }}><X size={20} /></button>
            </div>

            {/* Show upload zone only when no items scanned yet */}
            {scanned.length === 0 && (
              <div
                style={{ border: '2px dashed var(--border-light)', borderRadius: 12, padding: 40, textAlign: 'center', cursor: 'pointer', marginBottom: 20 }}
                onClick={() => fileRef.current?.click()}
              >
                <input type="file" ref={fileRef} hidden accept="image/*, application/pdf" onChange={handleFileChange} />
                {scanning
                  ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <Loader2 size={40} color="var(--accent-light)" className="animate-spin" />
                      <p style={{ fontWeight: 600 }}>Analyzing receipt with AI...</p>
                    </div>
                  : <>
                      <Upload size={36} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                      <p style={{ fontWeight: 600 }}>Click to upload a receipt or invoice</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>JPG, PNG, WEBP, PDF supported</p>
                    </>}
              </div>
            )}

            {/* After scanning — show extracted products table */}
            {scanned.length > 0 && (
              <>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>
                  Review the products extracted from the receipt. <strong>Cost Price</strong> is from the receipt; you should set your <strong>Selling Price</strong> before confirming.
                </p>
                <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)' }}>
                        {['NAME', 'CATEGORY', 'QTY', 'COST PRICE', 'SELLING PRICE', 'DESCRIPTION'].map(h => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {scanned.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 12px' }}>
                            <input style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', color: 'var(--text-primary)', width: 140, fontSize: 12 }}
                              value={item.name} onChange={e => { const s = [...scanned]; s[i].name = e.target.value; setScanned(s); }} />
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <input style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', color: 'var(--text-primary)', width: 72, fontSize: 12 }}
                              value={item.category} onChange={e => { const s = [...scanned]; s[i].category = e.target.value; setScanned(s); }} />
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <input type="number" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', color: 'var(--text-primary)', width: 60, fontSize: 12 }}
                              value={item.stock_qty} onChange={e => { const s = [...scanned]; s[i].stock_qty = e.target.value; setScanned(s); }} />
                          </td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 13 }}>₹{item.cost}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <input type="number" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--success)', borderRadius: 6, padding: '5px 8px', color: 'var(--success)', width: 80, fontWeight: 700, fontSize: 13 }}
                              value={item.price || ''} placeholder={(item.cost * 1.3).toFixed(0)}
                              onChange={e => { const s = [...scanned]; s[i].price = e.target.value; setScanned(s); }} />
                          </td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: 11, maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="form-actions">
                  <button className="btn btn-ghost" onClick={() => setScanned([])}>Cancel</button>
                  <button className="btn btn-success" onClick={commitScan}>
                    <CheckCircle2 size={16} /> Confirm & Add All to Inventory
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
