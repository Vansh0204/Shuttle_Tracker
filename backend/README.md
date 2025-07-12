# Shuttle Tracker Backend

A robust backend API for the shuttle tracking system with authentication, real-time location tracking, and user management.

## 🚀 Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your configuration:
   ```env
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/shuttle_tracker
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

3. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

## 🔧 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with bcrypt
- **Validation:** express-validator
- **Security:** express-rate-limit
- **Real-time:** Socket.IO

## 📁 Project Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── User.js          # User authentication model
│   │   └── Bus.js           # Bus tracking model
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   └── bus.js           # Bus management routes
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── socket.js            # Real-time WebSocket setup
│   └── app.js               # Main application file
├── .env.example             # Environment variables template
├── package.json
└── README.md
```

## 🔐 Authentication Features

### User Registration
- **Endpoint:** `POST /api/auth/register`
- **Required fields:** name, email, password, busNumber, mobileNumber, currentLocation
- **Validation:** Email format, password strength, mobile number format
- **Security:** Password hashing with bcrypt

### User Login
- **Endpoint:** `POST /api/auth/login`
- **Required fields:** email, password
- **Security:** Rate limiting (5 attempts per 15 minutes)
- **Response:** JWT token and user data

### Google OAuth
- **Endpoint:** `POST /api/auth/google`
- **Features:** Google account integration, profile picture sync
- **Security:** Token validation and user verification

### Profile Management
- **Get Profile:** `GET /api/auth/me`
- **Update Profile:** `PUT /api/auth/profile`
- **Security:** JWT token required

## 🚌 Bus Tracking Features

### Real-time Location Updates
- **WebSocket:** Real-time driver location broadcasting
- **GPS:** High-accuracy location tracking
- **Status:** Live bus status updates

### Bus Management
- **CRUD Operations:** Create, read, update bus information
- **Location Tracking:** Current location and route status
- **Driver Assignment:** Bus-driver relationship management

## 🔒 Security Features

- **JWT Authentication:** Secure token-based authentication
- **Password Hashing:** bcrypt with salt rounds
- **Rate Limiting:** Protection against brute force attacks
- **Input Validation:** Comprehensive request validation
- **CORS:** Cross-origin resource sharing configuration
- **Error Handling:** Secure error responses

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register    # Register new driver
POST /api/auth/login       # Login with credentials
POST /api/auth/google      # Google OAuth login
GET  /api/auth/me          # Get current user profile
PUT  /api/auth/profile     # Update user profile
```

### Bus Management
```
GET    /api/buses          # Get all buses
POST   /api/buses          # Add new bus
PUT    /api/buses/:id      # Update bus
DELETE /api/buses/:id      # Delete bus
```

### System
```
GET /          # API status
GET /health    # Health check
```

## 🛠️ Development

### Running in Development
```bash
npm run dev
```

### Running in Production
```bash
npm start
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/shuttle_tracker` |
| `JWT_SECRET` | JWT signing secret | Required |
| `NODE_ENV` | Environment mode | `development` |

## 🔍 Testing

The API includes comprehensive error handling and validation. Test endpoints using tools like Postman or curl:

```bash
# Test API status
curl http://localhost:5001/

# Test health check
curl http://localhost:5001/health
```

## 📝 Notes

- JWT tokens expire after 30 days
- Passwords are hashed with bcrypt (12 salt rounds)
- Rate limiting: 5 requests per 15 minutes for auth endpoints
- All timestamps are in ISO format
- User roles: `driver`, `student`, `admin`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
