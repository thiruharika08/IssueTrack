# Changelog

All notable changes to BugTracker Pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-23

### Added

- **Authentication:** JWT-based login/register with bcrypt password hashing
- **Authorization:** Role-based access control (Admin, Manager, Developer, QA Engineer)
- **Dashboard:** Real-time analytics with 7 KPI cards and 4 interactive charts
- **Bug Management:** Full CRUD with 120 seeded realistic bugs across 10 projects
- **Bug Lifecycle:** Open → Assigned → In Progress → Resolved → Testing → Closed workflow
- **Auto-generated Bug IDs:** Atomic counter per project (e.g., ECOM-0001)
- **Comments:** Multi-line comment system with edit/delete and character counter
- **Activity Timeline:** 8-15 chronological events per bug with actor attribution
- **Projects:** 10 enterprise projects with modules, teams, status, and dates
- **Report Export:** CSV, Excel (.xlsx), and PDF export with filter support
- **File Uploads:** Multi-file screenshot upload with lightbox viewer
- **Search:** Regex-based search across title, description, and bug ID
- **Filters:** Status, priority, severity, project, assignee, date range
- **Sorting:** Whitelist-validated sortable columns with direction toggle
- **Pagination:** Capped at 100 records max per request
- **Dark Mode:** System preference detection with manual toggle
- **Profile:** Avatar upload, edit profile, change password
- **Team:** Read-only directory of all organization members
- **Settings:** Theme selection with persistence
- **Auto-Seed:** Zero-config development startup (mongodb-memory-server)
- **Error Boundary:** React error boundary with recovery UI
- **404 Page:** Custom not-found page with navigation options
- **Code Splitting:** 12 lazy-loaded page chunks via React.lazy
- **API Retry:** Automatic retry with exponential backoff on 5xx errors
- **Skeleton Loaders:** Structured loading states on Bug Detail page
- **Compression:** gzip response compression in production
- **Rate Limiting:** 10 req/15min on auth endpoints (production)

### Security

- Sort field injection prevention (whitelist validation)
- Pagination DoS prevention (limit capped at 100)
- Bug ID race condition eliminated (atomic $inc counter)
- Unassigned filter crash fixed (null query instead of invalid ObjectId)
- Role escalation blocked (registration forced to 'developer')
- Project cascade protection (blocks deletion when bugs exist)
- Forgot password link fixed (no longer navigates to 404)
- Error handler crash fixed (removed dependency on uninstalled `colors` package)

### Infrastructure

- Production deployment guide (Vercel + Render + MongoDB Atlas)
- Professional QA audit report with 34 issues identified, 15 resolved
- Screenshot capture plan for repository documentation
- Comprehensive README with architecture diagrams and API reference
- Seed infrastructure generating 2,100+ realistic records

---

## [Unreleased]

### Planned
- WebSocket real-time notifications
- Drag-and-drop Kanban board
- Email notifications via SendGrid
- Cypress E2E test suite
- Docker containerization
- CI/CD pipeline (GitHub Actions)
