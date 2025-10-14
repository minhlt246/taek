# Taekwondo Club Management API - Swagger Documentation

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd api
npm install
```

### 2. Environment Setup
Copy `env.example` to `.env` and update the values:
```bash
cp env.example .env
```

### 3. Start the API Server
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## 📚 Swagger UI Access

Once the server is running, you can access the Swagger documentation at:

**🔗 http://localhost:3001/api/docs**

## 🛠️ API Features

### Authentication Endpoints
- `GET /auth/ping` - Test API connectivity
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile (requires JWT)

### Swagger Features
- ✅ **Interactive API Documentation**
- ✅ **Request/Response Examples**
- ✅ **JWT Authentication Support**
- ✅ **Request Validation**
- ✅ **Error Response Documentation**
- ✅ **Custom Styling**

## 🔧 Configuration

### Swagger Configuration (main.ts)
```typescript
const config = new DocumentBuilder()
  .setTitle('Taekwondo Club Management API')
  .setDescription('API documentation for Taekwondo Club Management System')
  .setVersion('1.0')
  .addBearerAuth() // JWT Authentication
  .addServer('http://localhost:3001', 'Development server')
  .build();
```

### Available Tags
- `auth` - Authentication endpoints
- `users` - User management
- `clubs` - Club management
- `coaches` - Coach management
- `courses` - Course management
- `enrollments` - Enrollment management
- `payments` - Payment management
- `events` - Event management
- `notifications` - Notification management

## 🔐 Authentication

The API uses JWT Bearer token authentication. To test protected endpoints:

1. Use the `/auth/login` endpoint to get a token
2. Click the "Authorize" button in Swagger UI
3. Enter: `Bearer your-jwt-token-here`
4. Now you can test protected endpoints

## 📝 API Response Format

All API responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

## 🚨 Error Responses

Error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 🔄 Development Workflow

1. **Add new endpoints** in controllers
2. **Add Swagger decorators** for documentation
3. **Update DTOs** for request/response validation
4. **Test endpoints** using Swagger UI
5. **Update documentation** as needed

## 📋 Available Scripts

```bash
# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm run test

# Run linting
npm run lint
```

## 🌐 CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (Frontend)
- `http://localhost:3001` (API)

## 📊 Database Connection

The API connects to MySQL database with these settings:
- Host: localhost:8889
- Database: taekwondo_club
- Username: taekwondo_user
- Password: taekwondo_pass123

## 🎯 Next Steps

1. **Implement JWT Authentication**
2. **Add Database Entities**
3. **Create CRUD Operations**
4. **Add Validation Pipes**
5. **Implement Error Handling**
6. **Add Unit Tests**

## 📞 Support

For questions or issues, please check the Swagger documentation or contact the development team.
