import { useEffect, useState } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { Users, UserPlus, Mail, Phone, Edit2, Trash2, X, Shield, ShieldCheck } from 'lucide-react';

const emptyEmp = { name: '', email: '', password: '', phone: '', address: '', salary: '' };

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState(emptyEmp);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/employees').then(r => { setEmployees(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { ...form, role: 'employee' });
      toast.success('New employee profile created');
      setModal(false); setForm(emptyEmp); load();
    } catch (err) { toast.error('Error adding employee'); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/employees/${editing.id}`, form);
      toast.success('Information updated successfully');
      setEditModal(false); load();
    } catch (err) { toast.error('Error updating employee'); }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Are you sure you want to deactivate this staff account?')) return;
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Account deactivated');
      load();
    } catch (err) { toast.error('Failed to deactivate'); }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="page" style={{ padding: '28px' }}>
      <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Staff Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Manage user access and salary records.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyEmp); setModal(true); }}>
          <UserPlus size={18} /> Add Employee
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Name</th><th>Primary Contact</th><th>Base Salary</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.id}>
                  <td>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {e.role === 'admin' ? <ShieldCheck size={14} color="var(--accent-light)" /> : <Shield size={14} color="var(--text-muted)" />}
                      {e.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{e.role} Access</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={12} /> {e.email}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={10} /> {e.phone || 'No phone recorded'}</div>
                  </td>
                  <td style={{ fontWeight: 800 }}>₹{e.salary}</td>
                  <td>
                    {e.is_active ? 
                      <span className="status-pill status-active">Active Profile</span> : 
                      <span className="status-pill status-inactive">Terminated</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" style={{ padding: 6 }} onClick={() => { setEditing(e); setForm(e); setEditModal(true); }}>
                        <Edit2 size={14} />
                      </button>
                      {e.is_active && (
                        <button className="btn btn-ghost btn-sm" style={{ padding: 6, color: 'var(--danger)' }} onClick={() => handleDeactivate(e.id)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
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
              <h3 className="modal-title">New Staff Registration</h3>
              <button className="modal-close" onClick={() => setModal(false)}><X /></button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Rahul Sharma" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="name@shop.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Temporary Password</label>
                  <input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required placeholder="Minimum 6 chars" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 ..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Salary (₹)</label>
                  <input className="form-input" type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} placeholder="Fixed base pay" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Residential Address</label>
                  <textarea className="form-textarea" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full correspondence address..." />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Discard</button>
                <button type="submit" className="btn btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Edit Employee Information</h3>
              <button className="modal-close" onClick={() => setEditModal(false)}><X /></button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary (₹)</label>
                  <input className="form-input" type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Address</label>
                  <textarea className="form-textarea" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
