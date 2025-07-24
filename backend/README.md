# Quantum Chess Backend API

A Node.js backend with JWT authentication, MongoDB, and PM2 deployment for the Quantum Chess application.

## 🚀 Features

- **JWT Authentication** with Access & Refresh tokens
- **MongoDB** database with Mongoose ODM
- **User Management** with invite system
- **Rate Limiting** and security middleware
- **PM2** process manager for production
- **EC2** deployment ready

## 📋 Prerequisites

- Node.js 16+ 
- MongoDB (local or cloud)
- PM2 (for production)

## 🛠️ Installation

1. **Clone and navigate to backend**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB** (local)
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or start manually
mongod --dbpath /usr/local/var/mongodb
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/quantum-chess

# JWT Configuration
JWT_ACCESS_SECRET=your-access-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### PM2 (Production)
```bash
# Start with PM2
npm run pm2:start

# Check status
npm run pm2:status

# View logs
npm run pm2:logs

# Restart
npm run pm2:restart

# Stop
npm run pm2:stop
```

## 📡 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "inviteCode": "optional-invite-code"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer your-access-token
```

#### Generate Invite
```http
POST /api/auth/invite
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "email": "friend@example.com"
}
```

### Health Check
```http
GET /health
```

## 🔐 Security Features

- **JWT Tokens**: Access (15m) + Refresh (7d)
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS**: Configured for frontend
- **Helmet**: Security headers
- **Input Validation**: Express-validator
- **Error Handling**: Comprehensive error responses

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  inviteCode: String (unique),
  refreshTokens: Array,
  gameStats: Object,
  invitedBy: ObjectId,
  isActive: Boolean,
  timestamps: true
}
```

## 🚀 Deployment

### Local Development
1. Start MongoDB
2. Set up environment variables
3. Run `npm run dev`

### Production (EC2)
1. **Install dependencies on EC2**
```bash
sudo apt update
sudo apt install nodejs npm mongodb
npm install -g pm2
```

2. **Set up environment**
```bash
# Copy your .env file
# Configure MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

3. **Deploy with PM2**
```bash
npm run pm2:start
```

4. **Configure Nginx** (optional)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring

### PM2 Commands
```bash
# View all processes
pm2 list

# Monitor resources
pm2 monit

# View logs
pm2 logs quantum-chess-api

# Restart application
pm2 restart quantum-chess-api
```

### Health Check
```bash
curl http://localhost:5000/health
```

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env

2. **JWT Errors**
   - Verify JWT secrets in .env
   - Check token expiration

3. **CORS Issues**
   - Update FRONTEND_URL in .env
   - Check CORS configuration

4. **PM2 Issues**
   - Check logs: `pm2 logs`
   - Restart: `pm2 restart quantum-chess-api`

## 📝 Scripts

```bash
# Development
npm run dev          # Start with nodemon

# Production
npm start            # Start with node
npm run pm2:start    # Start with PM2
npm run pm2:stop     # Stop PM2
npm run pm2:restart  # Restart PM2
npm run pm2:logs     # View logs
npm run pm2:status   # Check status
```

## 🔗 Frontend Integration

Update your frontend to use the API:

```javascript
const API_BASE = 'http://localhost:5000/api';

// Login
const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Register
const register = async (userData) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};
```

## 📄 License

MIT License - see LICENSE file for details. 