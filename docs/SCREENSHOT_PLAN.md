# 📸 BugTracker Pro — Screenshot Plan

**Purpose:** Professional GitHub repository documentation  
**Target:** README.md hero section + screenshots table  
**Format:** PNG (high-quality, no compression artifacts)  
**Tool:** Browser DevTools device toolbar or full-screen capture  

---

## 🔧 Setup Before Capturing

1. Start backend: `cd backend && npm run dev` (auto-seeds data)
2. Start frontend: `cd frontend && npm run dev`
3. Login as **Admin**: `siva0225@gmail.com` / `1231231234`
4. Use **Chrome DevTools** → Toggle Device Toolbar for consistent viewport
5. Hide browser bookmarks bar and extensions
6. Clear any toast notifications before capture
7. Ensure **seed data is fully loaded** (120 bugs, 10 projects visible)

---

## 📋 Screenshot Checklist

### 1. Login Page

| Property | Value |
|----------|-------|
| **Filename** | `docs/screenshots/login.png` |
| **Viewport** | 1440 × 900 (Desktop) |
| **Theme** | Light mode |
| **URL** | `/login` |
| **Data Visible** | Empty form with placeholders |
| **Elements to Highlight** | Logo + brand name, email/password fields, "Sign In" button, "Forgot password?" link, "Create account" link, glassmorphic card |
| **Tips** | Do NOT show any error states. Show the clean first-impression state. Ensure the gradient background is visible. |

---

### 2. Dashboard

| Property | Value |
|----------|-------|
| **Filename** | `docs/screenshots/dashboard.png` |
| **Viewport** | 1440 × 900 (Desktop) |
| **Theme** | Light mode |
| **URL** | `/dashboard` |
| **Data Visible** | All 7 stat cards with non-zero values, at least 2 charts rendered with data, Recent Activity showing 5+ entries |
| **Elements to Highlight** | KPI stat cards (Total, Open, Closed, Critical, Major, Minor, Assigned to Me), Status pie chart, Severity bar chart, Monthly trend line chart, Activity timeline |
| **Tips** | Scroll to show the full dashboard without cutting off charts. If monthly trend is empty, ensure seed data spans multiple months. |

---

### 3. Projects

| Property | Value |
|----------|-------|
| **Filename** | `docs/screenshots/projects.png` |
| **Viewport** | 1440 × 900 (Desktop) |
| **Theme** | Light mode |
| **URL** | `/projects` |
| **Data Visible** | At least 6 project cards visible in grid, status badges (Active, Planning, On Hold), member counts, module counts |
| **Elements to Highlight** | "New Project" button, project key badge (ECOM, MBANK, HMS), status pills, edit/delete icons in card footer, date ranges |
| **Tips** | Show the 3-column grid layout. Ensure at least one project shows "Planning" status and one shows "On Hold" for variety. |

---

### 4. Bug List

| Property | Value |
|----------|-------|
| **Filename** | `docs/screenshots/bugs.png` |
| **Viewport** | 1440 × 900 (Desktop) |
| **Theme** | Light mode |
| **URL** | `/bugs` |
| **Data Visible** | Table with 8-10 rows, pagination showing "1–10 of 120", at least 3 different status badges, mix of priorities |
| **Elements to Highlight** | "Report Bug" button, search input, filter button with count badge, sortable column headers with arrow icons, Bug ID column (ECOM-0001), status/priority/severity badges, assignee avatars, pagination controls |
| **Tips** | Expand the filter panel (click "Filters") to show dropdowns in a second screenshot variant (`bugs-filtered.png`). |

---

### 5. Bug Detail

| Property | Value |
|----------|-------|
| **Filename** | `docs/screenshots/bug-detail.png` |
| **Viewport** | 1440 × 900 (Desktop) |
| **Theme** | Light mode |
| **URL** | `/bugs/:id` (pick a bug with comments and history) |
| **Data Visible** | Bug ID badge, title, status badge, description text, steps to reproduce, expected/actual result, workflow status buttons, 3+ comments visible, sidebar with details |
| **Elements to Highlight** | Bug ID (e.g., ECOM-0003), Edit/Delete buttons, workflow button row with active status highlighted, comments tab with multi-line comment input, character counter, sidebar showing priority/severity/environment/reporter/assignee |
| **Tips** | Choose a bug with status "in_progress" so the workflow button highlighting is visible. Ensure at least 3 comments are visible below. |

---

### 6. Bug Detail — Activity Tab

| Property | Value |
|----------|-------|
| **Filename** | `docs/screenshots/bug-activity.png` |
| **Viewport** | 1440 × 900 (Desktop) |
| **Theme** | Light mode |
| **URL** | `/bugs/:id` (Activity tab selected) |
| **Data Visible** | Activity timeline with 8+ entries, emoji icons, timestamps, status change details |
| **Elements to Highlight** | Tab bar with "History" tab active, vertical timeline line, event icons (🐛, 🔄, 👤, ✏️), actor names, relative timestamps |
| **Tips** | Choose the same bug as screenshot #5 for consistency. Click the "History" tab before capturing. |

---

### 7. Create Bug

| Property | Value |
|----------|-------|
| **Filename** | `docs/screenshots/create-bug.png` |
| **Viewport** | 1440 × 900 (Desktop) |
| **Theme** | Light mode |
| **URL** | `/bugs/new` |
| **Data Visible** | Full form with all fields visible (may need to scroll), project dropdown populated, priority/severity selectors |
| **Elements to Highlight** | Title/description fields, project + module dropdowns, priority/severity selects, environment/browser/OS row, "Assign To" dropdown with real user names, steps to reproduce textarea, screenshot upload area |
| **Tips** | Fill in sample data before capturing to show the form "in use": Title: "Payment timeout on checkout", Project: "E-Commerce Platform". |

---

### 8. Reports

| Property | Value |
|----------|-------|
| **Filename** | `docs/screenshots/reports.png` |
| **Viewport** | 1440 × 900 (Desktop) |
| **Theme** | Light mode |
| **URL** | `/reports` |
| **Data Visible** | Filter panel with dropdowns, 3 export cards (CSV, Excel, PDF) |
| **Elements to Highlight** | Filter section (project, status, priority, severity dropdowns), "1 active" filter badge, export card icons, "Download" buttons |
| **Tips** | Select one filter (e.g., Project: "E-Commerce Platform") before capturing so the "1 active" badge is visible. |

---

### 9. Team

| Property | Value |
|----------|-------|
| **Filename** | `docs/screenshots/team.png` |
| **Viewport** | 1440 × 900 (Desktop) |
| **Theme** | Light mode |
| **URL** | `/team` |
| **Data Visible** | Grid of 9-12 team member cards with role gradients, email addresses, department labels |
| **Elements to Highlight** | Color-coded role avatars (red=admin, purple=manager, blue=developer, green=QA), member names, email truncation, department text |
| **Tips** | Show the 3-column grid with enough cards to demonstrate variety of roles. |

---

### 10. Profile

| Property | Value |
|----------|-------|
| **Filename** | `docs/screenshots/profile.png` |
| **Viewport** | 1440 × 900 (Desktop) |
| **Theme** | Light mode |
| **URL** | `/profile` |
| **Data Visible** | Profile header card (avatar initials, name, email, role), tab buttons (Edit Profile / Change Password), edit form with fields filled |
| **Elements to Highlight** | Avatar with camera upload icon, role badge, tab switcher, form fields (first name, last name, phone, department), "Save Changes" button |
| **Tips** | Keep the "Edit Profile" tab active. Ensure form shows actual seeded user data. |

---

### 11. Settings (Dark Mode)

| Property | Value |
|----------|-------|
| **Filename** | `docs/screenshots/settings-dark.png` |
| **Viewport** | 1440 × 900 (Desktop) |
| **Theme** | **Dark mode** |
| **URL** | `/settings` |
| **Data Visible** | Appearance section with Dark Mode card highlighted/selected, About section |
| **Elements to Highlight** | Dark mode card with active border ring, light/dark toggle UI, app version info |
| **Tips** | Enable dark mode FIRST, then navigate to Settings so the card shows "Dark Mode" as selected with the primary border. |

---

### 12. Dashboard — Dark Mode

| Property | Value |
|----------|-------|
| **Filename** | `docs/screenshots/dashboard-dark.png` |
| **Viewport** | 1440 × 900 (Desktop) |
| **Theme** | **Dark mode** |
| **URL** | `/dashboard` |
| **Data Visible** | Same as screenshot #2 but in dark theme |
| **Elements to Highlight** | Dark glassmorphic cards, chart dark backgrounds, sidebar dark variant, header dark variant |
| **Tips** | This demonstrates the full dark mode implementation. Capture immediately after screenshot #11. |

---

### 13. Mobile — Bug List

| Property | Value |
|----------|-------|
| **Filename** | `docs/screenshots/mobile-bugs.png` |
| **Viewport** | 390 × 844 (iPhone 14 Pro) |
| **Theme** | Light mode |
| **URL** | `/bugs` |
| **Data Visible** | Mobile table view or card layout, search bar, "Report Bug" button |
| **Elements to Highlight** | Responsive layout adaptation, hamburger menu icon, compact table, touch-friendly button sizing |
| **Tips** | Use Chrome DevTools → iPhone 14 Pro preset. Ensure the sidebar is collapsed (hamburger visible). |

---

### 14. Mobile — Sidebar Open

| Property | Value |
|----------|-------|
| **Filename** | `docs/screenshots/mobile-sidebar.png` |
| **Viewport** | 390 × 844 (iPhone 14 Pro) |
| **Theme** | Light mode |
| **URL** | Any page |
| **Data Visible** | Sidebar overlay with navigation links, user info at bottom, backdrop overlay |
| **Elements to Highlight** | Slide-in sidebar, navigation items with icons, close button, backdrop blur, user avatar/role at bottom |
| **Tips** | Tap the hamburger menu to open the sidebar, then capture. |

---

### 15. Mobile — Dashboard

| Property | Value |
|----------|-------|
| **Filename** | `docs/screenshots/mobile-dashboard.png` |
| **Viewport** | 390 × 844 (iPhone 14 Pro) |
| **Theme** | Light mode |
| **URL** | `/dashboard` |
| **Data Visible** | Stacked stat cards (2-column grid on mobile), charts below |
| **Elements to Highlight** | Responsive grid collapse from 7-col to 2-col, chart responsiveness |
| **Tips** | Scroll down slightly to show both stat cards and at least one chart. |

---

## 📁 File Organization

```
bugtracker-pro/
└── docs/
    └── screenshots/
        ├── login.png
        ├── dashboard.png
        ├── dashboard-dark.png
        ├── projects.png
        ├── bugs.png
        ├── bugs-filtered.png (optional)
        ├── bug-detail.png
        ├── bug-activity.png
        ├── create-bug.png
        ├── reports.png
        ├── team.png
        ├── profile.png
        ├── settings-dark.png
        ├── mobile-bugs.png
        ├── mobile-sidebar.png
        └── mobile-dashboard.png
```

---

## ✅ Pre-Capture Checklist

- [ ] Backend running with seed data (120 bugs visible)
- [ ] Logged in as Admin (`siva0225@gmail.com`)
- [ ] Browser zoom set to 100%
- [ ] No browser extensions visible
- [ ] No toast notifications on screen
- [ ] DevTools closed (unless using device toolbar)
- [ ] Font rendering consistent (Inter loaded)
- [ ] No console errors in background

---

## 🎯 README Usage

After capturing, update `README.md` screenshot table:

```markdown
<table>
  <tr>
    <td><img src="docs/screenshots/login.png" width="400"/></td>
    <td><img src="docs/screenshots/dashboard.png" width="400"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/bugs.png" width="400"/></td>
    <td><img src="docs/screenshots/bug-detail.png" width="400"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/projects.png" width="400"/></td>
    <td><img src="docs/screenshots/dashboard-dark.png" width="400"/></td>
  </tr>
</table>
```

---

*Total: 15 screenshots covering every major module, dark mode, and mobile responsiveness.*
