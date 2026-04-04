import { useEffect, useState } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { 
  ShoppingCart, Search, Plus, Minus, Trash2, 
  CreditCard, Banknote, History, Receipt, Printer
} from 'lucide-react';
import ReceiptModal from '../../components/ReceiptModal';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function EmployeeSales() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [view, setView] = useState('terminal'); // terminal or history
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receiptSale, setReceiptSale] = useState(null);

  const loadProducts = () => api.get('/products').then(r => setProducts(r.data));
  const loadHistory = () => api.get('/sales').then(r => { setSalesHistory(r.data); setLoading(false); });

  useEffect(() => { loadProducts(); loadHistory(); }, []);

  const addToCart = (p) => {
    if (p.stock_qty <= 0) return toast.error('Out of stock');
    const existing = cart.find(item => item.id === p.id);
    if (existing) {
      if (existing.quantity >= p.stock_qty) return toast.error('Maximum stock reached');
      setCart(cart.map(item => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...p, quantity: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    const p = products.find(prod => prod.id === id);
    if (delta > 0 && item.quantity >= p.stock_qty) return toast.error('Max stock');
    const next = cart.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0);
    setCart(next);
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const checkout = async () => {
    if (!cart.length) return;
    const tid = toast.loading('Processing transaction...');
    try {
      const cartSnapshot = [...cart];
      const res = await api.post('/sales', {
        items: cart.map(i => ({ product_id: i.id, quantity: i.quantity, price_at_sale: i.price })),
        payment_method: paymentMethod,
        total,
        customer_name: customerName,
        customer_phone: customerPhone
      });
      toast.success('Sale completed! 🎉', { id: tid });

      setReceiptSale({
        ...res.data,
        items: cartSnapshot.map(i => ({
          product_name: i.name,
          quantity: i.quantity,
          price_at_sale: i.price
        })),
        customer_name: customerName,
        customer_phone: customerPhone,
        payment_method: paymentMethod,
        total,
        created_at: new Date().toISOString()
      });

      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      loadProducts();
      loadHistory();
    } catch (err) {
      toast.error('Checkout failed', { id: tid });
    }
  };

  const printHistorySale = async (saleId) => {
    try {
      const res = await api.get(`/sales/${saleId}`);
      setReceiptSale(res.data);
    } catch {
      toast.error('Could not load receipt');
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) && p.is_active);

  return (
    <div className="page" style={{ padding: '28px' }}>
      <div className="topbar" style={{ background: 'transparent', border: 'none', padding: '0 0 24px 0', position: 'static' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Employee Sales Terminal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Process and track personal sales transactions.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className={`btn ${view === 'terminal' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('terminal')}>
            <ShoppingCart size={16} /> Terminal
          </button>
          <button className={`btn ${view === 'history' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('history')}>
            <History size={16} /> My Sales
          </button>
        </div>
      </div>

      {view === 'terminal' ? (
        <div className="pos-layout">
          <div>
            <div className="toolbar" style={{ marginBottom: 20 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" placeholder="Search available products..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
              </div>
            </div>
            
            <div className="pos-products">
              {filtered.map(p => (
                <div key={p.id} className={`pos-product-card ${p.stock_qty <= 0 ? 'out-of-stock' : ''}`} onClick={() => addToCart(p)}>
                  <div className="pos-product-name">{p.name}</div>
                  <div className="pos-product-price">{fmt(p.price)}</div>
                  <div className="pos-product-stock">{p.stock_qty} in stock</div>
                  {p.stock_qty <= p.low_stock_threshold && <div style={{ color: 'var(--warning)', fontSize: 10, fontWeight: 700 }}>⚠️ LOW</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'fit-content', position: 'sticky', top: 100 }}>
            <div className="card-header"><div className="card-title">Order Summary</div> <Receipt size={18} color="var(--text-muted)" /></div>
            
            <div style={{ flex: 1, minHeight: 200, marginBottom: 20 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>Search and select items to add to cart</div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-name">
                      <div>{item.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt(item.price)} × {item.quantity}</div>
                    </div>
                    <div className="cart-qty">
                      <button className="qty-btn" onClick={() => updateQty(item.id, -1)}><Minus size={12} /></button>
                      <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, 1)}><Plus size={12} /></button>
                    </div>
                    <div style={{ fontWeight: 700, width: 60, textAlign: 'right' }}>{fmt(item.price * item.quantity)}</div>
                  </div>
                ))
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ fontWeight: 600 }}>Total Payable</div>
                <div className="cart-total">{fmt(total)}</div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13, color: 'var(--text-muted)' }}>CUSTOMER DETAILS</div>
                <input className="form-input" style={{ marginBottom: 10 }} placeholder="Customer Name (Optional)" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                <input className="form-input" placeholder="Phone Number (Optional)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-muted)' }}>CUSTOMER PAYMENT</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button className={`btn ${paymentMethod === 'cash' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPaymentMethod('cash')}>
                    <Banknote size={14} /> Cash
                  </button>
                  <button className={`btn ${paymentMethod === 'online' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPaymentMethod('online')}>
                    <CreditCard size={14} /> UPI/Card
                  </button>
                </div>
              </div>

              <button className="btn btn-success" style={{ width: '100%', padding: 14, marginTop: 10 }} disabled={!cart.length} onClick={checkout}>
                Process Order ({fmt(total)})
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', marginTop: 10 }} onClick={() => setCart([])}>
                <Trash2 size={14} /> Clear Cart
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Ref ID</th><th>Date/Time</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Receipt</th></tr>
              </thead>
              <tbody>
                {salesHistory.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-light)' }}>#TXN-{s.id}</td>
                    <td>{new Date(s.created_at).toLocaleString()}</td>
                    <td>{s.customer_name || <span style={{ color: 'var(--text-muted)' }}>Walk-in</span>}</td>
                    <td>{s.item_count || 1} items</td>
                    <td style={{ fontWeight: 800, color: 'var(--success)' }}>{fmt(s.total)}</td>
                    <td><span className="badge badge-success" style={{ textTransform: 'capitalize' }}>{s.payment_method}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => printHistorySale(s.id)} title="Print Receipt">
                        <Printer size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {salesHistory.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No sales recorded yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptSale && (
        <ReceiptModal sale={receiptSale} onClose={() => setReceiptSale(null)} />
      )}
    </div>
  );
}
