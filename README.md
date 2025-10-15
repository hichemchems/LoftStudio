# EasyGestion API - Barber Shop Management System

A comprehensive management system for barber shops with real-time analytics, employee management, and financial tracking.

## Features

- **User Management**: Role-based access (SuperAdmin, Admin, Barber)
- **Package Management**: Customizable service packages with pricing
- **Sales & Receipts Tracking**: Real-time sales and receipt entry
- **Analytics Dashboard**: Turnover, profit, and performance metrics
- **Salary Calculation**: Automated salary generation based on commissions
- **Expense Management**: Track and categorize expenses
- **Real-time Updates**: Live dashboard updates using Socket.io
- **Mobile-First Design**: Responsive UI optimized for mobile devices

## Architecture

- **Backend**: Node.js/Express with Sequelize ORM
- **Frontend**: React with Material-UI
- **Database**: MySQL
- **Containerization**: Docker with docker-compose

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd loftBarber
```

2. Start the application:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:3306

## API Documentation

### Authentication
- POST /api/v1/auth/register - User registration
- POST /api/v1/auth/login - User login
- POST /api/v1/auth/logout - User logout

### Packages
- GET /api/v1/packages - Get all active packages
- POST /api/v1/packages - Create new package (Admin only)
- PUT /api/v1/packages/:id - Update package (Admin only)
- DELETE /api/v1/packages/:id - Deactivate package (Admin only)

### Users
- GET /api/v1/users - Get all users (Admin only)
- POST /api/v1/users - Create new user (Admin only)
- PUT /api/v1/users/:id - Update user (Admin only)

### Sales & Receipts
- GET /api/v1/employees/:id/sales - Get employee sales
- POST /api/v1/employees/:id/sales - Create sale
- POST /api/v1/employees/:id/receipts - Add receipt

### Analytics
- GET /api/v1/analytics/daily-turnover - Daily turnover
- GET /api/v1/analytics/monthly-turnover - Monthly turnover
- GET /api/v1/analytics/profit - Profit calculation

## Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=3001
DB_HOST=mysql
DB_PORT=3306
DB_NAME=easygestion
DB_USER=root
DB_PASSWORD=password
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
```

## Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Database
The MySQL database is automatically set up with Docker Compose.

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

1. Build and push Docker images
2. Deploy to your preferred cloud platform
3. Set up production environment variables
4. Configure database backups

## Security

- JWT authentication with secure cookies
- Password hashing with bcrypt
- Rate limiting and CSRF protection
- Input validation and sanitization
- HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
