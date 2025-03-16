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

CREATE TABLE DVD (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) UNIQUE,
  genre VARCHAR(255),
  director VARCHAR(255),
  actors TEXT,
  release_year VARCHAR(10),
  quantity INT DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0.00,
  available BOOLEAN DEFAULT TRUE,
  requested_count INT DEFAULT 0
);

INSERT INTO DVD (title, genre, director, actors, release_year, quantity, price, available, requested_count)  
VALUES  
('Inception', 'Sci-Fi', 'Christopher Nolan', 'Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page', '2010', 5, 14.99, TRUE, 3),  
('The Godfather', 'Crime', 'Francis Ford Coppola', 'Marlon Brando, Al Pacino, James Caan', '1972', 3, 12.99, TRUE, 5),  
('Titanic', 'Romance', 'James Cameron', 'Leonardo DiCaprio, Kate Winslet', '1997', 4, 9.99, TRUE, 2),  
('The Dark Knight', 'Action', 'Christopher Nolan', 'Christian Bale, Heath Ledger, Aaron Eckhart', '2008', 6, 13.99, TRUE, 4),  
('Forrest Gump', 'Drama', 'Robert Zemeckis', 'Tom Hanks, Robin Wright, Gary Sinise', '1994', 2, 10.99, TRUE, 1);  
