CREATE TABLE Customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birthdate DATE,
    credit_card_number VARCHAR(20),
    credit_card_expiry DATE,
    credit_card_cvc VARCHAR(3),
    home_address VARCHAR(255),
    phone_number VARCHAR(15),
    outstanding_rentals INT DEFAULT 0,
    due_dates TEXT
);

INSERT INTO Customer (first_name, last_name, birthdate, credit_card_number, credit_card_expiry, credit_card_cvc, home_address, phone_number, outstanding_rentals, due_dates)
VALUES
('John', 'Doe', '1990-05-15', '1234567890123456', '2025-11-30', '123', '123 Main St, Springfield, IL', '555-1234', 2, '["2025-03-25", "2025-04-01"]');

-- Create the rentals table to track DVD rental transactions
CREATE TABLE rentals (
  rental_id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  dvd_id INT NOT NULL,
  rental_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  status VARCHAR(20) NOT NULL,
  title VARCHAR(255),
  customer_name VARCHAR(255),
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
  FOREIGN KEY (dvd_id) REFERENCES DVD(id)
);