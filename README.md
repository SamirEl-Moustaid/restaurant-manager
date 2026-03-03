# 🍽️ Restaurant Manager

Système complet de gestion de restaurant : menu, commandes, cuisine en temps réel, facturation.

## Stack technique

| Couche | Technologie |
|--------|------------|
| Backend | Laravel 10 (API REST) |
| Frontend | React 18 + Vite |
| BDD | MySQL |
| Temps réel | WebSockets (Laravel Echo + Pusher) |
| Style | TailwindCSS |
| Auth | Laravel Sanctum |

## Fonctionnalités

- 🔐 **Auth multi-rôles** : Admin, Serveur, Chef, Caissier
- 📋 **Gestion du menu** : catégories, articles, disponibilité
- 🪑 **Plan des tables** : statut temps réel, localisation
- 📦 **Commandes** : création, suivi, workflow complet
- 👨‍🍳 **Tableau cuisine** : affichage temps réel, gestion par plat
- 🧾 **Facturation** : génération, remises, modes de paiement
- 📊 **Dashboard** : stats du jour, commandes récentes

---

## Installation locale

### Prérequis

- PHP 8.1+
- Composer
- Node.js 18+
- MySQL 8+
- Compte [Pusher](https://pusher.com) (gratuit)

### 1. Backend (Laravel)

```bash
cd backend

# Installer les dépendances
composer install

# Copier le fichier de configuration
cp .env.example .env

# Générer la clé d'application
php artisan key:generate
```

Éditez `.env` avec vos informations :

```env
DB_DATABASE=restaurant_db
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe

PUSHER_APP_ID=xxxxx
PUSHER_APP_KEY=xxxxx
PUSHER_APP_SECRET=xxxxx
PUSHER_APP_CLUSTER=mt1
```

```bash
# Créer la base de données
mysql -u root -p -e "CREATE DATABASE restaurant_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Lancer les migrations + seed
php artisan migrate --seed

# Démarrer le serveur
php artisan serve
```

### 2. Frontend (React)

```bash
cd frontend

# Installer les dépendances
npm install

# Copier la config
cp .env.example .env

# Éditer .env avec votre clé Pusher
# VITE_PUSHER_APP_KEY=xxxxx

# Démarrer le serveur de dev
npm run dev
```

### Accès

- Frontend : http://localhost:5173
- API : http://localhost:8000/api

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@restaurant.com | password |
| Chef | chef@restaurant.com | password |
| Serveur | waiter@restaurant.com | password |
| Caissier | cashier@restaurant.com | password |

---

## Structure du projet

```
restaurant-manager/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Events/
│   │   │   └── OrderStatusUpdated.php   # WebSocket event
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── MenuController.php
│   │   │   ├── OrderController.php
│   │   │   ├── TableController.php
│   │   │   └── InvoiceController.php
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Category.php
│   │       ├── MenuItem.php
│   │       ├── RestaurantTable.php
│   │       ├── Order.php
│   │       ├── OrderItem.php
│   │       └── Invoice.php
│   ├── database/
│   │   ├── migrations/         # 7 migrations
│   │   └── seeders/            # Données de démo
│   └── routes/api.php          # Routes API
│
└── frontend/                   # React App
    └── src/
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── TablesPage.jsx
        │   ├── NewOrderPage.jsx
        │   ├── OrdersPage.jsx
        │   ├── KitchenPage.jsx
        │   ├── MenuPage.jsx
        │   └── InvoicesPage.jsx
        ├── components/layout/Layout.jsx
        ├── services/
        │   ├── api.js           # Axios + interceptors
        │   └── echo.js          # Laravel Echo WebSockets
        └── store/authStore.js   # Zustand state
```

---

## API Endpoints

```
POST   /api/login
POST   /api/logout
GET    /api/me

GET    /api/menu/categories
GET    /api/menu/items
POST   /api/menu/items
PUT    /api/menu/items/{id}
DELETE /api/menu/items/{id}
PATCH  /api/menu/items/{id}/toggle

GET    /api/tables
POST   /api/tables
PUT    /api/tables/{id}
DELETE /api/tables/{id}

GET    /api/orders
POST   /api/orders
GET    /api/orders/kitchen
GET    /api/orders/{id}
PATCH  /api/orders/{id}/status
PATCH  /api/orders/{id}/items/{itemId}/status

GET    /api/invoices
GET    /api/invoices/stats
POST   /api/invoices/order/{orderId}
```

---

## Déploiement production

### Backend (ex: Laravel Forge, Railway, Render)

```bash
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan migrate --force
```

### Frontend (ex: Vercel, Netlify)

```bash
npm run build
# Dossier dist/ à déployer
```

Modifier `VITE_API_URL` pour pointer vers votre serveur de production.
