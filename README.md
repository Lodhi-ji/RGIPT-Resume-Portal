# RGIPT Resume Portal

A comprehensive web application for managing student profiles and generating professional resumes for Rajiv Gandhi Institute of Petroleum Technology (RGIPT).

## Features

### For Students
- **Profile Management**: Create and update comprehensive profiles with education, projects, internships, skills, certifications, and more
- **Resume Builder**: Generate multiple resume versions with customizable templates
- **Live Preview**: Real-time preview of resume changes
- **Template Selection**: Choose from 4 professional templates including RGIPT LaTeX template
- **Section Customization**: Enable/disable sections and select specific items to include
- **PDF Generation**: Download resumes as PDF files
- **Password Management**: Secure password change functionality

### For Administrators
- **Student Management**: View and manage all student profiles
- **Bulk Upload**: Import student data via Excel/CSV files
- **Resume Access**: View and download all student resumes
- **Student Details**: Access detailed student information including contact details and academic records

## Tech Stack

### Frontend
- React 19.2.0
- React Router DOM 7.13.1
- Axios for API calls
- Vite for build tooling
- CSS3 for styling

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Puppeteer for PDF generation
- Multer for file uploads
- XLSX for Excel file processing
- bcryptjs for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn package manager

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode

1. Start the backend server:
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173` (or another available port)

### Seed Demo Data

To populate the database with demo users:
```bash
cd backend
npm run seed
```

This creates:
- 3 demo students with complete profiles
- 1 admin account

## Demo Credentials

### Students
1. **Priya Sharma**
   - Email: `priya.sharma@rgipt.ac.in`
   - Password: `21CS001@College123`

2. **Anshika Verma**
   - Email: `anshika.verma@rgipt.ac.in`
   - Password: `ECHE19069@College123`

3. **Ritik Lodhi**
   - Email: `ritik.lodhi@rgipt.ac.in`
   - Password: `23CD3054@College123`

### Admin
- Email: `admin@rgipt.ac.in`
- Password: `admin123`

## Project Structure

```
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication & error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts (seed data)
│   ├── services/        # Business logic (PDF, Excel, templates)
│   ├── templates/       # HTML resume templates
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── admin/   # Admin-specific components
│   │   │   ├── student/ # Student-specific components
│   │   │   └── common/  # Shared components
│   │   ├── context/     # React context (Auth)
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   ├── styles/      # CSS files
│   │   └── utils/       # Helper functions
│   └── index.html       # Entry HTML
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password

### Student Profile
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile

### Resume Versions
- `GET /api/resume-versions` - Get all resume versions
- `POST /api/resume-versions` - Create new resume
- `PUT /api/resume-versions/:id` - Update resume
- `DELETE /api/resume-versions/:id` - Delete resume
- `GET /api/resume-versions/:id/preview` - Get HTML preview
- `GET /api/resume-versions/:id/generate` - Generate PDF

### Admin
- `GET /api/admin/students` - Get all students
- `GET /api/admin/students/:id` - Get student details
- `POST /api/admin/upload-excel` - Bulk upload students
- `GET /api/admin/students/:id/resumes` - Get student resumes

## Resume Templates

1. **Template 1 - Modern**: Clean, modern design with clear sections
2. **Template 2 - Sidebar**: Two-column layout with sidebar
3. **Template 3 - Minimal**: Minimalist design focusing on content
4. **Template 4 - LaTeX (RGIPT)**: Official RGIPT template with college branding

## Features in Detail

### Profile Management
Students can manage:
- Personal information (name, email, phone, address)
- Education details (degree, branch, CGPA, year)
- Multiple projects with descriptions and technologies
- Internship experiences
- Technical and soft skills
- Achievements and awards
- Certifications
- Publications
- Positions of responsibility
- Relevant courses
- Social links (LinkedIn, GitHub, portfolio, etc.)

### Resume Builder
- Select which sections to include
- Choose specific projects, internships, certifications to display
- Real-time preview with auto-save
- Download as PDF
- Create multiple resume versions for different purposes

### Admin Panel
- View all registered students
- Access detailed student information
- View and download student resumes
- Bulk upload student data via Excel
- Manage student accounts

## Excel Upload Format

For bulk student upload, use the following columns:
- Name
- Email
- Enrollment Number
- Branch
- Year
- Phone (optional)
- CGPA (optional)

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes with middleware
- Role-based access control (Student/Admin)
- CORS configuration
- Input validation

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in environment variables
2. Configure MongoDB Atlas connection
3. Set secure JWT secret
4. Configure CORS for production frontend URL
5. For Puppeteer on Linux servers, set `PUPPETEER_EXECUTABLE_PATH`

### Frontend
1. Update `VITE_API_URL` to production backend URL
2. Build the application:
```bash
npm run build
```
3. Deploy the `dist` folder to hosting service

## Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Ensure port 5000 is not in use
- Verify all environment variables are set

### Frontend can't connect to backend
- Check CORS configuration in backend
- Verify API URL in frontend `.env`
- Ensure backend is running

### PDF generation fails
- Install Chromium/Chrome on server
- Set `PUPPETEER_EXECUTABLE_PATH` for production
- Check Puppeteer dependencies

### Login issues
- Verify credentials are correct
- Check JWT secret is set
- Ensure MongoDB is connected
- Check browser console for CORS errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please create an issue in the repository or contact the development team.

---

**Developed for Rajiv Gandhi Institute of Petroleum Technology (RGIPT)**
