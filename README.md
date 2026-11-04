# IssueTrack – Issue Tracking & Project Management System

IssueTrack is a full-stack web application designed to help development teams manage, track, and monitor software issues throughout their development lifecycle.

It provides a centralized platform for reporting issues, managing priorities, tracking progress, collaborating through comments, and monitoring project activities.

## Features

- **Dashboard:** View issue statistics, status distribution, and monthly issue trends.
- **Issue Management:** Create, view, search, edit, and delete issues.
- **Priority & Severity:** Categorize issues based on their importance and impact.
- **Status Tracking:** Monitor issue progress through status updates.
- **Comments:** Collaborate and discuss issues with team members.
- **Project Management:** Create and manage projects.
- **Reports:** Export issue reports in CSV, Excel, and PDF formats.
- **Team Management:** View team members and their roles.
- **User Authentication:** Register, log in, and manage user profiles.
- **Theme Customization:** Switch between light and dark modes.

## Technology Stack

**Frontend**
- React.js
- Vite
- Tailwind CSS
- JavaScript
- Framer Motion
- React Router

**Backend**
- Node.js
- Express.js
- REST APIs

**Database**
- MongoDB

**Tools**
- Git and GitHub
- VS Code
- npm

## Project Structure

```text
IssueTrack/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       └── services/
│
├── docs/
├── README.md
└── package-lock.json
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/thiruharika08/IssueTrack.git
cd IssueTrack
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

Configure your backend environment variables using the provided `.env.example` file.

### 3. Start the backend

Use the development command configured in `backend/package.json`.

### 4. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

Configure frontend environment variables using `frontend/.env.example`.

### 5. Start the frontend

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

Make sure MongoDB is running and the backend is configured before using the application.

## Screenshots

Add screenshots of the customized application here.

Recommended screenshots:
- Dashboard
- Issue Management
- Issue Details
- Projects
- Reports
- Team Management

## Customizations

This repository is a customized version of an existing open-source project.

My contributions include:
- Rebranding the application as IssueTrack.
- Updating user-facing terminology from bugs to issues.
- Customizing dashboard and issue management labels.
- Updating login and registration branding.
- Improving consistency across application pages.

## Future Enhancements

- Advanced issue analytics.
- Email notifications.
- Enhanced role-based permissions.
- Real-time collaboration.

## Original Project Attribution

This project is based on the open-source **BugTracker-Pro** repository:

https://github.com/sivaprakashtech/BugTracker-Pro

The original project's license and attribution are retained.

## Author

**Thiru Harika Itta**

GitHub: https://github.com/thiruharika08

---

If you find this project useful, consider giving the repository a star!
ables

BugTracker Pro uses environment variables to configure the backend server, database connection, authentication, and frontend API endpoint.

---

## 🖥️ Backend Configuration

Create a `.env` file inside the **backend** directory.

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bugtracker-pro
JWT_SECRET=your_secret_key_minimum_32_characters
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

## 🌐 Frontend Configuration

Create a `.env` file inside the **frontend** directory.

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 💡 Development Notes

- MongoDB installation is optional during local development.
- If no MongoDB instance is detected, the application automatically starts with an in-memory database.
- Environment variables can be customized for production deployments.

---

# 👤 Demo Credentials

The application comes with pre-configured demo accounts for testing different user roles.

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | `siva0225@gmail.com` | `1231231234` |
| 📋 Manager | `rachel.thompson@bugtracker.pro` | `1231231234` |
| 📋 Manager | `david.martinez@bugtracker.pro` | `1231231234` |
| 💻 Developer | `alexander.petrov@bugtracker.pro` | `1231231234` |
| 🧪 QA Engineer | `priya.sharma@bugtracker.pro` | `1231231234` |

> **Note:** All seeded demo accounts use the same password for development purposes.

# 📡 API Overview

BugTracker Pro exposes a RESTful API for authentication, project management, bug tracking, reporting, and team collaboration.

All protected endpoints require a valid JWT access token.

---

## 🔐 Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Authenticate and receive JWT | Public |
| GET | `/api/auth/profile` | Retrieve logged-in user profile | Protected |
| PUT | `/api/auth/profile` | Update profile information | Protected |
| PUT | `/api/auth/change-password` | Change account password | Protected |
| GET | `/api/auth/users` | Retrieve all users | Protected |
| PUT | `/api/auth/users/:id/role` | Update user role | Admin |

---

## 🐞 Bug Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/bugs` | List all bugs | Protected |
| GET | `/api/bugs/dashboard` | Dashboard statistics | Protected |
| GET | `/api/bugs/:id` | Get bug details | Protected |
| GET | `/api/bugs/:id/activity` | View activity timeline | Protected |
| POST | `/api/bugs` | Create a new bug | Protected |
| PUT | `/api/bugs/:id` | Update bug details | Protected |
| PATCH | `/api/bugs/:id/status` | Update bug status | Protected |
| DELETE | `/api/bugs/:id` | Delete a bug | Admin / Manager |
| DELETE | `/api/bugs/:id/screenshots/:sid` | Remove screenshot | Protected |

---

## 📁 Project Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/projects` | Retrieve all projects | Protected |
| POST | `/api/projects` | Create a project | Protected |
| PUT | `/api/projects/:id` | Update project details | Protected |
| DELETE | `/api/projects/:id` | Delete a project | Admin / Manager |

---

## 💬 Comments

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/comments/:bugId` | Fetch comments for a bug | Protected |
| POST | `/api/comments/:bugId` | Add a new comment | Protected |
| PUT | `/api/comments/:id` | Edit a comment | Author |
| DELETE | `/api/comments/:id` | Delete a comment | Author / Admin |

---

## 📊 Reports

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/reports/csv` | Export report as CSV | Protected |
| GET | `/api/reports/excel` | Export report as Excel | Protected |
| GET | `/api/reports/pdf` | Export report as PDF | Protected |

---

## 🔒 Authentication Flow

```text
Login
   │
   ▼
JWT Token Generated
   │
   ▼
Token Stored
   │
   ▼
Authorization Header
   │
   ▼
Protected API Access
```

---

## 💡 API Highlights

- RESTful API architecture
- JWT-based authentication
- Role-based authorization
- Consistent JSON responses
- Secure protected endpoints
- Modular route organization
- Easy integration with frontend applications

# 🔒 Security & Performance

BugTracker Pro is built with security, reliability, and performance in mind. The application follows modern backend practices to protect user data, secure API access, and deliver a smooth user experience.

---

# 🛡️ Security Features

| Feature | Description |
|---------|-------------|
| 🔐 Password Security | Passwords are securely hashed using **bcryptjs** with 12 salt rounds. |
| 🎫 JWT Authentication | Secure token-based authentication with configurable expiration. |
| 🚦 Rate Limiting | Protects authentication endpoints against brute-force attacks. |
| 🪖 HTTP Security Headers | Powered by **Helmet** to improve application security. |
| 🌐 CORS Protection | Restricts unauthorized cross-origin requests. |
| ✅ Input Validation | Server-side validation for all incoming requests. |
| 👥 Role-Based Authorization | API access is restricted based on user roles. |
| 🛑 Injection Protection | Whitelisted sorting and validated query parameters. |
| 📄 Secure File Upload | File type and size validation before upload. |
| 🔒 Data Integrity | Protected project deletion and atomic database operations. |

---

# ⚡ Performance Optimizations

Performance has been optimized to provide a responsive experience even with large datasets.

| Optimization | Benefit |
|-------------|---------|
| ⚡ React Lazy Loading | Loads pages only when required. |
| 📦 Code Splitting | Smaller JavaScript bundles for faster loading. |
| 🗜️ Gzip Compression | Reduces API response sizes. |
| 💾 Browser Caching | Improves loading performance for static assets. |
| 🔄 API Retry Strategy | Automatically retries failed GET requests. |
| ⏱️ Debounced Search | Minimizes unnecessary API calls while searching. |
| 💀 Skeleton Loaders | Improves perceived loading speed. |
| 🚀 Optimized Build | Vite generates highly optimized production assets. |

---

# 📊 Reliability Highlights

- 🔒 Secure authentication flow
- 🚀 Optimized API performance
- 📦 Modular backend architecture
- ⚡ Fast frontend rendering
- 💾 Efficient database access
- 📱 Responsive across all devices
- 🛡️ Production-ready security practices

---

# 🎯 Why It Matters

BugTracker Pro is designed to simulate how enterprise applications balance security, performance, and maintainability. These optimizations help deliver a fast, reliable, and scalable experience for both developers and QA teams.

# 🧪 Quality Assurance

BugTracker Pro was developed with a structured quality assurance workflow to ensure reliability, security, and a consistent user experience throughout the application.

---

## ✅ QA Overview

The project includes a dedicated QA audit report covering functionality, security, validation, usability, and performance.

### QA Coverage

| Category | Status |
|----------|:------:|
| 🔴 Critical Issues | ✅ Resolved |
| 🟠 High Priority | ✅ Resolved |
| 🟡 Medium Priority | ⚠️ Mostly Resolved |
| 🔵 Low Priority | 📋 Scheduled for Future Improvements |

---

## ✔ QA Validation Includes

- Functional Testing
- Authentication Testing
- Role-Based Access Verification
- API Validation
- Form Validation
- Error Handling
- File Upload Testing
- UI & Responsive Testing
- Dashboard Verification
- Report Export Validation

---

## 📄 QA Documentation

A complete QA audit is available inside the project documentation.

```text
docs/
└── QA_AUDIT_REPORT.md
```

The report documents identified issues, applied fixes, validation results, and recommendations for future improvements.

---

# 🚀 Deployment

BugTracker Pro can be deployed using modern cloud platforms with minimal configuration.

---

## 🌐 Frontend Deployment

Recommended Platform

- Vercel

```bash
cd frontend
npm run build
```

Deploy the generated **dist/** folder.

---

## ⚙ Backend Deployment

Recommended Platform

- Render

Configuration:

- Build Command

```bash
npm install
```

- Start Command

```bash
node server.js
```

Configure the required environment variables from the Render dashboard before deployment.

---

## 🗄 Database Deployment

Recommended Platform

- MongoDB Atlas

Deployment Steps

1. Create a free cluster.
2. Copy the MongoDB connection string.
3. Update the `MONGO_URI` environment variable.
4. Restart the backend server.

---

## 📦 Production Checklist

Before deploying, verify the following:

- ✅ Environment variables configured
- ✅ Production database connected
- ✅ JWT secret updated
- ✅ Build completed successfully
- ✅ API endpoints verified
- ✅ CORS configured correctly
- ✅ File uploads tested

---

## 🎯 Deployment Highlights

- Frontend optimized with Vite
- Secure Express backend
- MongoDB Atlas compatible
- Ready for cloud deployment
- Production-ready architecture

# 🔮 Future Roadmap

BugTracker Pro will continue to evolve with new features, better collaboration tools, and enhanced developer productivity.

---

## 🚀 Planned Features

- [ ] Real-time notifications using WebSockets
- [ ] Drag-and-drop Kanban board
- [ ] Email notifications
- [ ] GitHub & GitLab integration
- [ ] Sprint planning module
- [ ] Time tracking
- [ ] AI-powered bug classification
- [ ] End-to-end automation testing
- [ ] Docker support
- [ ] CI/CD with GitHub Actions

---

## 🎯 Long-Term Vision

The goal of BugTracker Pro is to become a complete bug tracking and QA management platform that demonstrates enterprise-grade software engineering practices while remaining easy to learn and extend.

Future releases will focus on:

- Better collaboration
- Performance improvements
- Advanced reporting
- AI-assisted workflows
- Cloud-native deployment
- Accessibility enhancements

---

# 🤝 Contributing

Contributions are always welcome.

If you'd like to improve BugTracker Pro:

1. Fork this repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Commit your changes.

```bash
git commit -m "feat: add your feature"
```

4. Push your branch.

```bash
git push origin feature/your-feature
```

5. Open a Pull Request.

---

## 📋 Contribution Guidelines

Before submitting a Pull Request, please ensure:

- Code follows the existing project structure.
- New features include appropriate documentation.
- Existing functionality is not affected.
- Commit messages are meaningful.
- Code has been tested before submission.

---

# 📄 License

BugTracker Pro is licensed under the **MIT License**.

You are free to use, modify, distribute, and build upon this project in accordance with the terms of the license.

See the **LICENSE** file for complete details.

---

# 👨‍💻 Author

### Siva Prakash P

QA Engineer • Full Stack Developer • Open Source Enthusiast

Passionate about building scalable web applications, enterprise dashboards, testing platforms, and developer productivity tools.

---

## 🌐 Connect

- 💼 GitHub: https://github.com/sivaprakashtech
- 📧 Email: siva0225@gmail.com

---

# ❤️ Acknowledgements

Special thanks to the amazing open-source community behind:

- React
- Node.js
- Express.js
- MongoDB
- Tailwind CSS
- Vite
- Framer Motion
- Recharts

Their contributions make projects like BugTracker Pro possible.

---

<div align="center">

## ⭐ Support the Project

If you found this project helpful,

⭐ Star the repository

🍴 Fork the project

💡 Share your feedback

🤝 Contribute new ideas

Every contribution helps BugTracker Pro grow.

---

### 🚀 Track • Manage • Resolve • Deliver

Built with ❤️ by **Siva Prakash P**

</div>
