require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Middleware to enable CORS and parse JSON requests
app.use(cors());
app.use(express.json());

// Database connection setup
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD || 'password', // Ensure the DB password is in your .env file
  database: 'video_shoppe',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

console.log('Database connection initialized');

// Use environment variables for security
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'defaultAdminPass';

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from 'Authorization' header

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user; // Attach user info to the request object
    next();
  });
};

// Root route
app.get('/', (req, res) => {
  res.send('Hello, this is the backend API!');
});

// **Login endpoint**
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please fill in all fields' });
  }

  try {
    const [users] = await db.query('SELECT * FROM Employee WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    const employee = users[0];
    const isPasswordCorrect = await bcrypt.compare(password, employee.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    // Create a JWT token
    const token = jwt.sign(
      { id: employee.id, username: employee.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ success: true, message: 'Login successful', token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// **Register endpoint** (for employee registration)
app.post('/api/register', async (req, res) => {
  const { username, password, adminPassword } = req.body;

  // Check if admin password matches the default admin password
  if (adminPassword !== DEFAULT_ADMIN_PASSWORD) {
    return res.status(400).json({ success: false, message: 'Invalid admin password' });
  }

  if (!username || !password || !adminPassword) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  try {
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new employee into the database
    await db.query('INSERT INTO Employee (username, password) VALUES (?, ?)', [username, hashedPassword]);

    res.status(201).json({ success: true, message: 'Employee registered successfully' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// **Get all employees** (secured route)
app.get('/api/employees', authenticateToken, async (req, res) => {
  try {
    const [employees] = await db.query(
      'SELECT id, name, address, phone_number, full_time, hours_worked FROM Employee'
    );
    res.status(200).json({ success: true, employees });
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ success: false, message: 'Server error fetching employees' });
  }
});

// **Add a new employee** (secured route)
app.post('/api/employees', authenticateToken, async (req, res) => {
  const { name, address, phone_number, full_time, hours_worked } = req.body;

  if (!name || !address || !phone_number || full_time === undefined || hours_worked === undefined) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  try {
    await db.query(
      'INSERT INTO Employee (name, address, phone_number, full_time, hours_worked) VALUES (?, ?, ?, ?, ?)',
      [name, address, phone_number, full_time, hours_worked]
    );

    res.status(201).json({ success: true, message: 'Employee added successfully' });
  } catch (err) {
    console.error('Error adding employee:', err);
    res.status(500).json({ success: false, message: 'Server error adding employee' });
  }
});

// **Update an employee** (secured route)
app.put('/api/employees/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, address, phone_number, full_time, hours_worked } = req.body;

  try {
    await db.query(
      'UPDATE Employee SET name = ?, address = ?, phone_number = ?, full_time = ?, hours_worked = ? WHERE id = ?',
      [name, address, phone_number, full_time, hours_worked, id]
    );

    res.status(200).json({ success: true, message: 'Employee updated successfully' });
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ success: false, message: 'Server error updating employee' });
  }
});

// **Delete an employee** (secured route)
app.delete('/api/employees/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM Employee WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ success: false, message: 'Server error deleting employee' });
  }
});

// **Get all DVDs** (secured route)
app.get('/api/dvds', authenticateToken, async (req, res) => {
  console.log('Received request to /api/dvds'); // Log request
  try {
    const [dvds] = await db.query('SELECT * FROM DVD');
    console.log('Fetched DVDs:', dvds); // Log result
    res.status(200).json({ success: true, dvds });
  } catch (err) {
    console.error('Error fetching DVDs:', err);
    res.status(500).json({ success: false, message: 'Server error fetching DVDs' });
  }
});

// **Add a new DVD** (secured route)
app.post('/api/dvds', authenticateToken, async (req, res) => {
  const { title, genre, director, actors, release_year, quantity, price, available, requested_count } = req.body;

  if (!title || !genre || !director) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO DVD (title, genre, director, actors, release_year, quantity, price, available, requested_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, genre, director, actors, release_year, quantity, price, available ? 1 : 0, requested_count]
    );

    res.status(201).json({ 
      success: true, 
      message: 'DVD added successfully',
      dvd: {
        id: result.insertId,
        title,
        genre,
        director,
        actors,
        release_year,
        quantity,
        price,
        available,
        requested_count
      }
    });
  } catch (err) {
    console.error('Error adding DVD:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'A DVD with this title already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error adding DVD' });
  }
});

// **Update a DVD** (secured route)
app.put('/api/dvds/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, genre, director, actors, release_year, quantity, price, available, requested_count } = req.body;

  try {
    await db.query(
      'UPDATE DVD SET title = ?, genre = ?, director = ?, actors = ?, release_year = ?, quantity = ?, price = ?, available = ?, requested_count = ? WHERE id = ?',
      [title, genre, director, actors, release_year, quantity, price, available ? 1 : 0, requested_count, id]
    );

    res.status(200).json({ success: true, message: 'DVD updated successfully' });
  } catch (err) {
    console.error('Error updating DVD:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'A DVD with this title already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error updating DVD' });
  }
});

// **Delete a DVD** (secured route)
app.delete('/api/dvds/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM DVD WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'DVD deleted successfully' });
  } catch (err) {
    console.error('Error deleting DVD:', err);
    res.status(500).json({ success: false, message: 'Server error deleting DVD' });
  }
});

// Start the server
const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
