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
  database: 'videoshoppe',
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
      { id: employee.id, username: employee.username, isAdmin: employee.isAdmin },
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
    await db.query('INSERT INTO employee (username, password) VALUES (?, ?)', [username, hashedPassword]);

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
      'SELECT id, name, address, phone_number, full_time, hours_worked, isAdmin FROM Employee'
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
      'INSERT INTO employee (name, address, phone_number, full_time, hours_worked) VALUES (?, ?, ?, ?, ?)',
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
  try {
    const [dvds] = await db.query('SELECT * FROM DVD');
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
      'INSERT INTO dvd (title, genre, director, actors, release_year, quantity, price, available, requested_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
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

// **Customer Search Route**
app.get('/api/customers/search', async (req, res) => {
  const { name } = req.query;
  
  if (!name) {
    return res.status(400).json({ message: 'Name query parameter is required' });
  }

  const query = `SELECT * FROM Customer WHERE LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ?`;
  try {
    const [result] = await db.execute(query, [`%${name.toLowerCase()}%`, `%${name.toLowerCase()}%`]);
    
    if (result.length > 0) {
      const customer = result[0];
      
      // Clean up birthdate if it exists
      if (customer.birthdate) {
        customer.birthdate = customer.birthdate instanceof Date 
          ? customer.birthdate.toISOString().split('T')[0]  
          : new Date(customer.birthdate).toISOString().split('T')[0];
      }

      // Ensure `due_dates` is a clean array without quotes or brackets
      if (customer.due_dates) {
        try {
          // If it's already a JSON string, parse it
          if (typeof customer.due_dates === 'string') {
            customer.due_dates = JSON.parse(customer.due_dates);
          }
        } catch (e) {
          // If parsing fails, provide an empty array
          customer.due_dates = [];
        }
      } else {
        customer.due_dates = [];
      }
      
      res.json({ customer });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (err) {
    console.error('Error retrieving customer:', err);
    res.status(500).json({ message: 'Error retrieving customer' });
  }
});

// **Customer Create Route**
app.post('/api/customers/create', authenticateToken, async (req, res) => {
  const { 
    first_name, 
    last_name, 
    birthdate, 
    credit_card_number, 
    credit_card_expiry, 
    credit_card_cvc, 
    home_address, 
    phone_number 
  } = req.body;

  // Validate required fields
  if (!first_name || !last_name) {
    return res.status(400).json({ 
      success: false, 
      message: 'First name and last name are required' 
    });
  }

  try {
    // If birthdate is provided, ensure it's in YYYY-MM-DD format
    const formattedBirthdate = birthdate 
      ? new Date(birthdate).toISOString().split('T')[0] 
      : null;

    const query = `
      INSERT INTO customer (
        first_name, 
        last_name, 
        birthdate, 
        credit_card_number, 
        credit_card_expiry, 
        credit_card_cvc, 
        home_address, 
        phone_number,
        outstanding_rentals,
        due_dates
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      first_name,
      last_name,
      formattedBirthdate,  // Use formatted date
      credit_card_number || null,
      credit_card_expiry || null,
      credit_card_cvc || null,
      home_address || null,
      phone_number || null,
      0,
      null
    ]);

    // Retrieve the newly created customer
    const [newCustomer] = await db.query(
      'SELECT * FROM Customer WHERE customer_id = ?', 
      [result.insertId]
    );

    // Clean up birthdate in the response
    if (newCustomer[0].birthdate) {
      newCustomer[0].birthdate = new Date(newCustomer[0].birthdate).toISOString().split('T')[0];
    }

    // Clean up due_dates completely
    if (newCustomer[0].due_dates) {
      try {
        // If it's already a JSON string, parse it
        if (typeof newCustomer[0].due_dates === 'string') {
          newCustomer[0].due_dates = JSON.parse(newCustomer[0].due_dates);
        }
      } catch (e) {
        // If parsing fails, provide an empty array
        newCustomer[0].due_dates = [];
      }
    } else {
      newCustomer[0].due_dates = [];
    }

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer: newCustomer[0]
    });
  } catch (err) {
    console.error('Error creating customer:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: 'A customer with similar details already exists' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Server error creating customer',
      error: err.message 
    });
  }
});

// Get all alerts (secured route)
app.get('/api/alert', authenticateToken, async (req, res) => {
  try {
    const [alerts] = await db.query('SELECT * FROM Alert ORDER BY created_at DESC');

    res.status(200).json({ 
      success: true, 
      alerts 
    });
  } catch (err) {
    console.error('Error fetching alerts:', {
      message: err.message,
      stack: err.stack
    });

    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching alerts' 
    });
  }
});

// Create a new alert (secured route)
app.post('/api/alert', authenticateToken, async (req, res) => {
  const { message, alert_type } = req.body;


  const validAlertTypes = ['DVD Available', 'Credit Card Invalid', 'Overdue Late Fees', 'Other'];

  if (!message || !alert_type || !validAlertTypes.includes(alert_type)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid alert data: message and a valid alert_type are required' 
    });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO alert (message, alert_type) VALUES (?, ?)', 
      [message, alert_type]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Alert created successfully',
      alertId: result.insertId 
    });
  } catch (err) {
    console.error('Error creating alert:', {
      message: err.message,
      stack: err.stack,
      data: req.body
    });

    res.status(500).json({ 
      success: false, 
      message: 'Server error creating alert' 
    });
  }
});

// Delete an alert by ID (secured route)
app.delete('/api/alert/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid alert ID' 
    });
  }

  try {
    const [result] = await db.query('DELETE FROM Alert WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Alert not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Alert deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting alert:', {
      message: err.message,
      stack: err.stack
    });

    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting alert' 
    });
  }
});

// 1. Get customer by ID
app.get('/api/customers/:customerId', authenticateToken, async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const [rows] = await db.query('SELECT * FROM Customer WHERE customer_id = ?', [customerId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const customer = rows[0];
    
    // Clean up birthdate if it exists
    if (customer.birthdate) {
      customer.birthdate = customer.birthdate instanceof Date 
        ? customer.birthdate.toISOString().split('T')[0]  
        : new Date(customer.birthdate).toISOString().split('T')[0];
    }

    // Ensure `due_dates` is properly formatted
    if (customer.due_dates) {
      try {
        // If it's already a JSON string, parse it
        if (typeof customer.due_dates === 'string') {
          customer.due_dates = JSON.parse(customer.due_dates);
        }
      } catch (e) {
        // If parsing fails, provide an empty array
        customer.due_dates = [];
      }
    } else {
      customer.due_dates = [];
    }
    
    res.json({ customer });
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ message: 'Error fetching customer' });
  }
});

// 2. Update customer - FIXED VERSION
app.put('/api/customers/:customerId', authenticateToken, async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const updates = req.body;
    
    console.log('Customer update request:', {
      customerId,
      updates
    });
    
    // Ensure due_dates is properly JSON stringified if it's an array
    if (updates.due_dates && Array.isArray(updates.due_dates)) {
      updates.due_dates = JSON.stringify(updates.due_dates);
    }
    
    // Update only outstanding_rentals and due_dates
    const query = `UPDATE Customer SET outstanding_rentals = ?, due_dates = ? WHERE customer_id = ?`;
    await db.query(query, [
      updates.outstanding_rentals || 0,
      updates.due_dates,
      customerId
    ]);
    
    // Return success without trying to fetch the updated customer
    res.json({ 
      success: true, 
      message: 'Customer updated successfully' 
    });
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating customer: ' + err.message 
    });
  }
});

// 3. Create rentals table if needed
// The SQL for this would be:
/*
CREATE TABLE IF NOT EXISTS rentals (
  rental_id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  dvd_id INT NOT NULL,
  rental_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  status VARCHAR(20) NOT NULL,
  title VARCHAR(255),
  customer_name VARCHAR(255),
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
  FOREIGN KEY (dvd_id) REFERENCES DVD(id)
);
*/

// 4. Rental creation route
app.post('/api/rentals', authenticateToken, async (req, res) => {
  try {
    const rentalData = req.body;
    
    console.log('Creating rental:', rentalData);
    
    // Validate input
    if (!rentalData.customer_id || !rentalData.dvd_id || !rentalData.due_date) {
      return res.status(400).json({ message: 'Missing required rental information' });
    }
    
    // Insert new rental record
    const query = 'INSERT INTO rentals SET ?';
    const [result] = await db.query(query, [rentalData]);
    
    res.status(201).json({ 
      success: true,
      message: 'Rental created successfully',
      rental_id: result.insertId
    });
  } catch (err) {
    console.error('Error creating rental:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error creating rental: ' + err.message 
    });
  }
});

// 5. Get all rentals
app.get('/api/rentals', authenticateToken, async (req, res) => {
  try {
    // Get all rentals
    const query = "SELECT * FROM rentals ORDER BY rental_date DESC";
    const [rows] = await db.query(query);
    
    res.json({ rentals: rows });
  } catch (err) {
    console.error('Error fetching rentals:', err);
    res.status(500).json({ message: 'Error fetching rentals: ' + err.message });
  }
});

// 6. Get outstanding rentals
app.get('/api/rentals/outstanding', authenticateToken, async (req, res) => {
  try {
    // Get all rentals with status 'out' or 'overdue'
    const query = "SELECT * FROM rentals WHERE status IN ('out', 'overdue') ORDER BY due_date ASC";
    const [rows] = await db.query(query);
    
    res.json({ rentals: rows });
  } catch (err) {
    console.error('Error fetching outstanding rentals:', err);
    res.status(500).json({ message: 'Error fetching outstanding rentals: ' + err.message });
  }
});

// 7. Update rental status (for returns)
app.put('/api/rentals/:rentalId/return', authenticateToken, async (req, res) => {
  try {
    const rentalId = req.params.rentalId;
    const today = new Date().toISOString().split('T')[0];
    
    console.log('Processing return for rental:', rentalId);
    
    // Update the rental record
    const updateQuery = 'UPDATE rentals SET status = ?, return_date = ? WHERE rental_id = ?';
    await db.query(updateQuery, ['returned', today, rentalId]);
    
    // Get the rental to update the customer's outstanding_rentals
    const [rentalRows] = await db.query('SELECT * FROM rentals WHERE rental_id = ?', [rentalId]);
    if (rentalRows.length === 0) {
      return res.status(404).json({ message: 'Rental not found' });
    }
    
    const rental = rentalRows[0];
    
    // Get the customer
    const [customerRows] = await db.query('SELECT * FROM Customer WHERE customer_id = ?', [rental.customer_id]);
    if (customerRows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const customer = customerRows[0];
    
    // Update customer's outstanding_rentals count
    let outstandingRentals = customer.outstanding_rentals - 1;
    if (outstandingRentals < 0) outstandingRentals = 0;
    
    // Update customer's due_dates array
    let dueDatesArray = [];
    if (customer.due_dates) {
      try {
        // Handle JSON string case
        if (typeof customer.due_dates === 'string') {
          dueDatesArray = JSON.parse(customer.due_dates);
        } else if (Array.isArray(customer.due_dates)) {
          // Already an array, clone it
          dueDatesArray = [...customer.due_dates];
        }
        
        // Remove the returned rental's due date
        dueDatesArray = dueDatesArray.filter(date => date !== rental.due_date);
      } catch (e) {
        // If due_dates is not valid JSON, reset it
        dueDatesArray = [];
      }
    }
    
    // Update the customer
    await db.query(
      'UPDATE Customer SET outstanding_rentals = ?, due_dates = ? WHERE customer_id = ?',
      [outstandingRentals, JSON.stringify(dueDatesArray), rental.customer_id]
    );
    
    res.json({ 
      success: true,
      message: 'Rental returned successfully',
      rental_id: rentalId
    });
  } catch (err) {
    console.error('Error processing return:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error processing return: ' + err.message 
    });
  }
});

// Start the server
const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});