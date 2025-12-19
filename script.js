//-----------------------------------------------MOCK DATA
const mockMenuData = [
    [101, 'Hamburger', 410.99, 0.15, 'https://i.ibb.co/Vq2Ny7x/burger-min.jpg'],
    [102, 'Fries', 356.99, 0.15, 'https://i.ibb.co/LZj9Z6C/fries-min.jpg'],
    [103, 'Salad', 359.5, 0.15, 'https://i.ibb.co/yyPbfKy/salad-min.jpg'],
    [104, 'Pizza', 624.75, 0.15, 'https://i.ibb.co/B2xPpKg/pizza-min.jpg'],
    [105, 'Cake', 157.0, 0.15, 'https://i.ibb.co/pfXKGPN/cake-min.jpg'],
    [106, 'Donuts', 55.45, 0.15, 'https://i.ibb.co/8N0N8qs/donuts-min.jpg'],
    [107, 'Crepes', 312.5, 0.15, 'https://i.ibb.co/Fb8CQnj/crepes-min.jpg'],
    [108, 'Cupcake', 233.55, 0.15, 'https://i.ibb.co/s38mNCT/cupcake-min.jpg'],
    [109, 'Sandwich', 148.99, 0.15, 'https://i.ibb.co/GHK7JZT/sandwich-min.jpg'],
    [110, 'Steak', 326.98, 0.15, 'https://i.ibb.co/Dr7qFyk/steak-min.jpg']
];

//-----------------------------------------------UTILITIES
class Utilities {
    static roundToTwo(num) { return +(Math.round(num + "e+2") + "e-2"); }
}

//-----------------------------------------------ORDER CLASS
class Order {
    constructor() {
        this.menu = [];
        this.order = [];
        this.vatRate = 0.15;
    }

    setMenu(items) {
        this.menu = items.map(item => ({
            sku: item[0],
            description: item[1],
            price: item[2],
            taxRate: this.vatRate,
            image: item[4]
        }));
    }

    addOrder(sku) {
        const existing = this.order.find(line => line.sku === sku);
        const menuItem = this.menu.find(item => item.sku === sku);
        if (!menuItem) return;

        if (existing) {
            existing.quantity += 1;
            existing.total = Utilities.roundToTwo(existing.quantity * menuItem.price);
        } else {
            this.order.push({
                sku: menuItem.sku,
                description: menuItem.description,
                price: menuItem.price,
                quantity: 1,
                total: Utilities.roundToTwo(menuItem.price)
            });
        }
        Ui.updateReceipt(this);
    }

    updateQuantity(sku, change) {
        const item = this.order.find(line => line.sku === sku);
        if (!item) return;
        item.quantity += change;
        if (item.quantity <= 0) {
            this.order = this.order.filter(line => line.sku !== sku);
        } else {
            item.total = Utilities.roundToTwo(item.quantity * item.price);
        }
        Ui.updateReceipt(this);
    }

    deleteOrder(sku) {
        this.order = this.order.filter(line => line.sku !== sku);
        Ui.updateReceipt(this);
    }

    clearOrder() {
        this.order = [];
        Ui.updateReceipt(this);
    }

    getSubTotal() { return Utilities.roundToTwo(this.order.reduce((acc, line) => acc + line.total, 0)); }
    getVAT() { return Utilities.roundToTwo(this.getSubTotal() * this.vatRate); }
    getGrandTotal() { return Utilities.roundToTwo(this.getSubTotal() + this.getVAT()); }

    exportOrder() {
        if (this.order.length === 0) return alert("No items to export!");
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
            order: this.order,
            subtotal: this.getSubTotal(),
            vat: this.getVAT(),
            grandTotal: this.getGrandTotal()
        }, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `order_${new Date().toISOString()}.json`);
        dlAnchor.click();
    }

    printReceipt() {
        const printWindow = window.open('', '', 'height=600,width=400');
        printWindow.document.write('<html><head><title>Receipt</title>');
        printWindow.document.write('<style>body{font-family:Arial,sans-serif}table{width:100%;border-collapse:collapse}th,td{padding:5px;text-align:left}th{border-bottom:1px solid #000}td{border-bottom:1px dashed #ccc}tfoot td{border-top:1px solid #000;font-weight:bold}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<h2>The Awesome Cafe</h2>
            <p>2341 Golagul St.</p>
            <p>Addis Abeba, Ethiopia</p>
            <p>Phone: 252-0912-345678</p>
            <p>TIN: 0087654321</p>
            <h3>Invoice: Birr</h3>`);

        printWindow.document.write('<table>');
        printWindow.document.write('<thead><tr><th>ID</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>');
        this.order.forEach(line => {
            printWindow.document.write(`<tr>
                <td>${line.sku}</td>
                <td>${line.description}</td>
                <td>${line.quantity}</td>
                <td>${line.price.toFixed(2)}</td>
                <td>${line.total.toFixed(2)}</td>
            </tr>`);
        });
        printWindow.document.write('</tbody>');
        printWindow.document.write(`<tfoot>
            <tr><td colspan="4">Subtotal</td><td>${this.getSubTotal().toFixed(2)}</td></tr>
            <tr><td colspan="4">VAT (15%)</td><td>${this.getVAT().toFixed(2)}</td></tr>
            <tr><td colspan="4">Grand Total</td><td>${this.getGrandTotal().toFixed(2)} Birr</td></tr>
        </tfoot>`);
        printWindow.document.write('</table>');
        printWindow.document.write('<p style="text-align:center;margin-top:20px;">Thanks Come Again!</p>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
}

//-----------------------------------------------UI CLASS
class Ui {
    static displayMenu(orderInstance) {
        const menuDiv = document.getElementById('menu');
        menuDiv.innerHTML = "";
        orderInstance.menu.forEach(item => {
            const fig = document.createElement("figure");
            fig.className = "menu-item";
            fig.innerHTML = `
                <img src="${item.image}" alt="${item.description}" class="menu-img" style="width:150px;">
                <figcaption>${item.description}</figcaption>
                <figcaption>${item.price.toFixed(2)} Birr</figcaption>
            `;
            menuDiv.appendChild(fig);

            fig.addEventListener('click', () => orderInstance.addOrder(item.sku));
        });
    }

    static updateReceipt(orderInstance) {
        const tbody = document.getElementById("receipt-details");
        tbody.innerHTML = "";

        orderInstance.order.forEach(line => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${line.sku}</td>
                <td>${line.description}</td>
                <td>
                    <button class="qty-btn" data-sku="${line.sku}" data-change="-1">-</button>
                    ${line.quantity}
                    <button class="qty-btn" data-sku="${line.sku}" data-change="1">+</button>
                </td>
                <td>${line.price.toFixed(2)}</td>
                <td>${line.total.toFixed(2)}</td>
                <td><i class="fas fa-backspace" data-sku="${line.sku}"></i></td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const sku = parseInt(btn.getAttribute('data-sku'));
                const change = parseInt(btn.getAttribute('data-change'));
                orderInstance.updateQuantity(sku, change);
            });
        });

        document.querySelectorAll('.fa-backspace').forEach(btn => {
            btn.addEventListener('click', () => {
                const sku = parseInt(btn.getAttribute('data-sku'));
                orderInstance.deleteOrder(sku);
            });
        });

        document.getElementById("subtotal-summary").textContent = orderInstance.getSubTotal().toFixed(2);
        document.getElementById("tax-summary").textContent = orderInstance.getVAT().toFixed(2);
        document.getElementById("grandtotal-summary").textContent = orderInstance.getGrandTotal().toFixed(2) + " Birr";

        document.getElementById('invoice-number').textContent = "Birr";
    }
}

//-----------------------------------------------INITIALIZE
const order = new Order();
order.setMenu(mockMenuData);
Ui.displayMenu(order);

//-----------------------------------------------EVENT LISTENERS
document.getElementById('clear-order').addEventListener('click', () => order.clearOrder());

// Add print and export buttons
const toolbar = document.querySelector('.toolbar');

const printBtn = document.createElement('button');
printBtn.textContent = "Print Receipt";
printBtn.addEventListener('click', () => order.printReceipt());
toolbar.appendChild(printBtn);

const exportBtn = document.createElement('button');
exportBtn.textContent = "Export Order";
exportBtn.addEventListener('click', () => order.exportOrder());
toolbar.appendChild(exportBtn);
