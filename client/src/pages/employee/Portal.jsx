import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  ShoppingBag, CheckCircle2, Clock, 
  IndianRupee, Calendar, TrendingUp, 
  ArrowRight, Sparkles 
} from 'lucide-react';

export default function EmployeePortal() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.all([api.get('/tasks'), api.get('/sales')]);
      setTasks(tRes.data);
      setSales(sRes.data);
    } catch (err) {
      toast.error('Failed to sync portal data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status });
      toast.success('Progress saved');
      loadData();
    } catch { toast.error('Check your connection'); }
  };

  const today = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.created_at).toDateString() === today);
  const todayRev = todaySales.reduce((sum, s) => sum + parseFloat(s.total), 0);
  const pendingTasks = tasks.filter(t => t.status !== 'done');

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="page" style={{ padding: '28px' }}>
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)', borderLeft: '4px solid var(--accent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Welcome back, {user?.name.split(' ')[0]}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '13px', marginTop: 4 }}>
              <Calendar size={14} />
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div className="badge badge-accent" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} /> Active Session
          </div>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon purple"><ShoppingBag size={24} color="var(--accent-light)" /></div>
          <div>
            <div className="kpi-label">Today's Transactions</div>
            <div className="kpi-value">{todaySales.length}</div>
            <div className="kpi-sub">Your personal total</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><IndianRupee size={24} color="var(--success)" /></div>
          <div>
            <div className="kpi-label">Today's Revenue</div>
            <div className="kpi-value">₹{todayRev.toLocaleString('en-IN')}</div>
            <div className="kpi-sub">Total sales volume</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon orange"><CheckCircle2 size={24} color="var(--warning)" /></div>
          <div>
            <div className="kpi-label">Pending Tasks</div>
            <div className="kpi-value">{pendingTasks.length}</div>
            <div className="kpi-sub">Scheduled operations</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon blue"><TrendingUp size={24} color="var(--info)" /></div>
          <div>
            <div className="kpi-label">Performance</div>
            <div className="kpi-value">Good</div>
            <div className="kpi-sub">Activity level: Normal</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header" style={{ padding: 20 }}>
            <div className="card-title">Assigned Active Tasks</div>
            <ArrowRight size={16} />
          </div>
          <div style={{ padding: '0 20px 20px' }}>
            {pendingTasks.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                <p>All caught up! No pending tasks.</p>
              </div>
            ) : (
              pendingTasks.slice(0, 5).map(task => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{task.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} /> Due {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'ASAP'}
                    </div>
                  </div>
                  <select 
                    className="form-select btn-sm" 
                    style={{ width: 'auto', padding: '2px 8px', fontSize: 11 }}
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  >
                    <option value="pending">Mark Pending</option>
                    <option value="in_progress">Start Task</option>
                    <option value="done">Complete</option>
                  </select>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="card-header" style={{ padding: 20 }}>
            <div className="card-title">Your Recent Logged Sales</div>
            <TrendingUp size={16} />
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>ID</th><th>Time</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {todaySales.slice(0, 5).map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-light)' }}>#{s.id}</td>
                    <td>{new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ fontWeight: 800 }}>₹{s.total}</td>
                    <td><span className="badge badge-success">Paid</span></td>
                  </tr>
                ))}
                {todaySales.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No sales recorded today</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
