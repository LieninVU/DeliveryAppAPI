# FoodDelivery API Documentation

REST API для приложения доставки еды (Пицца, Суши).

## Содержание

- [Базовая информация](#базовая-информация)
- [Авторизация](#авторизация)
- [Меню](#меню)
- [Заказы](#заказы)
- [Администрирование](#администрирование)
- [Коды ответов](#коды-ответов)

---

## Базовая информация

**Base URL:** `http://localhost:3000/api`

**Формат данных:** JSON

**Заголовки:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>` (для защищенных эндпоинтов)

---

## Авторизация

### Регистрация пользователя

**POST** `/auth/register`

Создание нового аккаунта.

**Тело запроса:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+79991234567",
  "email": "john@example.com",
  "login": "johndoe",
  "password": "securePassword123"
}
```

**Обязательные поля:** `first_name`, `last_name`, `phone`, `login`, `password`

**Ответ 201 Created:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "client_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+79991234567",
    "email": "john@example.com",
    "login": "johndoe",
    "role_id": 2,
    "created_at": "2026-03-22T10:00:00.000Z"
  }
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"first_name\":\"John\",\"last_name\":\"Doe\",\"phone\":\"+79991234567\",\"login\":\"johndoe\",\"password\":\"securePassword123\"}"
```

---

### Логин

**POST** `/auth/login`

Получение JWT токена.

**Тело запроса:**
```json
{
  "login": "johndoe",
  "password": "securePassword123"
}
```

**Ответ 200 OK:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": "24h",
    "user": {
      "client_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+79991234567",
      "email": "john@example.com",
      "login": "johndoe",
      "role": "customer"
    }
  }
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"login\":\"johndoe\",\"password\":\"securePassword123\"}"
```

---

### Профиль пользователя

**GET** `/auth/profile`

Получение данных текущего пользователя.

**Заголовки:**
```
Authorization: Bearer <token>
```

**Ответ 200 OK:**
```json
{
  "success": true,
  "data": {
    "client_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+79991234567",
    "email": "john@example.com",
    "login": "johndoe",
    "role_id": 2,
    "role_name": "customer",
    "created_at": "2026-03-22T10:00:00.000Z"
  }
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <your-token>"
```

---

## Меню

### Получить всё меню

**GET** `/menu`

Получение списка всех блюд с категориями.

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| category | string | Фильтр по категории (Pizza, Sushi, Drinks, Desserts) |
| available | boolean | Фильтр по доступности (true/false) |

**Примеры:**
- `/api/menu?category=Pizza` — только пицца
- `/api/menu?available=true` — только доступные блюда
- `/api/menu?category=Sushi&available=true` — доступные суши

**Ответ 200 OK:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "dish_id": 1,
      "dish_name": "Margherita",
      "description": "Классическая пицца с томатным соусом, моцареллой и базиликом",
      "price": "450.00",
      "is_available": true,
      "image_url": "/images/margherita.jpg",
      "category_name": "Pizza",
      "category_id": 1
    },
    {
      "dish_id": 6,
      "dish_name": "California Roll",
      "description": "Ролл с крабом, авокадо и огурцом, покрытый икрой масаго",
      "price": "350.00",
      "is_available": true,
      "image_url": "/images/california.jpg",
      "category_name": "Sushi",
      "category_id": 2
    }
  ]
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/menu
curl -X GET "http://localhost:3000/api/menu?category=Pizza"
curl -X GET "http://localhost:3000/api/menu?available=true"
```

---

### Получить категории

**GET** `/menu/categories`

Получение списка всех категорий.

**Ответ 200 OK:**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "category_id": 1,
      "category_name": "Pizza",
      "description": "Итальянская пицца с различными начинками"
    },
    {
      "category_id": 2,
      "category_name": "Sushi",
      "description": "Традиционные японские суши и роллы"
    }
  ]
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/menu/categories
```

---

### Получить блюдо по ID

**GET** `/menu/:id`

**Ответ 200 OK:**
```json
{
  "success": true,
  "data": {
    "dish_id": 1,
    "dish_name": "Margherita",
    "description": "Классическая пицца с томатным соусом, моцареллой и базиликом",
    "price": "450.00",
    "is_available": true,
    "image_url": "/images/margherita.jpg",
    "category_name": "Pizza",
    "category_id": 1
  }
}
```

**Ответ 404 Not Found:**
```json
{
  "success": false,
  "error": "Dish not found"
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/menu/1
```

---

## Заказы

### Оформить заказ

**POST** `/orders`

Создание нового заказа. Требуется аутентификация.

**Заголовки:**
```
Authorization: Bearer <token>
```

**Тело запроса:**
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

**Ответ 201 Created:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "order_id": 1,
      "client_id": 1,
      "status": "new",
      "total_amount": "1250.00",
      "delivery_address": "ул. Пушкина, д. 10, кв. 5",
      "delivery_phone": "+79991234567",
      "created_at": "2026-03-22T12:00:00.000Z"
    },
    "order_items": [
      {
        "order_item_id": 1,
        "order_id": 1,
        "dish_id": 1,
        "quantity": 2,
        "price_at_order": "450.00"
      },
      {
        "order_item_id": 2,
        "order_id": 1,
        "dish_id": 6,
        "quantity": 1,
        "price_at_order": "350.00"
      }
    ]
  }
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d "{\"items\":[{\"dishId\":1,\"quantity\":2},{\"dishId\":6,\"quantity\":1}],\"delivery_address\":\"ул. Пушкина, д. 10, кв. 5\",\"delivery_phone\":\"+79991234567\"}"
```

---

### Получить мои заказы

**GET** `/orders/my`

Получение всех заказов текущего пользователя.

**Заголовки:**
```
Authorization: Bearer <token>
```

**Ответ 200 OK:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "order_id": 5,
      "status": "new",
      "total_amount": "1250.00",
      "delivery_address": "ул. Пушкина, д. 10, кв. 5",
      "delivery_phone": "+79991234567",
      "created_at": "2026-03-22T12:00:00.000Z",
      "updated_at": "2026-03-22T12:00:00.000Z",
      "items_count": "2"
    }
  ]
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/orders/my \
  -H "Authorization: Bearer <your-token>"
```

---

### Получить заказ по ID

**GET** `/orders/:id`

Получение детальной информации о заказе. Доступно только владельцу заказа или администратору.

**Заголовки:**
```
Authorization: Bearer <token>
```

**Ответ 200 OK:**
```json
{
  "success": true,
  "data": {
    "order_id": 1,
    "client_id": 1,
    "status": "new",
    "total_amount": "1250.00",
    "delivery_address": "ул. Пушкина, д. 10, кв. 5",
    "delivery_phone": "+79991234567",
    "created_at": "2026-03-22T12:00:00.000Z",
    "updated_at": "2026-03-22T12:00:00.000Z",
    "items": [
      {
        "order_item_id": 1,
        "dish_id": 1,
        "dish_name": "Margherita",
        "quantity": 2,
        "price_at_order": "450.00"
      },
      {
        "order_item_id": 2,
        "dish_id": 6,
        "dish_name": "California Roll",
        "quantity": 1,
        "price_at_order": "350.00"
      }
    ]
  }
}
```

**Ответ 403 Forbidden:**
```json
{
  "success": false,
  "error": "Access denied. You can only view your own orders"
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/orders/1 \
  -H "Authorization: Bearer <your-token>"
```

---

### Отменить заказ

**PATCH** `/orders/:id/cancel`

Отмена заказа со статусом 'new'.

**Заголовки:**
```
Authorization: Bearer <token>
```

**Ответ 200 OK:**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "order_id": 1,
    "status": "cancelled",
    "updated_at": "2026-03-22T12:30:00.000Z"
  }
}
```

**Ответ 400 Bad Request:**
```json
{
  "success": false,
  "error": "Cannot cancel order with status 'cooking'"
}
```

**curl:**
```bash
curl -X PATCH http://localhost:3000/api/orders/1/cancel \
  -H "Authorization: Bearer <your-token>"
```

---

## Администрирование

### Получить всех клиентов

**GET** `/admin/clients`

Только для администраторов.

**Заголовки:**
```
Authorization: Bearer <admin-token>
```

**Ответ 200 OK:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "client_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+79991234567",
      "email": "john@example.com",
      "login": "johndoe",
      "role_id": 2,
      "created_at": "2026-03-22T10:00:00.000Z"
    }
  ]
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/admin/clients \
  -H "Authorization: Bearer <admin-token>"
```

---

### Получить клиента по ID

**GET** `/admin/clients/:id`

Только для администраторов.

**Заголовки:**
```
Authorization: Bearer <admin-token>
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/admin/clients/1 \
  -H "Authorization: Bearer <admin-token>"
```

---

## Коды ответов

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Ресурс создан |
| 400 | Ошибка валидации данных |
| 401 | Неавторизованный доступ (нет токена или истек срок) |
| 403 | Доступ запрещен (недостаточно прав) |
| 404 | Ресурс не найден |
| 500 | Внутренняя ошибка сервера |

---

## Статусы заказа

| Статус | Описание |
|--------|----------|
| `new` | Новый заказ, ожидает подтверждения |
| `cooking` | Заказ готовится |
| `delivering` | Заказ доставляется |
| `done` | Заказ выполнен |
| `cancelled` | Заказ отменен |

---

## Health Check

**GET** `/health`

Проверка работоспособности сервера.

**Ответ 200 OK:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-03-22T10:00:00.000Z"
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/health
```
