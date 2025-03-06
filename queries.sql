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

CREATE TABLE DVD {
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) UNIQUE,
  genre VARCHAR(255),
  director VARCHAR(255),
  actors TEXT,
  release_year VARCHAR(255),
  amount INT
};