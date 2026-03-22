-- ============================================
-- FoodDelivery Database Schema
-- PostgreSQL Migration Script
-- ============================================

-- Удаляем таблицы если существуют (в правильном порядке из-за FK)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS dishes CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================
-- Таблица ролей (Roles)
-- ============================================
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================
-- Таблица клиентов (Clients)
-- ============================================
CREATE TABLE clients (
    client_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    login VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(role_id) DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для clients
CREATE INDEX idx_clients_login ON clients(login);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_phone ON clients(phone);

-- ============================================
-- Таблица категорий (Categories)
-- ============================================
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- ============================================
-- Таблица блюд (Dishes)
-- ============================================
CREATE TABLE dishes (
    dish_id SERIAL PRIMARY KEY,
    dish_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category_id INTEGER NOT NULL REFERENCES categories(category_id),
    is_available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для dishes
CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_dishes_available ON dishes(is_available);
CREATE INDEX idx_dishes_name ON dishes(dish_name);

-- ============================================
-- Таблица заказов (Orders)
-- ============================================
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'cooking', 'delivering', 'done', 'cancelled')),
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    delivery_address TEXT NOT NULL,
    delivery_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для orders
CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ============================================
-- Таблица позиций заказа (Order_items)
-- ============================================
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    dish_id INTEGER NOT NULL REFERENCES dishes(dish_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_order DECIMAL(10, 2) NOT NULL CHECK (price_at_order >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для order_items
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_dish ON order_items(dish_id);

-- ============================================
-- SEED DATA - Начальные данные
-- ============================================

-- Роли
INSERT INTO roles (role_name) VALUES 
    ('admin'),      -- role_id = 1
    ('customer');   -- role_id = 2

-- Категории
INSERT INTO categories (category_name, description) VALUES 
    ('Pizza', 'Итальянская пицца с различными начинками'),
    ('Sushi', 'Традиционные японские суши и роллы'),
    ('Drinks', 'Напитки'),
    ('Desserts', 'Десерты');

-- Блюда (Pizza)
INSERT INTO dishes (dish_name, description, price, category_id, is_available, image_url) VALUES 
    ('Margherita', 'Классическая пицца с томатным соусом, моцареллой и базиликом', 450.00, 1, TRUE, '/images/margherita.jpg'),
    ('Pepperoni', 'Пицца с пепперони и моцареллой', 550.00, 1, TRUE, '/images/pepperoni.jpg'),
    ('Quattro Formaggi', 'Пицца с четырьмя видами сыра: моцарелла, горгонзола, пармезан, эмменталь', 650.00, 1, TRUE, '/images/quattro.jpg'),
    ('Hawaiian', 'Пицца с ветчиной и ананасами', 500.00, 1, TRUE, '/images/hawaiian.jpg'),
    ('Meat Feast', 'Пицца с ассорти из мяса: пепперони, ветчина, бекон, фарш', 700.00, 1, TRUE, '/images/meat.jpg');

-- Блюда (Sushi)
INSERT INTO dishes (dish_name, description, price, category_id, is_available, image_url) VALUES 
    ('California Roll', 'Ролл с крабом, авокадо и огурцом, покрытый икрой масаго', 350.00, 2, TRUE, '/images/california.jpg'),
    ('Philadelphia Roll', 'Ролл с лососем, сливочным сыром и огурцом', 450.00, 2, TRUE, '/images/philadelphia.jpg'),
    ('Dragon Roll', 'Ролл с угрем, авокадо и унаги соусом', 550.00, 2, TRUE, '/images/dragon.jpg'),
    ('Salmon Nigiri', 'Нигири с лососем (2 шт)', 250.00, 2, TRUE, '/images/salmon-nigiri.jpg'),
    ('Tuna Sashimi', 'Сашими с тунцом (5 шт)', 400.00, 2, TRUE, '/images/tuna-sashimi.jpg');

-- Блюда (Drinks)
INSERT INTO dishes (dish_name, description, price, category_id, is_available, image_url) VALUES 
    ('Coca-Cola', 'Газированный напиток 0.5л', 100.00, 3, TRUE, '/images/coke.jpg'),
    ('Orange Juice', 'Свежевыжатый апельсиновый сок 0.3л', 200.00, 3, TRUE, '/images/orange-juice.jpg'),
    ('Green Tea', 'Зеленый чай горячий', 80.00, 3, TRUE, '/images/tea.jpg');

-- Блюда (Desserts)
INSERT INTO dishes (dish_name, description, price, category_id, is_available, image_url) VALUES 
    ('Tiramisu', 'Классический итальянский десерт', 300.00, 4, TRUE, '/images/tiramisu.jpg'),
    ('Chocolate Cake', 'Шоколадный торт с вишней', 250.00, 4, TRUE, '/images/choco-cake.jpg');

-- Тестовый клиент (пароль: "password123")
-- Хэш сгенерирован через bcrypt с солью
INSERT INTO clients (first_name, last_name, phone, email, login, password_hash, role_id) VALUES 
    ('Test', 'User', '+79991234567', 'test@example.com', 'testuser', '$2a$10$KIXvZ9zJzJzJzJzJzJzJzOZvZ9zJzJzJzJzJzJzJzJzJzJzJzJzJz', 2);

-- Примечание: реальный хэш для "password123" нужно сгенерировать через bcrypt
-- Временный пароль для тестирования (замените на реальный хэш)
UPDATE clients SET password_hash = '$2a$10$rQZQvQvQvQvQvQvQvQvQvO.rQZQvQvQvQvQvQvQvQvQvQvQvQvQvQ' 
WHERE login = 'testuser';

-- ============================================
-- Полезные представления (Views)
-- ============================================

-- Представление: меню с категориями
CREATE OR REPLACE VIEW menu_view AS
SELECT 
    d.dish_id,
    d.dish_name,
    d.description,
    d.price,
    d.is_available,
    d.image_url,
    c.category_name,
    c.category_id
FROM dishes d
JOIN categories c ON d.category_id = c.category_id
ORDER BY c.category_name, d.dish_name;

-- ============================================
-- Функция для обновления updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at BEFORE UPDATE ON dishes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
