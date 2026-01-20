# Nextrip.in Backend

A professional Node.js backend for nextrip.in - a travel exploring and tour hosting platform.

## 🚀 Features

- **Modern Architecture**: Built with Node.js, Express.js, and MongoDB Atlas
- **Authentication**: JWT-based authentication with role-based access control
- **Image Storage**: Integrated with Supabase for scalable image storage
- **API Design**: RESTful API with comprehensive endpoints
- **Security**: Helmet, rate limiting, XSS protection, and data sanitization
- **Error Handling**: Comprehensive error handling and logging
- **Database**: Well-structured MongoDB schemas with proper relationships

## 📁 Project Structure

```
├── config/                 # Database and service configurations
│   ├── database.js         # MongoDB connection
│   └── supabase.js        # Supabase storage configuration
├── controllers/           # Route controllers
│   ├── authController.js  # Authentication logic
│   ├── userController.js  # User management
│   ├── tourController.js  # Tour operations
│   ├── countryController.js # Country management
│   ├── bookingController.js # Booking system
│   └── reviewController.js # Review system
├── middleware/           # Custom middleware
│   ├── auth.js          # JWT authentication
│   ├── errorHandler.js  # Error handling
│   └── upload.js        # File upload to Supabase
├── models/              # MongoDB models
│   ├── User.js          # User schema
│   ├── Tour.js          # Tour schema
│   ├── Country.js       # Country schema
│   ├── Booking.js       # Booking schema
│   └── Review.js        # Review schema
├── routes/              # API routes
│   ├── authRoutes.js    # Authentication endpoints
│   ├── userRoutes.js    # User endpoints
│   ├── tourRoutes.js    # Tour endpoints
│   ├── countryRoutes.js # Country endpoints
│   ├── bookingRoutes.js # Booking endpoints
│   └── reviewRoutes.js  # Review endpoints
├── utils/               # Utility functions
│   ├── AppError.js      # Custom error class
│   ├── catchAsync.js    # Async error handler
│   ├── apiFeatures.js   # API filtering, sorting, pagination
│   └── logger.js        # Winston logger
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
└── server.js           # Application entry point
```

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextrip-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   - MongoDB Atlas connection string
   - JWT secret and expiration
   - Supabase credentials
   - Email service configuration

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB Atlas connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `SENDGRID_API_KEY` | SendGrid API key for emails | No |
| `CLIENT_URL` | Frontend URL for CORS | Yes |

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Password reset request
- `PATCH /api/v1/auth/reset-password/:token` - Reset password
- `GET /api/v1/auth/me` - Get current user

### Tours
- `GET /api/v1/tours` - Get all tours
- `GET /api/v1/tours/:id` - Get single tour
- `GET /api/v1/tours/featured` - Get featured tours
- `GET /api/v1/tours/popular` - Get popular tours
- `GET /api/v1/tours/search` - Search tours
- `GET /api/v1/tours/country/:countryId` - Get tours by country

### Countries
- `GET /api/v1/countries` - Get all countries
- `GET /api/v1/countries/:id` - Get single country
- `GET /api/v1/countries/popular` - Get popular countries
- `GET /api/v1/countries/continent/:continent` - Get countries by continent

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/:id` - Get booking
- `PATCH /api/v1/bookings/:id` - Update booking
- `PATCH /api/v1/bookings/:id/cancel` - Cancel booking

### Reviews
- `GET /api/v1/reviews` - Get all reviews
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews/:id` - Get single review
- `PATCH /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review

### Users
- `PATCH /api/v1/users/update-me` - Update current user
- `DELETE /api/v1/users/delete-me` - Deactivate account
- `GET /api/v1/users/my-bookings` - Get user bookings
- `GET /api/v1/users/my-reviews` - Get user reviews

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevent abuse with request limiting
- **CORS Protection**: Cross-origin resource sharing control
- **Helmet**: Security headers
- **XSS Protection**: Cross-site scripting prevention
- **Data Sanitization**: NoSQL injection prevention
- **Input Validation**: Express-validator for data validation

## 🗃 Database Models

### User
- Personal information and preferences
- Authentication data
- Role-based access control (user, guide, admin)
- Email verification and password reset

### Country
- Country information and statistics
- Travel requirements and visa information
- Climate and best time to visit
- Attractions and cultural information

### Tour
- Comprehensive tour details and itineraries
- Pricing and availability management
- Images and multimedia content
- Special moments and highlights

### Booking
- Tourist information and travel details
- Payment tracking and processing
- Cancellation and refund management
- Communication logs

### Review
- Multi-dimensional rating system
- Moderation and verification
- Response system
- Helpful voting and reporting

## 🔧 Development

### Scripts
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests
```

### Code Style
- Use ES6+ syntax
- Follow async/await patterns
- Implement proper error handling
- Use meaningful variable names
- Add comments for complex logic

## 📝 Logging

The application uses Winston for logging:
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console output in development mode

## 🚀 Deployment

1. Set environment variables on your hosting platform
2. Configure MongoDB Atlas whitelist
3. Set up Supabase storage buckets
4. Deploy using your preferred method (Docker, PM2, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

Built with ❤️ for nextrip.in