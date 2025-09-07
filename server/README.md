# Mowana Spa Backend API

A comprehensive backend API for the Mowana Spa website, built with Node.js, Express, and MongoDB.

## Features

### 🔐 Authentication & User Management
- User registration and login
- JWT-based authentication
- Password reset functionality
- User profile management
- Role-based access control (Customer, Admin, Therapist, Manager)

### 📞 Contact Management
- Contact form submission
- Admin dashboard for managing inquiries
- Email notifications and auto-replies
- Inquiry categorization and priority levels
- Response tracking

### 📧 Newsletter System
- Email subscription management
- Preference-based targeting
- Unsubscribe functionality
- Newsletter sending capabilities
- Subscription analytics

### 🛡️ Security Features
- Helmet.js for security headers
- Rate limiting
- CORS configuration
- Input validation
- SQL injection protection
- XSS protection

### 📊 Additional Features
- Comprehensive error handling
- Request logging
- Health check endpoints
- Environment-based configuration
- Email templates
- Data validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express-validator
- **Logging**: Morgan

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mowana-spa-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/mowana-spa
   
   # Server
   PORT=3000
   NODE_ENV=development
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # Email (Gmail example)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@mowanaspa.co.za
   
   # CORS
   CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Forgot password

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contacts (Admin)
- `GET /api/contact/:id` - Get single contact (Admin)
- `PUT /api/contact/:id/status` - Update contact status (Admin)
- `POST /api/contact/:id/respond` - Respond to contact (Admin)
- `GET /api/contact/stats` - Get contact statistics (Admin)

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `GET /api/newsletter/unsubscribe/:token` - Unsubscribe
- `GET /api/newsletter/subscribers` - Get all subscribers (Admin)
- `POST /api/newsletter/send` - Send newsletter (Admin)
- `GET /api/newsletter/stats` - Get newsletter statistics (Admin)
- `PUT /api/newsletter/preferences/:token` - Update preferences

### Health Check
- `GET /health` - API health status
- `GET /` - API information

## Database Models

### User
- Personal information (name, email, phone, DOB, gender)
- Address and emergency contact
- Medical information and preferences
- Authentication and role management

### Contact
- Contact form submissions
- Inquiry categorization
- Status tracking and responses
- Admin assignment and priority

### Newsletter
- Email subscriptions
- Preference management
- Unsubscribe tracking
- Email statistics

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to version control
2. **JWT Secrets**: Use strong, unique JWT secrets
3. **Rate Limiting**: Configure appropriate rate limits for your use case
4. **CORS**: Restrict CORS origins to your frontend domains
5. **Email Security**: Use app-specific passwords for email services
6. **Database**: Use MongoDB authentication and network security

## Email Configuration

### Gmail Setup
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use the app password in `EMAIL_PASS`

### Other Email Providers
Update the email configuration in `.env`:
```env
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Code Structure
```
server/
├── config/          # Database configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
├── server.js        # Main server file
└── package.json     # Dependencies
```

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-jwt-secret
EMAIL_HOST=your-production-email-host
CORS_ORIGIN=https://yourdomain.com
```

### Recommended Hosting
- **Backend**: Heroku, DigitalOcean, AWS EC2
- **Database**: MongoDB Atlas
- **Email**: SendGrid, Mailgun, or AWS SES

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@mowanaspa.co.za or create an issue in the repository.
