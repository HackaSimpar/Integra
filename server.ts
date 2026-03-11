import express from "express";
import { createServer as createViteServer } from "vite";
import db from "./src/db.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password) as any;
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      res.status(401).json({ success: false, message: "Credenciais inválidas" });
    }
  });

  app.get("/api/users", (req, res) => {
    const users = db.prepare('SELECT id, username, role FROM users').all();
    res.json(users);
  });

  app.post("/api/users", (req, res) => {
    const { username, password, role } = req.body;
    try {
      db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, password, role);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ success: false, message: "Erro ao criar usuário" });
    }
  });

  app.delete("/api/users/:id", (req, res) => {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/employees", (req, res) => {
    const employees = db.prepare('SELECT * FROM employees').all();
    res.json(employees);
  });

  app.post("/api/employees", (req, res) => {
    const { name, company, expected_admission_date, effective_admission_date, orientation_date } = req.body;
    
    // Check capacity
    const dateObj = new Date(orientation_date);
    // getDay() returns 0 for Sunday, 1 for Monday in local time.
    // However, if orientation_date is YYYY-MM-DD, new Date(YYYY-MM-DD) parses as UTC.
    // Let's parse it manually to avoid timezone issues.
    const [year, month, day] = orientation_date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayOfWeek = localDate.getDay();
    
    let capacity = 0;
    if (dayOfWeek === 1) capacity = 140; // Monday
    else if (dayOfWeek >= 2 && dayOfWeek <= 4) capacity = 25; // Tue, Wed, Thu
    else return res.status(400).json({ success: false, message: "Data inválida para integração. Apenas de Segunda a Quinta." });

    const currentCount = (db.prepare('SELECT COUNT(*) as count FROM employees WHERE orientation_date = ?').get(orientation_date) as any).count;
    
    if (currentCount >= capacity) {
      return res.status(400).json({ success: false, message: "Capacidade máxima da sala atingida para esta data." });
    }

    db.prepare('INSERT INTO employees (name, company, expected_admission_date, effective_admission_date, orientation_date) VALUES (?, ?, ?, ?, ?)').run(
      name, company, expected_admission_date, effective_admission_date || null, orientation_date
    );
    res.json({ success: true });
  });

  app.delete("/api/employees/:id", (req, res) => {
    db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/settings", (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all() as any[];
    const settingsObj = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    res.json(settingsObj);
  });

  app.post("/api/settings", (req, res) => {
    const { primaryColor } = req.body;
    db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(primaryColor, 'primaryColor');
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
