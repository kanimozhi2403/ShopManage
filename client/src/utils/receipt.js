const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export const printReceipt = (sale) => {
  // sale object expects: { id, created_at, items: [], total, discount, payment_method, customer_name, customer_phone, employee_name }
  
  const content = `
    <div class="receipt">
      <div class="center">
        <!-- Re-using our lovely SVG logo by putting it directly in or using an img tag -->
        <img src="/favicon.svg" class="logo" alt="Logo" />
        <h2>ShopManage</h2>
        <p>123 Business Avenue, Tech Park<br/>City, State 12345</p>
        <p>Phone: +91 98765 43210</p>
        <hr class="dashed" />
        <h3 style="margin: 8px 0;">CASH RECEIPT</h3>
        <p>Receipt #: ${sale.id || 'NEW'}</p>
        <p>Date: ${new Date(sale.created_at || Date.now()).toLocaleString()}</p>
        <p>Cashier: ${sale.employee_name || 'Staff'}</p>
      </div>
      
      ${sale.customer_name ? `
        <hr class="dashed" />
        <p><strong>Customer:</strong> ${sale.customer_name}</p>
        ${sale.customer_phone ? `<p><strong>Phone:</strong> ${sale.customer_phone}</p>` : ''}
      ` : ''}

      <hr class="dashed" />
      
      <table>
        <thead>
          <tr>
            <th style="width: 50%;">Item</th>
            <th style="width: 20%; text-align: center;">Qty</th>
            <th style="width: 30%; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${sale.items.map(item => `
            <tr>
              <td>${item.product_name || item.name}</td>
              <td class="center">${item.quantity}</td>
              <td style="text-align: right;">${fmt(item.price_at_sale * item.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <hr class="dashed" />

      <div class="totals">
        ${parseFloat(sale.discount) > 0 ? `
          <div class="flex-bw"><span>Subtotal:</span> <span>${fmt(parseFloat(sale.total) + parseFloat(sale.discount))}</span></div>
          <div class="flex-bw"><span>Discount:</span> <span>-${fmt(sale.discount)}</span></div>
        ` : ''}
        <div class="flex-bw bold" style="font-size: 16px; margin-top: 4px;">
          <span>TOTAL:</span>
          <span>${fmt(sale.total)}</span>
        </div>
        <div class="flex-bw" style="margin-top: 4px;">
          <span>Payment:</span>
          <span style="text-transform: uppercase;">${sale.payment_method}</span>
        </div>
      </div>

      <hr class="dashed" />
      
      <div class="center footer">
        <p>Thank you for your business!</p>
        <p>Please visit us again.</p>
        <svg class="barcode" id="barcode"></svg>
      </div>
    </div>
  `;

  const printWindow = window.open('', '_blank', 'height=600,width=400');
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt ${sale.id || ''}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
          
          body { 
            font-family: 'Space Mono', monospace; 
            width: 300px; /* Standard 80mm thermal paper width */
            margin: 0 auto; 
            color: #000; 
            padding: 10px;
            background: white;
            font-size: 12px;
            line-height: 1.4;
          }
          * { box-sizing: border-box; }
          h2 { margin: 5px 0; font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          h3 { font-size: 14px; text-decoration: underline; }
          p { margin: 3px 0; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .logo { display: block; margin: 0 auto 8px; width: 44px; height: 44px; filter: grayscale(100%) contrast(200%); }
          .dashed { border: none; border-top: 1px dashed #000; margin: 10px 0; }
          
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th { border-bottom: 1px dashed #000; padding: 4px 0; font-size: 11px; }
          td { padding: 6px 0; vertical-align: top; }
          
          .totals { padding-right: 2px; }
          .flex-bw { display: flex; justify-content: space-between; }
          .footer { margin-top: 20px; font-size: 11px; }
          
          /* Hide scrollbars and margins during print */
          @page { margin: 0; }
          @media print {
            body { margin: 0; padding: 10px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        ${content}
        <script>
          // Automatic print dialog when images load
          window.onload = () => {
             setTimeout(() => {
               window.print();
               window.close();
             }, 300);
          };
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
};
