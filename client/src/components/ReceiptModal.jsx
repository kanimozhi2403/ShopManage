import { useRef } from 'react';
import { Printer, X } from 'lucide-react';

const fmt = (n) => `Rs.${Number(n || 0).toLocaleString('en-IN')}`;

export default function ReceiptModal({ sale, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=400,height=700');
    win.document.write(`
      <html>
        <head>
          <title>Receipt - TXN-${sale.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              color: #000;
              background: #fff;
              width: 300px;
              padding: 10px;
            }
            .receipt-header { text-align: center; margin-bottom: 10px; }
            .receipt-logo { font-size: 22px; font-weight: 900; letter-spacing: -1px; }
            .receipt-logo span { color: #7c3aed; }
            .receipt-sub { font-size: 10px; color: #444; margin-top: 2px; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .divider-solid { border-top: 1px solid #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 3px 0; }
            .label { color: #555; }
            .items-table { width: 100%; border-collapse: collapse; margin: 4px 0; }
            .items-table td { padding: 2px 0; font-size: 11px; vertical-align: top; }
            .items-table .name { width: 55%; }
            .items-table .qty { width: 15%; text-align: center; }
            .items-table .price { width: 30%; text-align: right; }
            .total-row { font-size: 14px; font-weight: 900; }
            .footer { text-align: center; margin-top: 10px; font-size: 10px; color: #555; }
            .shop-info { text-align: center; font-size: 10px; color: #444; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  if (!sale) return null;

  const now = new Date(sale.created_at || Date.now());
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Printer size={18} color="var(--accent-light)" />
            <h3 className="modal-title">Receipt Preview</h3>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Receipt Content (visible and printable) */}
        <div ref={printRef} style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 12,
          color: '#000',
          background: '#fff',
          padding: '16px 20px',
          borderRadius: 8,
          margin: '0 0 16px 0',
          border: '1px solid #e2e8f0'
        }}>
          {/* Header */}
          <div className="receipt-header">
            <div className="receipt-logo"><span>Shop</span>Manage</div>
            <div className="receipt-sub">SM ShopManage — Business Management System</div>
            <div className="receipt-sub" style={{ marginTop: 4 }}>📍 12, MG Road, Basavangudi, Bengaluru - 560004</div>
            <div className="receipt-sub">📞 +91 98765 43210 | 📧 shop@shopmanage.in</div>
          </div>

          <div className="divider-solid" />

          {/* Transaction Info */}
          <div className="row"><span className="label">Receipt No.</span><span style={{ fontWeight: 700 }}>TXN-{sale.id}</span></div>
          <div className="row"><span className="label">Date</span><span>{dateStr}</span></div>
          <div className="row"><span className="label">Time</span><span>{timeStr}</span></div>
          {sale.employee_name && <div className="row"><span className="label">Served By</span><span>{sale.employee_name}</span></div>}
          {sale.customer_name && <div className="row"><span className="label">Customer</span><span>{sale.customer_name}</span></div>}
          {sale.customer_phone && <div className="row"><span className="label">Phone</span><span>{sale.customer_phone}</span></div>}

          <div className="divider" />

          {/* Items */}
          <table className="items-table">
            <thead>
              <tr>
                <td className="name" style={{ fontWeight: 700, borderBottom: '1px solid #000', paddingBottom: 4 }}>Item</td>
                <td className="qty" style={{ fontWeight: 700, borderBottom: '1px solid #000', paddingBottom: 4, textAlign: 'center' }}>Qty</td>
                <td className="price" style={{ fontWeight: 700, borderBottom: '1px solid #000', paddingBottom: 4, textAlign: 'right' }}>Amount</td>
              </tr>
            </thead>
            <tbody>
              {(sale.items || []).map((item, i) => (
                <tr key={i}>
                  <td className="name" style={{ paddingTop: 4 }}>
                    {item.product_name || item.name}
                    <div style={{ fontSize: 10, color: '#666' }}>@ Rs.{Number(item.price_at_sale || item.price || 0).toLocaleString('en-IN')}</div>
                  </td>
                  <td className="qty" style={{ paddingTop: 4, textAlign: 'center' }}>{item.quantity}</td>
                  <td className="price" style={{ paddingTop: 4, textAlign: 'right', fontWeight: 600 }}>
                    Rs.{Number((item.price_at_sale || item.price || 0) * item.quantity).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divider" />

          {/* Totals */}
          <div className="row"><span className="label">Subtotal</span><span>{fmt(sale.total)}</span></div>
          {sale.discount > 0 && <div className="row"><span className="label">Discount</span><span>- {fmt(sale.discount)}</span></div>}
          <div className="divider-solid" />
          <div className="row total-row">
            <span>TOTAL PAID</span>
            <span>{fmt(sale.total)}</span>
          </div>
          <div className="row" style={{ marginTop: 4 }}>
            <span className="label">Payment Mode</span>
            <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{sale.payment_method || 'CASH'}</span>
          </div>

          <div className="divider" />

          {/* Footer */}
          <div className="footer">
            <div style={{ fontWeight: 700, fontSize: 13 }}>★ Thank You! ★</div>
            <div style={{ marginTop: 4 }}>Visit us again | Powered by ShopManage</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Close</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handlePrint}>
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
