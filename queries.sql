CREATE TABLE Employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  admin_password VARCHAR(255)
);

SELECT * FROM Employees;