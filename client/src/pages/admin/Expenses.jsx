import { useEffect, useState } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { IndianRupee, CreditCard, Calendar, Filter, Plus, Trash2, X, AlertCircle } from 'lucide-react';

const emptyExp = { category: '', description: '', amount: '', expense_date: new Date().toISOString().split('T')[0] };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyExp);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/expenses').then(r => { setExpenses(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) return toast.error('Check all required fields');
    try {
      await api.post('/expenses', form);
      toast.success('Expense recorded');
      setModal(false); setForm(emptyExp); load();
    } catch (err) { toast.error('Failed to log expense'); }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="page" style={{ padding: '28px' }}>
      <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Expense Log</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Track daily operational costs and bills.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyExp); setModal(true); }}>
          <Plus size={18} /> New Expense
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Reference</th><th>Description</th><th>Expenditure Date</th><th>Category</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 700, color: 'var(--accent-light)' }}>EXP-{e.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{e.category}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{e.description || 'No notes provided'}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={12} /> {new Date(e.expense_date).toDateString()}</div>
                  </td>
                  <td><span className="badge badge-accent" style={{ textTransform: 'capitalize' }}>{e.category}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--danger)' }}>₹{e.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Record Daily Expense</h3>
              <button className="modal-close" onClick={() => setModal(false)}><X /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Expenditure Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                    <option value="">Select Category...</option>
                    <option value="rent">Shop Rent</option>
                    <option value="electricity">Utility (Electricity/Water)</option>
                    <option value="salary">Staff Salary Advance</option>
                    <option value="transport">Logistics & Transport</option>
                    <option value="marketing">Sales & Marketing</option>
                    <option value="maintanence">Maintenance & Repairs</option>
                    <option value="re-stock">Inventory Purchase</option>
                    <option value="other">Other/Miscellaneous</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Amount (₹)</label>
                  <input className="form-input" type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Log Date</label>
                  <input className="form-input" type="date" value={form.expense_date} onChange={e => setForm({...form, expense_date: e.target.value})} required />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Expense Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What was this expense for? (bill numbers, recipients...)" />
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">File Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
