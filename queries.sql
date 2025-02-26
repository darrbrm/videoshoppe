CREATE TABLE Employee (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  admin_password VARCHAR(255),
  name VARCHAR(255),
  address TEXT,
  phone_number VARCHAR(255),
  full_time BOOLEAN,
  hours_worked FLOAT
);

INSERT INTO Employee (username, password, admin_password, name, address, phone_number, full_time, hours_worked)
VALUES 
('john_smith', 'john1234', 'admin5678', 'John Smith', '123 Elm Street, Springfield', '555-1234', TRUE, 40);
