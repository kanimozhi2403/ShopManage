import { useEffect, useState } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, TrendingUp, TrendingDown, IndianRupee, PieChart as PieIcon, LineChart as LineIcon } from 'lucide-react';
import { useDateRange } from '../../context/DateRangeContext';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { dateRange, setDateRange } = useDateRange();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard', { params: dateRange });
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load reporting data');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!data) return;
    
    let csv = "Category,Metric,Value\n";
    csv += `Summary,Total Revenue,${data.revenue}\n`;
    csv += `Summary,Total Expenses,${data.expenses}\n`;
    csv += `Summary,Net Profit,${data.profit}\n`;
    csv += `Summary,Total Transactions,${data.total_sales}\n\n`;

    csv += "Daily Performance,Date,Revenue\n";
    data.daily_sales.forEach(s => {
      csv += `Trend,${s.day},${s.revenue}\n`;
    });
    csv += "\n";

    csv += "Product Rankings,Product,Category,Sales Count,Revenue\n";
    data.top_products.forEach(p => {
      csv += `Top Product,${p.name},${p.category || 'General'},${p.sales_count},${p.revenue}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `report_${dateRange.start}_to_${dateRange.end}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!data) return <div className="empty-state"><p>No data available for reports.</p></div>;

  const COLORS = ['#6c63ff', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

  return (
    <div className="page" style={{ padding: '28px' }}>
      <div className="topbar" style={{ background: 'transparent', border: 'none', padding: '0 0 24px 0', position: 'static' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Reporting Hub</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Deep dive into your business metrics and trends.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Calendar size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="date" className="form-input btn-sm" style={{ paddingLeft: 32, width: 140 }} value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
          </div>
          <span style={{ color: 'var(--text-muted)' }}>—</span>
          <div style={{ position: 'relative' }}>
            <Calendar size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="date" className="form-input btn-sm" style={{ paddingLeft: 32, width: 140 }} value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
          </div>
          <button className="btn btn-primary btn-sm" onClick={loadData}>Refresh</button>
          <button className="btn btn-ghost btn-sm" onClick={downloadCSV}><Download size={14} /> Export CSV</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon purple"><TrendingUp size={24} color="var(--accent-light)" /></div>
          <div>
            <div className="kpi-label">Total Revenue</div>
            <div className="kpi-value">{fmt(data.revenue)}</div>
            <div className="kpi-sub">Gross income for period</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon orange"><TrendingDown size={24} color="var(--warning)" /></div>
          <div>
            <div className="kpi-label">Total Expenses</div>
            <div className="kpi-value">{fmt(data.expenses)}</div>
            <div className="kpi-sub">Total operational cost</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><IndianRupee size={24} color="var(--success)" /></div>
          <div>
            <div className="kpi-label">Net Profit</div>
            <div className="kpi-value">{fmt(data.profit)}</div>
            <div className="kpi-sub">Overall profitability</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon blue"><PieIcon size={24} color="var(--info)" /></div>
          <div>
            <div className="kpi-label">Conversion</div>
            <div className="kpi-value">{(data.revenue / (data.total_sales || 1)).toFixed(2)}</div>
            <div className="kpi-sub">Average transaction value</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Daily Sales Performance</div><LineIcon size={18} color="var(--text-muted)" /></div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily_sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 10}} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.1} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Product Category Mix</div><PieIcon size={18} color="var(--text-muted)" /></div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.top_products.map(p => ({ name: p.name, value: parseFloat(p.revenue) }))}
                  innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                >
                  {data.top_products.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
