import { useEffect, useState } from 'react';
import api from '../../api/client';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, IndianRupee, Users, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDateRange } from '../../context/DateRangeContext';

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);
  const { dateRange, setDateRange } = useDateRange();

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsRes, insightRes] = await Promise.all([
        api.get('/dashboard', { params: dateRange }),
        api.get('/dashboard/insights', { params: dateRange })
      ]);
      setData(metricsRes.data);
      setInsight(insightRes.data.insight || '');
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!data) return <div className="empty-state">No data available.</div>;

  return (
    <div>
      {/* Page header */}
      <div className="page-topbar">
        <h1>Dashboard Overview</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="date" className="form-input" style={{ width: 150 }}
            value={dateRange.start}
            onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
          />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input
            type="date" className="form-input" style={{ width: 150 }}
            value={dateRange.end}
            onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
          />
          <button className="btn btn-primary btn-sm" onClick={loadData}>Apply</button>
        </div>
      </div>

      {/* AI Business Assistant Banner */}
      <div className="ai-banner">
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <Sparkles size={20} color="var(--accent-light)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--accent-light)', marginBottom: 6, fontSize: 14 }}>
              AI Business Assistant
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              {insight || 'Analyzing your data...'}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon green"><TrendingUp size={20} color="var(--success)" /></div>
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value">{fmt(data.revenue)}</div>
          <div className="kpi-sub">{data.total_sales} transactions</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red"><TrendingDown size={20} color="var(--danger)" /></div>
          <div className="kpi-label">Total Expenses</div>
          <div className="kpi-value">{fmt(data.expenses)}</div>
          <div className="kpi-sub">Operational costs</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon purple"><IndianRupee size={20} color="var(--accent-light)" /></div>
          <div className="kpi-label">Net Profit</div>
          <div className="kpi-value">{fmt(data.profit)}</div>
          <div className="kpi-sub">After all expenses</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon blue"><Users size={20} color="var(--info)" /></div>
          <div className="kpi-label">Active Employees</div>
          <div className="kpi-value">{data.total_employees}</div>
          <div className="kpi-sub">Staff on record</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Revenue Trend</div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily_sales}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-light)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent-light)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--accent-light)" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Top Products</div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_products}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="revenue" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div className="card-title">Recent Sales</div>
        </div>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Employee</th>
                <th>Date & Time</th>
                <th>Payment</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_sales.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, color: 'var(--accent-light)' }}>#{s.id}</td>
                  <td>{s.employee_name || 'Admin'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(s.created_at).toLocaleString()}</td>
                  <td><span className="badge badge-accent">{s.payment_method || 'cash'}</span></td>
                  <td style={{ fontWeight: 800, color: 'var(--success)' }}>{fmt(s.total)}</td>
                </tr>
              ))}
              {!data.recent_sales.length && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No sales yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
