-- --------------------------------------------------------
-- Base de données : restaurant_db
-- Projet : Restaurant Manager
-- Stack : Laravel + React + MySQL + WebSockets
-- --------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `restaurant_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `restaurant_db`;

-- --------------------------------------------------------
-- Table : users
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','waiter','chef','cashier') NOT NULL DEFAULT 'waiter',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`name`, `email`, `password`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
('Admin',          'admin@restaurant.com',   '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',   1, NOW(), NOW()),
('Chef Pierre',    'chef@restaurant.com',    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'chef',    1, NOW(), NOW()),
('Serveur Marc',   'waiter@restaurant.com',  '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'waiter',  1, NOW(), NOW()),
('Caissier Sophie','cashier@restaurant.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cashier', 1, NOW(), NOW());

-- --------------------------------------------------------
-- Table : categories
-- --------------------------------------------------------
CREATE TABLE `categories` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`name`, `icon`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
('Entrées',  '🥗',  1, 1, NOW(), NOW()),
('Plats',    '🍽️', 2, 1, NOW(), NOW()),
('Desserts', '🍰',  3, 1, NOW(), NOW()),
('Boissons', '🥤',  4, 1, NOW(), NOW());

-- --------------------------------------------------------
-- Table : menu_items
-- --------------------------------------------------------
CREATE TABLE `menu_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` bigint UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `preparation_time` int NOT NULL DEFAULT 15,
  `allergens` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `menu_items` (`category_id`, `name`, `description`, `price`, `is_available`, `preparation_time`, `created_at`, `updated_at`) VALUES
-- Entrées (category_id = 1)
(1, 'Salade César',      'Laitue romaine, parmesan, croûtons, sauce César',          9.50,  1, 8,  NOW(), NOW()),
(1, 'Soupe à l\'oignon', 'Soupe gratinée traditionnelle avec gruyère fondu',         7.00,  1, 10, NOW(), NOW()),
(1, 'Foie gras maison',  'Foie gras de canard, brioche toastée, chutney de figues',  18.00, 1, 5,  NOW(), NOW()),
(1, 'Carpaccio de bœuf', 'Bœuf finement tranché, roquette, copeaux de parmesan',     14.00, 1, 10, NOW(), NOW()),
-- Plats (category_id = 2)
(2, 'Steak Frites',          'Entrecôte 250g, frites maison, sauce au choix',              22.00, 1, 20, NOW(), NOW()),
(2, 'Saumon grillé',         'Pavé de saumon, légumes de saison, beurre citronné',         24.00, 1, 18, NOW(), NOW()),
(2, 'Poulet rôti',           'Poulet fermier rôti, pommes de terre sarladaises, jus',      19.00, 1, 25, NOW(), NOW()),
(2, 'Risotto aux champignons','Risotto crémeux, champignons sauvages, truffe noire',        21.00, 1, 22, NOW(), NOW()),
(2, 'Burger Maison',         'Bœuf angus, cheddar affiné, bacon, oignons confits, frites', 17.00, 1, 15, NOW(), NOW()),
-- Desserts (category_id = 3)
(3, 'Crème brûlée',    'Crème vanillée caramélisée à la flamme',          8.00, 1, 5,  NOW(), NOW()),
(3, 'Fondant chocolat','Cœur coulant au chocolat noir, glace vanille',    9.00, 1, 12, NOW(), NOW()),
(3, 'Tarte Tatin',     'Tarte aux pommes caramélisées, crème fraîche',    8.50, 1, 8,  NOW(), NOW()),
-- Boissons (category_id = 4)
(4, 'Eau minérale',      'Evian ou Perrier 50cl',               3.50, 1, 1, NOW(), NOW()),
(4, 'Vin rouge maison',  'Carafe 25cl, sélection du chef',      6.50, 1, 2, NOW(), NOW()),
(4, 'Café',              'Expresso, noisette ou allongé',        2.50, 1, 3, NOW(), NOW()),
(4, 'Jus de fruit frais','Orange, pomme ou mangue pressée',     5.00, 1, 5, NOW(), NOW());

-- --------------------------------------------------------
-- Table : restaurant_tables
-- --------------------------------------------------------
CREATE TABLE `restaurant_tables` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `number` varchar(255) NOT NULL UNIQUE,
  `capacity` int NOT NULL,
  `status` enum('available','occupied','reserved','cleaning') NOT NULL DEFAULT 'available',
  `location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `restaurant_tables` (`number`, `capacity`, `status`, `location`, `created_at`, `updated_at`) VALUES
('1',  2, 'available', 'Salle principale', NOW(), NOW()),
('2',  2, 'available', 'Salle principale', NOW(), NOW()),
('3',  4, 'available', 'Salle principale', NOW(), NOW()),
('4',  4, 'available', 'Salle principale', NOW(), NOW()),
('5',  4, 'available', 'Salle principale', NOW(), NOW()),
('6',  6, 'available', 'Salle principale', NOW(), NOW()),
('7',  6, 'available', 'Salle principale', NOW(), NOW()),
('8',  8, 'available', 'Salle VIP',        NOW(), NOW()),
('T1', 2, 'available', 'Terrasse',         NOW(), NOW()),
('T2', 4, 'available', 'Terrasse',         NOW(), NOW()),
('T3', 4, 'available', 'Terrasse',         NOW(), NOW());

-- --------------------------------------------------------
-- Table : orders
-- --------------------------------------------------------
CREATE TABLE `orders` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_number` varchar(255) NOT NULL UNIQUE,
  `table_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `status` enum('pending','confirmed','preparing','ready','served','paid','cancelled') NOT NULL DEFAULT 'pending',
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `prepared_at` timestamp NULL DEFAULT NULL,
  `served_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`table_id`) REFERENCES `restaurant_tables`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table : order_items
-- --------------------------------------------------------
CREATE TABLE `order_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `menu_item_id` bigint UNSIGNED NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','preparing','ready','served') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table : invoices
-- --------------------------------------------------------
CREATE TABLE `invoices` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(255) NOT NULL UNIQUE,
  `order_id` bigint UNSIGNED NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax_rate` decimal(5,2) NOT NULL DEFAULT 20.00,
  `tax_amount` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','mobile') NOT NULL DEFAULT 'cash',
  `status` enum('draft','paid','cancelled') NOT NULL DEFAULT 'draft',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Personal access tokens (Laravel Sanctum)
-- --------------------------------------------------------
CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL UNIQUE,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;