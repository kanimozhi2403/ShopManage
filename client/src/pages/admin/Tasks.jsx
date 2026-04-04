import { useEffect, useState } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { 
  CheckSquare, Plus, Clock, AlertCircle, CheckCircle2, 
  X, User, Calendar, MoreVertical, Trash2 
} from 'lucide-react';

const emptyTask = { employee_id: '', title: '', description: '', status: 'pending', due_date: '' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyTask);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/tasks').then(r => { setTasks(r.data); setLoading(false); });
    api.get('/employees').then(r => { setEmployees(r.data); });
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee_id || !form.title) return toast.error('Check all required fields');
    try {
      await api.post('/tasks', form);
      toast.success('Task assigned successfully');
      setModal(false); setForm(emptyTask); load();
    } catch (err) { toast.error('Failed to assign task'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}/status`, { status });
      toast.success('Task status updated');
      load();
    } catch (err) { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanent delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task removed');
      load();
    } catch (err) { toast.error('Delete failed'); }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="page" style={{ padding: '28px' }}>
      <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Task Assignment</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Delegate operations and monitor employee activities.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyTask); setModal(true); }}>
          <Plus size={18} /> New Assignment
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Priority & Task</th><th>Assigned To</th><th>Deadline Date</th><th>Progress</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{t.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '300px' }} className="text-truncate">{t.description || 'No detailed briefing provided.'}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><User size={12} /> {t.employee_name || 'Unassigned'}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={12} /> {t.due_date ? new Date(t.due_date).toDateString() : 'N/A'}</div>
                  </td>
                  <td>
                    {t.status === 'pending' && <span className="status-pill status-pending"><Clock size={10} /> Pending</span>}
                    {t.status === 'in_progress' && <span className="status-pill status-in_progress"><AlertCircle size={10} /> In Progress</span>}
                    {t.status === 'done' && <span className="status-pill status-done"><CheckCircle2 size={10} /> Completed</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <select 
                        className="form-select btn-sm" 
                        style={{ width: 'auto', padding: '2px 8px', fontSize: 11 }}
                        value={t.status}
                        onChange={(e) => updateStatus(t.id, e.target.value)}
                      >
                        <option value="pending">Mark Pending</option>
                        <option value="in_progress">Set Active</option>
                        <option value="done">Finalize</option>
                      </select>
                      <button className="btn btn-ghost btn-sm" style={{ padding: 4 }} onClick={() => handleDelete(t.id)}><Trash2 size={12} /></button>
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
              <h3 className="modal-title">New Management Assignment</h3>
              <button className="modal-close" onClick={() => setModal(false)}><X /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Task Objective</label>
                  <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Conduct Stock Audit" />
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Delegate</label>
                  <select className="form-select" value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} required>
                    <option value="">Select Employee...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.email})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input className="form-input" type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} required />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Detailed Briefing</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Outline specifically what needs to be done..." />
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Discard</button>
                <button type="submit" className="btn btn-primary">Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
