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
