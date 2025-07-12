# 🚌 Shuttle Tracker - Authentication Setup Guide

This guide will help you set up the complete authentication system for the Shuttle Tracker application.

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or cloud instance)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/shuttle_tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

```bash
# Start the backend server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend/latest

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🔐 Authentication Features

### What's Been Added

1. **Complete Backend Authentication System**
   - User registration with validation
   - Secure login with JWT tokens
   - Google OAuth integration
   - Password hashing with bcrypt
   - Rate limiting for security
   - Role-based access control

2. **Frontend Authentication Service**
   - Centralized auth state management
   - Token storage and management
   - Automatic token refresh
   - Google OAuth integration
   - Error handling and user feedback

3. **Protected Routes**
   - Route protection based on authentication
   - Role-based access control
   - Automatic redirects for unauthorized users

### Key Components

#### Backend
- `src/models/User.js` - User model with password hashing
- `src/middleware/auth.js` - JWT authentication middleware
- `src/routes/auth.js` - Authentication API endpoints
- `src/app.js` - Updated with auth routes

#### Frontend
- `src/services/authService.js` - Authentication service
- `src/context/AuthContext.jsx` - Global auth state management
- `src/components/ProtectedRoute.jsx` - Route protection
- `src/pages/Driver.jsx` - Updated with real authentication

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/shuttle_tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Update the client ID in `main.jsx`

## 🧪 Testing the Authentication

### 1. Test Registration
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Driver",
    "email": "driver@example.com",
    "password": "password123",
    "busNumber": "MH-12-AB-1234",
    "mobileNumber": "9876543210",
    "currentLocation": "Campus"
  }'
```

### 2. Test Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@example.com",
    "password": "password123"
  }'
```

### 3. Test Protected Route
```bash
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 Usage Examples

### Frontend Authentication Flow

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await login('driver@example.com', 'password123');
      // User is now logged in
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated() ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Protected Route Usage

```javascript
import ProtectedRoute from '../components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/driver" element={
        <ProtectedRoute requiredRole="driver">
          <DriverDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

## 🔒 Security Features

- **JWT Tokens**: Secure, time-limited authentication
- **Password Hashing**: bcrypt with 12 salt rounds
- **Rate Limiting**: 5 requests per 15 minutes for auth endpoints
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured for security
- **Error Handling**: Secure error responses

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **JWT Token Issues**
   - Check JWT_SECRET in environment
   - Ensure token is being sent in Authorization header
   - Verify token hasn't expired

3. **Google OAuth Not Working**
   - Verify client ID is correct
   - Check authorized origins in Google Console
   - Ensure HTTPS in production

4. **CORS Errors**
   - Check CORS configuration in backend
   - Verify frontend URL is allowed
   - Check browser console for errors

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new driver |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update user profile |

### Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Driver",
      "email": "driver@example.com",
      "role": "driver",
      "busNumber": "MH-12-AB-1234"
    },
    "token": "jwt_token_here"
  }
}
```

## 🚀 Next Steps

1. **Production Deployment**
   - Use environment variables for secrets
   - Set up HTTPS
   - Configure proper CORS
   - Use production MongoDB instance

2. **Additional Features**
   - Password reset functionality
   - Email verification
   - Two-factor authentication
   - Session management

3. **Monitoring**
   - Add logging
   - Set up error tracking
   - Monitor API performance

## 🤝 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure MongoDB is running
4. Check network connectivity
5. Review the troubleshooting section above

---

**Happy coding! 🚌✨** 