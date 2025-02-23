# Cornell Big Red Makeathon Spring 2025

Full-stack application with Vite frontend and Django backend.

## Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
uv venv
source .venv/bin/activate  # On Windows: .\venv\Scripts\activate
uv pip install -r pyproject.toml
python manage.py migrate
python manage.py runserver
```

# **API Specification**

## **User Endpoints**

### **POST** /api/users/register/  
Register a new user.  

**Request:**  
```json
{
  "email": "user@example.com",
  "username": "testuser",
  "password": "securepassword"
}
```

**Response:** 
```json
{
  "message": "User registered successfully.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "testuser",
    "first_name": "",
    "last_name": "",
    "caffeine_sensitivity": 5.0
  },
  "token": "generated_token_here"
}
```

---

### **POST** /api/users/login/  
Authenticate a user and return a token.  

**Request:** 
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**  
```json
{
  "message": "Login successful.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "testuser"
  },
  "token": "generated_token_here"
}
```

---

### **POST** /api/users/logout/  
Log out a user.  

**Headers:**  
Authorization: Token generated_token_here  

**Response:**  
```json
{
  "message": "Logout successful."
}
```

---

### **GET** /api/users/profile/  
Retrieve the authenticated user's profile.  

**Headers:**  
Authorization: Token generated_token_here  

**Response:**  
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "testuser",
  "first_name": "",
  "last_name": "",
  "caffeine_sensitivity": 5.0
}
```

---

### **PATCH** /api/users/profile/  
Update user profile details.  

**Headers:**  
Authorization: Token generated_token_here  

**Request:**  
```json
{
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**  
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "testuser",
  "first_name": "John",
  "last_name": "Doe",
  "caffeine_sensitivity": 5.0
}
```

---

### **POST** /api/users/change-password/  
Change the user's password.  

**Headers:**  
Authorization: Token generated_token_here  

**Request:**  
```json
{
  "old_password": "securepassword",
  "new_password": "newsecurepassword"
}
```

**Response:**  
```json
{
  "message": "Password updated successfully."
}
```

---

## **Authentication Notes**
- Use the **`Authorization: Token <your_token>`** header for endpoints that require authentication.
- Tokens are **returned during login and registration** and must be stored securely.
- Logout will **invalidate the token**. The user will need to re-login to get a new one.

---

## AI Endpoints

### POST /api/ai/submit-drink/  
Uploads an image of a drink to Cloudflare R2, analyzes it using Gemini AI, and returns estimated nutritional details.

**Headers:**  
Authorization: Token **your_auth_token_here**

**Request:**  
FormData:
- **image** (file) - The drink image (JPEG, PNG, etc.).
- **beverage_size_ml** (optional, integer) - The drink size in milliliters.
- **sugar_content_g** (optional, float) - The estimated sugar content.
- **calories_kcal** (optional, float) - The estimated calories.
- **additional_notes** (optional, string) - Any additional user input.

**Example Request:**  
FormData:
- image: **monster_drink.jpg**
- beverage_size_ml: **500**
- sugar_content_g: **54**
- calories_kcal: **230**
- additional_notes: **Monster Energy Drink - Green Can**

**Response:**  
```json  
{
  "image_url": "https://r2.lucasdoell.dev/uploads/caffeine_drinks/monster_drink.jpg",
  "analysis": {
    "drink_name": "Monster Energy",
    "caffeine_content_mg": 160,
    "sugar_content_g": 54,
    "calories_kcal": 230,
    "confidence_score": 0.92
  }
}
```

**Possible Errors:**  
- **400 Bad Request** - Missing required parameters (e.g., no image provided).  
- **500 Internal Server Error** - Issue processing the image or communicating with Gemini AI.  

---

### POST /api/ai/chat/  
A chatbot for answering caffeine-related questions using Gemini AI.

**Headers:**  
Authorization: Token **your_auth_token_here**

**Request:**  
```json  
{
  "message": "How much caffeine is in a Red Bull?"
}
```

**Response:**  
```json  
{
  "response": "A standard 8.4 oz (250ml) can of Red Bull contains approximately 80 mg of caffeine."
}
```

**Possible Errors:**  
- **400 Bad Request** - Missing `message` parameter.  
- **500 Internal Server Error** - AI service is unavailable or encounters an issue.  

---

## Caffeine Tracking Endpoints

### POST /api/caffeine/logs/  
Logs a caffeine entry into the user's tracking history.

**Headers:**  
Authorization: Token **your_auth_token_here**

**Request:**  
```json  
{
  "drink_name": "Latte",
  "caffeine_content_mg": 120,
  "sugar_content_g": 12,
  "calories_kcal": 180,
  "consumed_at": "2025-02-23T08:30:00Z"
}
```

**Response:**  
```json  
{
  "message": "Caffeine log saved successfully.",
  "log": {
    "id": 42,
    "user": "your_user_id",
    "drink_name": "Latte",
    "caffeine_content_mg": 120,
    "sugar_content_g": 12,
    "calories_kcal": 180,
    "consumed_at": "2025-02-23T08:30:00Z"
  }
}
```

**Possible Errors:**  
- **400 Bad Request** - Missing required fields (e.g., no drink name).  
- **500 Internal Server Error** - Database error while saving the log.  

---

### GET /api/caffeine/logs/  
Retrieves all caffeine logs for the authenticated user.

**Headers:**  
Authorization: Token **your_auth_token_here**

**Response:**  
```json  
[
  {
    "id": 42,
    "user": "your_user_id",
    "drink_name": "Latte",
    "caffeine_content_mg": 120,
    "sugar_content_g": 12,
    "calories_kcal": 180,
    "consumed_at": "2025-02-23T08:30:00Z"
  },
  {
    "id": 43,
    "user": "your_user_id",
    "drink_name": "Espresso",
    "caffeine_content_mg": 80,
    "sugar_content_g": 0,
    "calories_kcal": 5,
    "consumed_at": "2025-02-23T10:00:00Z"
  }
]
```

**Possible Errors:**  
- **401 Unauthorized** - User must be logged in.  
- **500 Internal Server Error** - Issue retrieving data from the database.  

---

### GET /api/caffeine/logs/{id}/  
Retrieve details for a single caffeine log by ID.

**Headers:**  
Authorization: Token **your_auth_token_here**

**Example Request:**  
GET `/api/caffeine/logs/42/`

**Response:**  
```json  
{
  "id": 42,
  "user": "your_user_id",
  "drink_name": "Latte",
  "caffeine_content_mg": 120,
  "sugar_content_g": 12,
  "calories_kcal": 180,
  "consumed_at": "2025-02-23T08:30:00Z"
}
```

**Possible Errors:**  
- **401 Unauthorized** - User must be logged in.  
- **404 Not Found** - Caffeine log does not exist for the given ID.  
- **500 Internal Server Error** - Issue retrieving data from the database.  

---

---

