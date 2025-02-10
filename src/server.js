require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// DB setup
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password', // Change this to your actual MySQL password
  database: 'video_shoppe',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

console.log('Database connection initialized');

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Root route
app.get('/', (req, res) => {
  res.send('Hello, this is the backend API!');
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, password, adminPassword } = req.body;

  if (!username || !password || !adminPassword) {
    return res.status(400).json({ success: false, message: 'Please fill in all fields' });
  }

  try {
    const [existingUser] = await db.query('SELECT * FROM Employees WHERE username = ?', [username]);

    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    await db.query(
      'INSERT INTO Employees (username, password, admin_password) VALUES (?, ?, ?)',
      [username, hashedPassword, hashedAdminPassword]
    );

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please fill in all fields' });
  }

  try {
    const [users] = await db.query('SELECT * FROM Employees WHERE username = ?', [username]);

    if (users.length === 0) {
      console.error('Login failed: User not found');
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    const employee = users[0];

    const isPasswordCorrect = await bcrypt.compare(password, employee.password);

    if (!isPasswordCorrect) {
      console.error('Login failed: Incorrect password');
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: employee.id, username: employee.username }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Start the server
const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
