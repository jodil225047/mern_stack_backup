# ApplyPilot — Your Personal Career Command Center

ApplyPilot is a MERN job application tracker presented as **Fieldnote / Career**: an editorial, paper-and-ink career desk inspired by field journals and portfolio workspaces. It uses a warm mineral palette, serif headlines, mono-spaced metadata, a horizontal masthead, an illustrated opportunity map, and a six-lane pipeline board rather than a conventional dark sidebar dashboard. Track applications, follow-ups, status transitions, notes, and career-search analytics. All application records and per-company ID counters are stored in MongoDB Atlas; the frontend does not use mock application records.

## Features

- Dashboard statistics and conversion rates derived from MongoDB records.
- Server-side company search, status filtering, and sorting.
- Create, view, edit, and conditionally delete job applications.
- Atomic, MongoDB-backed per-company IDs (`JA-XXX-001`).
- Server-enforced status workflow and immutable status history timeline.
- Follow-up date automatically set to seven calendar days after the applied date; overdue warnings for applications still in `Applied`.
- Duplicate active application checks and form error feedback.
- Follow-up Radar with overdue emphasis, CSV export, responsive layouts, accessible labels/focus states, loading and error states.
- Switchable six-stage Pipeline Board and compact Ledger view, with per-stage counts and quick record actions.
- Weekly Fieldwork sprint: choose a weekly intention (3, 5, 8, or 10 actions) and log completed career actions. Progress persists in the browser for the current week; it is a personal planning aid, not an application record or backend metric.
- Opportunity Map, conversion insight note, and rotating monthly visual motif for a more portfolio/editorial feel.
- API health endpoint reporting MongoDB connectivity.

## Technology stack

- React 18, Vite, React Router, Axios, Lucide React, Recharts dependency available for future charts, regular CSS.
- Node.js, Express 4, Mongoose, MongoDB Atlas.
- JavaScript (no TypeScript).

## Project structure

```text
applypilot-project/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/ (Sidebar, Topbar, cards, forms, filters, timeline, dialogs, loading, toast)
│   │   ├── pages/ (Dashboard, Applications, ApplicationDetails, NotFound)
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   └── package.json
├── backend/
│   ├── config/db.js
│   ├── controllers/ (applications and analytics)
│   ├── middleware/ (error handler and 404 handler)
│   ├── models/ (Application, Counter)
│   ├── routes/ (applications, analytics)
│   ├── utils/ (ID generation, workflow, response helpers)
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── screenshots/README.md
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- Node.js 20 LTS or newer and npm.
- A MongoDB Atlas cluster and a database user.
- Git and VS Code (recommended).

## MongoDB Atlas setup

1. In MongoDB Atlas, create or choose a cluster and create a database user with read/write access to the database you intend to use.
2. Under **Network Access**, allow your development IP address. Avoid `0.0.0.0/0` unless you deliberately understand and accept the exposure.
3. Select **Connect → Drivers → Node.js** and copy the connection string.
4. Replace the username, password, cluster, and database placeholders as needed. URL-encode special characters in the password.
5. Keep this URI private. Do not put it in frontend variables, source code, screenshots, or Git commits.

## Environment configuration

The archive includes `backend/.env` and `frontend/.env` with dummy values so the expected configuration is visible. The backend URI is intentionally a placeholder and will not connect until you replace it with your own exam/test MongoDB Atlas URI. Never commit personal or production credentials. If you prefer to create the files manually, copy the examples:

**Windows PowerShell:**

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Edit `backend/.env` and set your real URI:

```dotenv
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER/YOUR_DATABASE?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Set `VITE_API_URL` in `frontend/.env` (normally it remains `http://localhost:5000/api`):

```dotenv
VITE_API_URL=http://localhost:5000/api
```

The backend refuses to start if `MONGODB_URI` is missing or Atlas cannot be reached. The `.env` files are ignored by Git. **Do not commit real credentials.**

## Install and run (Windows / VS Code)

1. Extract the ZIP and open the `applypilot-project` folder in VS Code.
2. Confirm Node/npm are installed: `node -v` and `npm -v`.
3. Create and fill both `.env` files as above.
4. Open a terminal at the project root and install dependencies:

```powershell
npm install
npm --prefix backend install
npm --prefix frontend install
```

5. Before starting, replace the dummy `MONGODB_URI` in `backend/.env` with your test MongoDB Atlas connection string. Start both servers from the root:

```powershell
npm run dev
```

Or use two terminals:

```powershell
# Terminal 1
npm --prefix backend run dev

# Terminal 2
npm --prefix frontend run dev
```

6. Open `http://localhost:5173`. The API is at `http://localhost:5000/api`; health check: `http://localhost:5000/api/health`.
7. For a production frontend build: `npm --prefix frontend run build`.

## REST API

All responses use `{ "success": boolean, "message": string, "data": object | array | null }`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Server and MongoDB connection status |
| POST | `/api/applications` | Create an application; starts in Applied |
| GET | `/api/applications` | List; accepts `status`, `company`, `sortBy`, `order` query parameters |
| GET | `/api/applications/:id` | Get by MongoDB document ID or generated application ID |
| PUT | `/api/applications/:id` | Edit whitelisted company, role, jobType, expectedSalary, notes fields |
| PATCH | `/api/applications/:id/status` | Validated status transition |
| DELETE | `/api/applications/:id` | Delete only in permitted statuses |
| GET | `/api/analytics/summary` | Database-derived counts, conversion rates, recent applications, follow-ups |

### Example requests

Create:

```http
POST /api/applications
Content-Type: application/json
```

```json
{
  "company": "Infosys",
  "role": "Frontend Developer",
  "jobType": "Full-time",
  "appliedDate": "2026-10-20",
  "expectedSalary": 85000,
  "notes": "Recruiter referral"
}
```

The server generates `applicationId`, `status`, `statusHistory`, and `followUpDate`; clients cannot set these fields. Example response shape:

```json
{
  "success": true,
  "message": "Application created successfully.",
  "data": {
    "applicationId": "JA-INF-001",
    "company": "Infosys",
    "role": "Frontend Developer",
    "status": "Applied",
    "followUpDate": "2026-10-27T00:00:00.000Z",
    "isOverdue": false,
    "statusHistory": [{ "status": "Applied", "changedAt": "2026-10-20T00:00:00.000Z" }]
  }
}
```

The timestamps above illustrate the response shape; actual timestamps are generated by the server and date values depend on the submitted record.

Change status:

```http
PATCH /api/applications/65a000000000000000000000/status
Content-Type: application/json
```

```json
{ "status": "Interview" }
```

Example error:

```json
{
  "success": false,
  "message": "An active application already exists for this company and role.",
  "data": null
}
```

## Business rules

### Application IDs

- Format: `JA-<THREE-CHARACTER-COMPANY-PREFIX>-<THREE-DIGIT-SEQUENCE>`.
- Prefix is derived from the first three alphanumeric characters of the company name, uppercased and padded with `X` if necessary (e.g. `A` → `AXX`).
- Counter keys use a trimmed, case-insensitive, whitespace-normalized company name. Each normalized company has an independent counter.
- `findOneAndUpdate` with `$inc` increments the MongoDB counter atomically. Deleting an application does not reuse its ID. If a counter exceeds 999, the sequence expands beyond three digits rather than wrapping.

### Status workflow

- `Applied → Interview` or `Rejected`
- `Interview → Offer` or `Rejected`
- `Offer → Accepted` or `Declined`
- `Rejected`, `Accepted`, and `Declined` are final.

Every successful transition is validated on the backend and appended to `statusHistory` with a server-generated timestamp. The standard edit endpoint cannot change status or history.

### Duplicate detection

Company names and roles are compared case-insensitively after trimming whitespace. Creating or editing into a matching company/role is rejected with HTTP 409 if another matching record is not in a final state. Records in `Rejected`, `Accepted`, or `Declined` do not block a new attempt. The check is application-level and can race when truly concurrent requests create the same pair; this implementation does not claim a database-enforced compound uniqueness guarantee.

### Follow-ups and overdue policy

- `followUpDate` is computed server-side as `appliedDate + 7 calendar days` using UTC date arithmetic.
- An application is overdue only when its status is still `Applied` and the current UTC calendar date is later than the follow-up UTC calendar date. It is not marked overdue on the follow-up date itself.
- Follow-up date is not editable and client-supplied values are ignored.

### Editing and deleting

- Editable: company, role, job type, expected salary, notes.
- Immutable after creation: application ID and applied date. Status, follow-up date, and status history can only be changed by their designated backend logic.
- Delete is allowed only in `Applied`, `Rejected`, `Accepted`, and `Declined`. `Interview` and `Offer` records cannot be deleted. Both the frontend and backend enforce this rule.

### Analytics formulas

- Interview conversion = applications whose current status is `Interview`, `Offer`, `Accepted`, or `Declined` ÷ all applications × 100.
- Offer conversion = applications whose current status is `Offer`, `Accepted`, or `Declined` ÷ all applications × 100.
- Offer acceptance = `Accepted` ÷ applications currently in `Offer`, `Accepted`, or `Declined` × 100.
- Rates are rounded to whole percentages and return 0 when the denominator is zero. Because they use current status, these are pipeline conversion proxies, not a historical cohort analysis.

## Testing and verification

- `npm --prefix frontend run build` compiles the frontend.
- `npm --prefix backend test` runs the backend's Node test runner (no live database integration suite is bundled).
- Test manually with your Atlas URI and the API examples above. Verify future dates are rejected; IDs increment per normalized company; duplicate active pairs return 409; invalid transitions return 400; valid transitions append history; follow-up dates are seven days after applied dates; overdue is only true for Applied records after the due date; Interview/Offer deletion returns 400; and filters work via URL query parameters.
- `GET /api/health` reports `database: connected` only when Mongoose is connected.

**Verification status for this generated archive:** source files and configuration were created. The environment used to assemble the archive did not run npm dependency installation or connect to your private MongoDB Atlas cluster, so live database/API integration and browser screenshots are not claimed as tested. Run the checks above after supplying your own credentials.

## Screenshots

Actual screenshots are intentionally not fabricated. Start the configured app with your own records, then follow [`screenshots/README.md`](screenshots/README.md) to capture `screenshots/dashboard.png` and `screenshots/applications.png`.

## GitHub workflow and suggested commits

Initialize or connect your existing repository from the project root and make meaningful commits as you complete and verify each part:

```bash
git status
git add .
git commit -m "chore: create ApplyPilot project structure"
# after backend and database integration
git add backend
git commit -m "feat: add MongoDB models and API foundation"
# after CRUD and business-rule validation
git add backend
 git commit -m "feat: implement application workflow and validation"
# after UI pages and API integration
git add frontend
 git commit -m "feat: build responsive dashboard and application management"
# after final QA and docs
git add README.md screenshots .gitignore package.json
git commit -m "docs: add setup guide and final project polish"
git push
```

Remove the leading space before `git commit` if copying those two indented lines into a strict shell. Review `git status` and inspect `.env` exclusion before pushing. No commits or pushes have been performed by this archive-generation process.

## Troubleshooting

- **Backend exits at startup:** check `backend/.env`, the URI, Atlas IP allowlist, database user permissions, and password URL encoding.
- **Frontend cannot reach API:** confirm the backend is listening on port 5000 and `frontend/.env` has `VITE_API_URL=http://localhost:5000/api`; restart Vite after environment changes.
- **CORS error:** ensure `CLIENT_URL` exactly matches the frontend origin (`http://localhost:5173`).
- **Application date rejected:** future UTC calendar dates are rejected by design.
- **Port in use:** change `PORT` in `backend/.env` and update `VITE_API_URL` only if the frontend API port changes.
- **Atlas connection timeout:** check network access rules, cluster state, and outbound connectivity.
