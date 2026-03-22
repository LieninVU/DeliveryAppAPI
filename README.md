# FoodDelivery Backend

Backend для приложения доставки еды (Пицца, Суши) на Node.js + Express + PostgreSQL.

## 📋 Требования

- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x
- **npm** >= 9.x

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

1. Создайте базу данных в PostgreSQL:

```sql
CREATE DATABASE food_delivery;
```

2. Выполните миграцию (файл `database/migration.sql`):

```bash
# Через psql
psql -U postgres -d food_delivery -f database/migration.sql

# Или через DBeaver:
# - Откройте DBeaver
# - Подключитесь к базе food_delivery
# - Откройте файл database/migration.sql
# - Выполните скрипт (Ctrl+Enter)
```

### 3. Настройка переменных окружения

Файл `.env` уже создан. При необходимости измените значения:

```env
PORT=3000
NODE_ENV=development

DB_USER=postgres
DB_PASS=postgres
HOST=localhost
DATABASE=food_delivery
DB_PORT=5432

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

BCRYPT_SALT_ROUNDS=10
```

⚠️ **Важно:** Измените `JWT_SECRET` на уникальное значение в продакшене!

### 4. Запуск сервера

```bash
npm start
```

Сервер запустится на порту `3000` (или другом, указанном в `.env`).

---

## 📁 Структура проекта

```
FoodDelivery/
├── controllers/          # Контроллеры
│   ├── authController.js
│   ├── menuController.js
│   ├── orderController.js
│   └── clientController.js
├── middleware/           # Middleware
│   └── authMiddleware.js
├── routes/               # Маршруты
│   ├── authRoutes.js
│   ├── menuRoutes.js
│   ├── orderRoutes.js
│   └── adminRoutes.js
├── database/             # SQL скрипты
│   └── migration.sql
├── db.js                 # Подключение к БД
├── index.js              # Точка входа
├── .env                  # Переменные окружения
├── package.json
└── API_DOCS.md           # Документация API
```

---

## 🧪 Тестирование в Postman

### 1. Регистрация пользователя

**POST** `http://localhost:3000/api/auth/register`

**Body (raw JSON):**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+79991234567",
  "email": "john@example.com",
  "login": "johndoe",
  "password": "password123"
}
```

**Ожидаемый ответ:** `201 Created`

---

### 2. Логин и получение токена

**POST** `http://localhost:3000/api/auth/login`

**Body (raw JSON):**
```json
{
  "login": "johndoe",
  "password": "password123"
}
```

**Ожидаемый ответ:** `200 OK` с токеном

Сохраните токен из ответа — он понадобится для следующих запросов.

---

### 3. Получение меню

**GET** `http://localhost:3000/api/menu`

**Ожидаемый ответ:** `200 OK` со списком блюд

---

### 4. Оформление заказа (требуется токен)

**POST** `http://localhost:3000/api/orders`

**Headers:**
```
Authorization: Bearer <ваш-токен>
```

**Body (raw JSON):**
```json
{
  "items": [
    { "dishId": 1, "quantity": 2 },
    { "dishId": 6, "quantity": 1 }
  ],
  "delivery_address": "ул. Пушкина, д. 10, кв. 5",
  "delivery_phone": "+79991234567"
}
```

**Ожидаемый ответ:** `201 Created`

---

### 5. Получение своих заказов

**GET** `http://localhost:3000/api/orders/my`

**Headers:**
```
Authorization: Bearer <ваш-токен>
```

**Ожидаемый ответ:** `200 OK`

---

### 6. Получение заказа по ID

**GET** `http://localhost:3000/api/orders/1`

**Headers:**
```
Authorization: Bearer <ваш-токен>
```

**Ожидаемый ответ:** `200 OK` с деталями заказа

---

## 📡 Эндпоинты API

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| POST | `/api/auth/register` | Регистрация | ❌ |
| POST | `/api/auth/login` | Логин | ❌ |
| GET | `/api/auth/profile` | Профиль | ✅ |
| GET | `/api/menu` | Меню | ❌ |
| GET | `/api/menu/categories` | Категории | ❌ |
| GET | `/api/menu/:id` | Блюдо по ID | ❌ |
| POST | `/api/orders` | Создать заказ | ✅ |
| GET | `/api/orders/my` | Мои заказы | ✅ |
| GET | `/api/orders/:id` | Заказ по ID | ✅ |
| PATCH | `/api/orders/:id/cancel` | Отмена заказа | ✅ |
| GET | `/api/admin/clients` | Все клиенты | 🔒 Admin |
| GET | `/api/admin/clients/:id` | Клиент по ID | 🔒 Admin |

**Условные обозначения:**
- ✅ — требуется аутентификация (JWT)
- 🔒 — требуется роль администратора
- ❌ — публичный доступ

---

## 🔐 Безопасность

### JWT Аутентификация

- Токен передается в заголовке: `Authorization: Bearer <token>`
- Срок действия токена: 24 часа (настраивается в `.env`)
- Пароли хэшируются через bcrypt (10 раундов)

### Защита от SQL-инъекций

- Все запросы параметризированы
- Используются плейсхолдеры (`$1`, `$2`, ...)

### Валидация данных

- Проверка обязательных полей
- Проверка типов данных
- Проверка бизнес-логики (статусы заказов, доступность блюд)

---

## 🐛 Обработка ошибок

Все ошибки возвращаются в едином формате:

```json
{
  "success": false,
  "error": "Описание ошибки"
}
```

**Коды ответов:**
- `200` — Успех
- `201` — Ресурс создан
- `400` — Ошибка валидации
- `401` — Неавторизован
- `403` — Доступ запрещен
- `404` — Не найдено
- `500` — Ошибка сервера

---

## 📝 Статусы заказа

```
new → cooking → delivering → done
  ↓
cancelled
```

- **new** — Новый заказ
- **cooking** — Готовится
- **delivering** — Доставляется
- **done** — Выполнен
- **cancelled** — Отменен

---

## 🔧 Дополнительные команды

```bash
# Запуск в режиме разработки
npm start

# Проверка здоровья сервера
curl http://localhost:3000/health
```

---

## 📚 Документация

Полная документация API находится в файле [`API_DOCS.md`](./API_DOCS.md).

---

## ⚙️ Настройка для продакшена

1. Измените `.env`:
   ```env
   NODE_ENV=production
   JWT_SECRET=<сложный-уникальный-ключ>
   DB_PASS=<сложный-пароль>
   ```

2. Используйте HTTPS (настройте reverse proxy через Nginx)

3. Настройте rate limiting для защиты от DDoS

4. Включите логирование (winston/morgan)

---

## 📄 Лицензия

ISC
