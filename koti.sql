-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 09, 2025 at 09:21 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `koti`
--

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `phone` varchar(50) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `name`, `email`, `address`, `phone`, `status`, `created_at`) VALUES
(2, 2, 247.42, 'John Deo', 'user@koti.com', 'Turkey, Ankara, Mamak, No:40/205', '+905552228787', 'shipped', '2025-05-09 19:54:05'),
(3, 7, 112.98, 'Robert K. Pike', 'RobertKPike@armyspy.com', '3070 Pearl Street Folsom, CA 95630', '916-294-9677', 'pending', '2025-05-09 20:33:28'),
(4, 7, 90.99, 'Robert K. Pike', 'RobertKPike@armyspy.com', '3070 Pearl Street Folsom, CA 95630', '916-294-9677', 'pending', '2025-05-09 20:34:20'),
(5, 8, 33.49, 'Jeanette K. Hill', 'JeanetteKHill@armyspy.com', '3690 Henry Ford Avenue Tulsa, OK 74145', '918-278-1913', 'pending', '2025-05-09 20:40:03'),
(6, 9, 84.96, 'Michael B. Chin', 'MichaelBChin@rhyta.com', 'Schönhauser Allee 54 79241 Ihringen', '07668 16 15 37', 'pending', '2025-05-09 20:43:55'),
(7, 9, 168.99, 'Michael B. Chin', 'MichaelBChin@rhyta.com', 'Schönhauser Allee 54 79241 Ihringen', '07668 16 15 37', 'pending', '2025-05-09 20:48:52');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_name`, `price`, `quantity`, `subtotal`) VALUES
(2, 2, 'Adjustable Cat Collar', 7.99, 7, 55.93),
(3, 2, 'Elevated Cat Food Bowl', 15.00, 1, 15.00),
(4, 2, 'Cat Climbing Tree', 65.99, 1, 65.99),
(5, 2, 'Natural Cat Litter', 10.50, 1, 10.50),
(6, 2, 'Comfy Cat Bed', 25.00, 4, 100.00),
(7, 3, 'Cat Toy Ball', 3.50, 6, 21.00),
(8, 3, 'Interactive Toy Mouse', 4.99, 1, 4.99),
(9, 3, 'Natural Cat Litter', 10.50, 2, 21.00),
(10, 3, 'Cat Climbing Tree', 65.99, 1, 65.99),
(11, 4, 'Comfy Cat Bed', 25.00, 1, 25.00),
(12, 4, 'Cat Climbing Tree', 65.99, 1, 65.99),
(13, 5, 'Adjustable Cat Collar', 7.99, 1, 7.99),
(14, 5, 'Cat Toy Ball', 3.50, 3, 10.50),
(15, 5, 'Elevated Cat Food Bowl', 15.00, 1, 15.00),
(16, 6, 'Premium Cat Food', 12.99, 4, 51.96),
(17, 6, 'Natural Cat Litter', 10.50, 1, 10.50),
(18, 6, 'Cat Water Fountain', 22.50, 1, 22.50),
(19, 7, 'Comfy Cat Bed', 25.00, 1, 25.00),
(20, 7, 'Cat Climbing Tree', 65.99, 1, 65.99),
(21, 7, 'Natural Cat Litter', 10.50, 1, 10.50),
(22, 7, 'Cat Water Fountain', 22.50, 3, 67.50);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('customer','admin') DEFAULT 'customer',
  `address` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `address`, `phone`) VALUES
(1, 'Admin', 'admin@koti.com', '$2b$10$okhCiPZiPjcc/pqdP5ucguD0lIFJhZ0y4xoAKx0Yzf6PndHCaUQtq', 'admin', NULL, NULL),
(2, 'John Deo', 'user@koti.com', '$2b$10$2hH.zD4KchtMODLk/6A6/.kiu6eAOJei8krU365uPxgSguJQyTaQ2', 'customer', 'Turkey, Ankara, Mamak, No:40/205', '+905552228787'),
(7, 'Robert K. Pike', 'RobertKPike@armyspy.com', '$2b$10$QkiS5bmJ15F4NPnyA5F.QuGMgbEJOCa4aA9bLOe3BY2RGy.1hKa.C', 'customer', '3070 Pearl Street Folsom, CA 95630', '916-294-9677'),
(8, 'Jeanette K. Hill', 'JeanetteKHill@armyspy.com', '$2b$10$q26myWWVV3ux/261qh.iP.5dzWX9SzDa/JskXBEe1Uwi9OmMxjkwm', 'customer', '3690 Henry Ford Avenue Tulsa, OK 74145', '918-278-1913'),
(9, 'Michael B. Chin', 'MichaelBChin@rhyta.com', '$2b$10$d77byW03qX53qR5weO7VsOeDwfbllda36FFykWo3278kBg57pPv16', 'customer', 'Schönhauser Allee 54 79241 Ihringen', '07668 16 15 37');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
