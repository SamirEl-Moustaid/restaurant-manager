<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\RestaurantTable;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Users
        User::create([
            'name' => 'Admin',
            'email' => 'admin@restaurant.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
        User::create([
            'name' => 'Chef Pierre',
            'email' => 'chef@restaurant.com',
            'password' => Hash::make('password'),
            'role' => 'chef',
        ]);
        User::create([
            'name' => 'Serveur Marc',
            'email' => 'waiter@restaurant.com',
            'password' => Hash::make('password'),
            'role' => 'waiter',
        ]);
        User::create([
            'name' => 'Caissier Sophie',
            'email' => 'cashier@restaurant.com',
            'password' => Hash::make('password'),
            'role' => 'cashier',
        ]);

        // Categories
        $entrees = Category::create(['name' => 'Entrées', 'icon' => '🥗', 'sort_order' => 1]);
        $plats = Category::create(['name' => 'Plats', 'icon' => '🍽️', 'sort_order' => 2]);
        $desserts = Category::create(['name' => 'Desserts', 'icon' => '🍰', 'sort_order' => 3]);
        $boissons = Category::create(['name' => 'Boissons', 'icon' => '🥤', 'sort_order' => 4]);

        // Menu Items
        MenuItem::insert([
            // Entrées
            ['category_id' => $entrees->id, 'name' => 'Salade César', 'description' => 'Laitue romaine, parmesan, croûtons, sauce César', 'price' => 9.50, 'preparation_time' => 8, 'is_available' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $entrees->id, 'name' => 'Soupe à l\'oignon', 'description' => 'Soupe gratinée traditionnelle avec gruyère fondu', 'price' => 7.00, 'preparation_time' => 10, 'is_available' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $entrees->id, 'name' => 'Foie gras maison', 'description' => 'Foie gras de canard, brioche toastée, chutney de figues', 'price' => 18.00, 'preparation_time' => 5, 'is_available' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $entrees->id, 'name' => 'Carpaccio de bœuf', 'description' => 'Bœuf finement tranché, roquette, copeaux de parmesan', 'price' => 14.00, 'preparation_time' => 10, 'is_available' => true, 'created_at' => now(), 'updated_at' => now()],

            // Plats
            ['category_id' => $plats->id, 'name' => 'Steak Frites', 'description' => 'Entrecôte 250g, frites maison, sauce au choix', 'price' => 22.00, 'preparation_time' => 20, 'is_available' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $plats->id, 'name' => 'Saumon grillé', 'description' => 'Pavé de saumon, légumes de saison, beurre citronné', 'price' => 24.00, 'preparation_time' => 18, 'is_available' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $plats->id, 'name' => 'Poulet rôti', 'description' => 'Poulet fermier rôti, pommes de terre sarladaises, jus de rôti', 'price' => 19.00, 'preparation_time' => 25, 'is_available' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $plats->id, 'name' => 'Risotto aux champignons', 'description' => 'Risotto crémeux, champignons sauvages, truffe noire', 'price' => 21.00, 'preparation_time' => 22, 'is_available' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $plats->id, 'name' => 'Burger Maison', 'description' => 'Bœuf angus, cheddar affiné, bacon, oignons confits, frites', 'price' => 17.00, 'preparation_time' => 15, 'is_available' => true, 'created_at' => now(), 'updated_at' => now()],

            // Desserts
            ['category_id' => $desserts->id, 'name' => 'Crème brûlée', 'description' => 'Crème vanillée caramélisée à la flamme', 'price' => 8.00, 'preparation_time' => 5, 'is_available' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $desserts->id, 'name' => 'Fondant chocolat', 'description' => 'Cœur coulant au chocolat noir, glace vanille', 'price' => 9.00, 'preparation_time' => 12, 'is_available' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $desserts->id, 'name' => 'Tarte Tatin', 'description' => 'Tarte aux pommes caramélisées, crème fraîche', 'price' => 8.50, 'preparation_time' => 8, 'is_available' => true, 'created_at' => now(), 'updated_at' => now()],

            // Boissons
            ['category_id' => $boissons->id, 'name' => 'Eau minérale', 'description' => 'Evian ou Perrier 50cl', 'price' => 3.50, 'preparation_time' => 1, 'is_available' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $boissons->id, 'name' => 'Vin rouge maison', 'description' => 'Carafe 25cl, sélection du chef', 'price' => 6.50, 'preparation_time' => 2, 'is_available' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $boissons->id, 'name' => 'Café', 'description' => 'Expresso, noisette ou allongé', 'price' => 2.50, 'preparation_time' => 3, 'is_available' => true, 'created_at' => now(), 'updated_at' => now()],
            ['category_id' => $boissons->id, 'name' => 'Jus de fruit frais', 'description' => 'Orange, pomme ou mangue pressée', 'price' => 5.00, 'preparation_time' => 5, 'is_available' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Tables
        $tables = [
            ['number' => '1', 'capacity' => 2, 'location' => 'Salle principale'],
            ['number' => '2', 'capacity' => 2, 'location' => 'Salle principale'],
            ['number' => '3', 'capacity' => 4, 'location' => 'Salle principale'],
            ['number' => '4', 'capacity' => 4, 'location' => 'Salle principale'],
            ['number' => '5', 'capacity' => 4, 'location' => 'Salle principale'],
            ['number' => '6', 'capacity' => 6, 'location' => 'Salle principale'],
            ['number' => '7', 'capacity' => 6, 'location' => 'Salle principale'],
            ['number' => '8', 'capacity' => 8, 'location' => 'Salle VIP'],
            ['number' => 'T1', 'capacity' => 2, 'location' => 'Terrasse'],
            ['number' => 'T2', 'capacity' => 4, 'location' => 'Terrasse'],
            ['number' => 'T3', 'capacity' => 4, 'location' => 'Terrasse'],
        ];

        foreach ($tables as $table) {
            RestaurantTable::create($table);
        }
    }
}
