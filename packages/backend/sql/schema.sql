CREATE TABLE IF NOT EXISTS patients (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  status ENUM('Inquiry', 'Onboarding', 'Active', 'Churned') NOT NULL,
  address_line1 VARCHAR(200) NOT NULL,
  address_line2 VARCHAR(200) NULL,
  city VARCHAR(100) NOT NULL,
  state CHAR(2) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  country CHAR(2) NOT NULL CHECK (country = 'US'),
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci;
