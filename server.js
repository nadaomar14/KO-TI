require("dotenv").config();
const express = require("express");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bcrypt = require("bcryptjs");
const session = require("express-session");
const db = require("./db");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Stripe Checkout: Insert order and line items
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, name, address, phone } = req.body;
    const user = req.session.user;

    if (!user || user.role !== 'customer') return res.status(403).json({ error: "Unauthorized" });

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Insert order
    const [userInfo] = await new Promise((resolve, reject) => {
      db.query("SELECT email FROM users WHERE id = ?", [user.id], (err, results) => {
        if (err || results.length === 0) return reject("User not found");
        resolve(results);
      });
    });

    const orderId = await new Promise((resolve, reject) => {
      db.query(`INSERT INTO orders (user_id, total_amount, name, email, address, phone)
                VALUES (?, ?, ?, ?, ?, ?)`,
        [user.id, totalAmount, name, userInfo.email, address, phone],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.insertId);
        });
    });

    await Promise.all(items.map(item => {
      const subtotal = item.price * item.quantity;
      return new Promise((resolve, reject) => {
        db.query(`INSERT INTO order_items (order_id, product_name, price, quantity, subtotal)
                  VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.title, item.price, item.quantity, subtotal],
          (err) => err ? reject(err) : resolve());
      });
    }));

    const line_items = items.map(item => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.title },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const sessionStripe = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/cancel`
    });

    res.json({ url: sessionStripe.url });

  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// Register
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.query(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
    [name, email, hashed], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.redirect('/register?error=exists');
        return res.redirect('/register?error=server');
      }

      req.session.user = {
        id: result.insertId,
        name,
        role: 'customer',
      };
      res.redirect("/dashboard");
    });
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(`SELECT * FROM users WHERE email = ?`, [email], async (err, results) => {
    if (err || results.length === 0) return res.redirect('/login?error=invalid');

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.redirect('/login?error=invalid');

    req.session.user = {
      id: user.id,
      name: user.name,
      role: user.role
    };

    if (user.role === 'admin') return res.redirect("/admin");
    res.redirect("/dashboard");
  });
});

// Dashboard
app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/unauthorized");
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Admin Dashboard
app.get("/admin", (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect("/unauthorized");
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Admin: Get all orders with items
app.get("/admin/orders-with-items", (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });

  const sql = `
    SELECT 
      o.id AS order_id, o.total_amount, o.status, o.created_at,
      o.name, o.email, o.address, o.phone,
      i.product_name, i.price, i.quantity, i.subtotal
    FROM orders o
    LEFT JOIN order_items i ON o.id = i.order_id
    ORDER BY o.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "DB Error" });

    const ordersMap = {};
    results.forEach(row => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          id: row.order_id,
          total: row.total_amount,
          status: row.status,
          created_at: row.created_at,
          name: row.name,
          email: row.email,
          address: row.address,
          phone: row.phone,
          items: []
        };
      }

      if (row.product_name) {
        ordersMap[row.order_id].items.push({
          name: row.product_name,
          price: row.price,
          quantity: row.quantity,
          subtotal: row.subtotal
        });
      }
    });

    res.json(Object.values(ordersMap));
  });
});

// Admin: Update order status
app.post('/admin/orders/:id/status', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const orderId = req.params.id;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'canceled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  db.query(`UPDATE orders SET status = ? WHERE id = ?`, [status, orderId], (err, result) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true });
  });
});

// Admin: Delete order
app.delete("/admin/orders/:id", (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });

  const { id } = req.params;

  db.query(`DELETE FROM orders WHERE id = ?`, [id], (err) => {
    if (err) return res.status(500).json({ message: "Failed to delete order" });
    res.json({ message: "Order deleted successfully" });
  });
});

// Shared APIs
app.get("/api/user", (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });

  db.query(`SELECT id, name, email, role, address, phone FROM users WHERE id = ?`,
    [req.session.user.id], (err, results) => {
      if (err || results.length === 0) return res.status(404).json({ message: "User not found" });
      res.json(results[0]);
    });
});

// Update user profile (partial update, safe and field-independent)
app.post("/api/update-profile", (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });

  const { name, address, phone } = req.body;

  db.query(`SELECT name, address, phone FROM users WHERE id = ?`, [req.session.user.id], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ message: "User not found" });

    const current = results[0];

    const updatedName = (name !== undefined && name !== null && name.trim() !== "") ? name : current.name;
    const updatedAddress = (address !== undefined && address !== null && address.trim() !== "") ? address : current.address;
    const updatedPhone = (phone !== undefined && phone !== null && phone.trim() !== "") ? phone : current.phone;

    db.query(
      `UPDATE users SET name = ?, address = ?, phone = ? WHERE id = ?`,
      [updatedName, updatedAddress, updatedPhone, req.session.user.id],
      (err) => {
        if (err) return res.status(500).json({ message: "Update failed" });
        req.session.user.name = updatedName;
        res.json({ message: "Info updated successfully" });
      }
    );
  });
});


app.get("/api/my-orders-with-items", (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });

  const sql = `
    SELECT 
      o.id AS order_id, o.total_amount, o.status, o.created_at,
      o.name, o.email, o.address, o.phone,
      i.product_name, i.price, i.quantity, i.subtotal
    FROM orders o
    LEFT JOIN order_items i ON o.id = i.order_id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `;

  db.query(sql, [req.session.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "DB Error" });

    const ordersMap = {};

    results.forEach(row => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          id: row.order_id,
          total: row.total_amount,
          status: row.status,
          created_at: row.created_at,
          name: row.name,
          email: row.email,
          address: row.address,
          phone: row.phone,
          items: []
        };
      }

      ordersMap[row.order_id].items.push({
        name: row.product_name,
        price: row.price,
        quantity: row.quantity,
        subtotal: row.subtotal
      });
    });

    res.json(Object.values(ordersMap));
  });
});

// Password change
app.post('/api/change-password', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' });

  db.query(`SELECT password FROM users WHERE id = ?`, [req.session.user.id], async (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, results[0].password);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    db.query(`UPDATE users SET password = ? WHERE id = ?`, [hashed, req.session.user.id], (err) => {
      if (err) return res.status(500).json({ message: 'Failed to update password' });
      res.json({ message: 'Password updated successfully' });
    });
  });
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// Fallback pages
app.get("/unauthorized", (req, res) => res.sendFile(path.join(__dirname, "public", "unauthorized.html")));
app.get("/success", (req, res) => res.sendFile(path.join(__dirname, "public", "success.html")));
app.get("/cancel", (req, res) => res.sendFile(path.join(__dirname, "public", "cancel.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "public", "register.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
// 404 fallback (must be last route)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
