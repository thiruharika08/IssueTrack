# Contributing to BugTracker Pro

Thank you for your interest in contributing! This document provides guidelines for contributing to BugTracker Pro.

## 🚀 Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/yourusername/bugtracker-pro.git`
3. **Install** dependencies: `cd backend && npm install && cd ../frontend && npm install`
4. **Start** development: Run backend and frontend as described in the README
5. **Create** a feature branch: `git checkout -b feature/your-feature-name`

## 📏 Development Guidelines

### Code Style

- Use **ES6+** syntax (arrow functions, destructuring, template literals)
- Follow existing naming conventions (camelCase for variables, PascalCase for components)
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Add JSDoc comments for service methods

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add email notification on bug assignment
fix: resolve cart total not updating after item removal
docs: update API endpoint documentation
style: fix alignment in dashboard stat cards
refactor: extract bug filter logic into custom hook
test: add unit tests for auth service
chore: update dependencies
```

### Branch Naming

```
feature/add-kanban-board
fix/login-rate-limit-bypass
docs/update-deployment-guide
refactor/extract-bug-service
```

## 🐛 Reporting Issues

Before opening an issue:

1. Search existing issues to avoid duplicates
2. Use the issue template
3. Include reproduction steps
4. Specify browser, OS, and Node.js version

## 🔀 Pull Request Process

1. Update documentation if your change affects the API or UI
2. Ensure `npm run build` passes without errors in both frontend and backend
3. Test your changes manually (login, create bug, navigate pages)
4. Fill out the pull request template completely
5. Request review from at least one maintainer

## 📂 Project Structure

- `backend/` — Express.js API (modify routes, controllers, services, models here)
- `frontend/src/pages/` — Page components (one file per route)
- `frontend/src/components/` — Reusable UI components
- `frontend/src/services/` — API client layer
- `frontend/src/context/` — React context providers

## 🧪 Testing Changes

Currently the project uses manual verification. Before submitting a PR, verify:

- [ ] Login/logout works
- [ ] Bug CRUD operations work
- [ ] No console errors in browser
- [ ] Backend starts without errors
- [ ] Frontend builds without errors (`npm run build`)

## ⚠️ What NOT to Change

- Do not modify seed data structure without updating all seed files
- Do not change the MongoDB schema without a migration strategy
- Do not remove existing API endpoints (backward compatibility)
- Do not commit `.env` files or secrets

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
