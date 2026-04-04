import { useEffect, useState } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { 
  CheckSquare, Clock, AlertCircle, CheckCircle2, 
  User, Calendar, List
} from 'lucide-react';

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/tasks').then(r => { setTasks(r.data); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}/status`, { status });
      toast.success('Task status updated');
      load();
    } catch (err) { toast.error('Update failed'); }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="page" style={{ padding: '28px' }}>
      <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>My Shop Assignments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Manage and report progress on your assigned responsibilities.</p>
        </div>
        <div className="badge badge-accent" style={{ padding: '8px 16px' }}><List size={14} /> {tasks.length} Total</div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Priority & Assignment</th><th>Due Date</th><th>Current Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No tasks currently on your dashboard.</td></tr>
              ) : (
                tasks.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{t.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '400px' }}>{t.description || 'Check with manager for details.'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={12} /> {t.due_date ? new Date(t.due_date).toDateString() : 'N/A'}</div>
                    </td>
                    <td>
                      {t.status === 'pending' && <span className="status-pill status-pending"><Clock size={10} /> Pending</span>}
                      {t.status === 'in_progress' && <span className="status-pill status-in_progress"><AlertCircle size={10} /> Doing It</span>}
                      {t.status === 'done' && <span className="status-pill status-done"><CheckCircle2 size={10} /> Done</span>}
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
                          <option value="in_progress">Start Working</option>
                          <option value="done">Finish Task</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
