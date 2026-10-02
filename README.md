# RenewTech Workforce

> **Connecting Verified Renewable Energy Talent with EPC Projects**  
> A full-stack, enterprise-grade talent marketplace and workforce mobilization platform tailored for India's clean energy infrastructure — covering Solar PV, Wind, Battery Energy Storage Systems (BESS), and Green Hydrogen sites.

---

## 1. Project Title & Tagline
**RenewTech Workforce**  
A dedicated renewable-energy workforce platform connecting skilled, certified technicians with EPC (Engineering, Procurement, and Construction) companies for efficient, verified field mobilization.

---

## 2. Project Overview
RenewTech Workforce addresses the growing talent shortage and qualification gap across utility-scale and rooftop clean energy projects.
- **For Technicians:** An intuitive digital identity and career hub. Technicians register, build structured skill profiles, upload accredited certifications, take standardized competency assessments, receive matched project recommendations, and showcase a tamper-evident **Digital Skill Passport** with a dynamic, publicly verifiable QR code.
- **For EPC Companies:** A streamlined contractor portal to post renewable energy projects, discover high-compatibility technicians using an 8-factor matching algorithm, review structured candidate applications, hire qualified talent, and manage real-time site rosters and daily shift logs.
- **For Platform Administrators:** An administrative governance hub to audit and approve technician certifications, oversee active users and contractor profiles, resolve disputes, and maintain platform compliance.

---

## 3. Problem Statement
The renewable energy sector faces acute hiring and operational bottlenecks:
1. **Difficulty Finding Verified Talent:** EPC contractors struggle to find certified technicians with proven field competence in Solar PV, Wind, and BESS installations.
2. **Manual & Slow Credential Verification:** Verification of certificates (NISE, Skill Council for Green Jobs, ITI, DISH) typically takes weeks through offline channels.
3. **Severe Skill & Location Mismatches:** Projects frequently experience delays due to hiring technicians who lack specific high-voltage wiring, inverter commissioning, or safety certifications.
4. **Disorganized Application Tracking:** Hiring managers rely on unorganized spreadsheets and messaging apps to manage candidate pipelines across scattered project sites.
5. **Lack of Digital Identity:** Technicians lack a universally accessible, portable credential to prove verified qualifications directly to on-site supervisors.

---

## 4. Solution
RenewTech Workforce delivers an integrated end-to-end digital lifecycle:

```
[ TECHNICIAN ]                                 [ EPC COMPANY ]
Register / Login                              Register / Login
       ↓                                              ↓
Build Profile & Skills                         Post Renewable Project
       ↓                                              ↓
Upload Certificates                           AI / Weighted Matching
       ↓                                              ↓
Competency Assessment                         Search Technicians
       ↓                                              ↓
Receive Recommendations                       Review Applications
       ↓                                              ↓
Submit Application ─────────────────────────→ Hire & Mobilize
       ↓                                              ↓
Digital Skill Passport ◄───────────────────── Manage Workforce & Shifts
       ↓
Public QR Code Scan (Instant Site Verification)
```

---

## 5. Main Features

### Technician Portal
- **Dashboard:** Real-time metrics tracking profile completion, verified skills count, active applications, assigned project deployments, and quick actions.
- **Profile Management:** Detailed professional bio, experience years, expected daily/monthly compensation rates, state/city location, preferred regional work clusters, and instant availability toggle (`Available`, `On Project`, `Unavailable`).
- **Renewable Skills:** Granular skill taxonomy covering Solar, Wind, BESS, and Electrical safety categories with proficiency tracking (`Beginner`, `Intermediate`, `Advanced`, `Expert`).
- **Certificate Hub:** Secure certificate upload, registration number deduplication, issuing organization tracking, issue/expiry dates, and real-time verification status (`Pending`, `Verified`, `Rejected`).
- **Competency Assessments:** Standardized 10-question timed technical quizzes with automated backend scoring, pass/fail benchmarks (70%), mastery level calculation, and persistent assessment logs.
- **Recommended Projects:** Real-time matching feed presenting recommended project opportunities with match percentages, compatibility highlights, and direct application submission.
- **Application Tracker:** Live status tracking for submitted applications (`Applied`, `Reviewing`, `Shortlisted`, `Interview`, `Hired`, `Rejected`) with cover notes and applied dates.
- **Digital Skill Passport:** Comprehensive verifiable credential summarizing technician identity, overall skill index, verified badges, rating breakdown, completed projects, and verification seal.
- **Dynamic QR Code:** Tamper-evident QR code encoding the public verification URL for on-site scanning by project managers.

### EPC Company Portal
- **Dashboard:** Key contractor analytics including active projects, open workforce vacancies, pending applications, and mobilization status.
- **Project Management:** Full project lifecycle management (drafting, publishing, updating, archiving, deleting) with multi-worker role specifications, required certifications, experience minimums, and site location data.
- **Technician Search & Matching:** Search directory with real-time keyword filtering, sector filters (Solar, Wind, Hybrid), state filtering, and project-specific candidate matching.
- **Candidate Pipeline:** Kanban-style applicant review allowing EPC teams to evaluate match scores, review candidate skill passports, shortlist, update statuses, and hire technicians.
- **Workforce Management:** Active field deployment roster tracking assigned personnel, project sites, assignment status (`Active`, `Completed`, `Demobilized`), daily attendance, and shift updates.

### Admin Portal
- **Dashboard:** System-wide operational telemetry tracking total registered users, technicians, EPC contractors, active projects, and verification queues.
- **Certificate Verification Queue:** Dedicated review interface for pending technician certificates with document inspection, issuing authority validation, and one-click approve/reject actions with reviewer audit notes.
- **User & Company Directory:** Comprehensive management of technicians and EPC company accounts with active status controls.
- **Platform Analytics:** Real-time aggregation of platform growth, sector distribution, and hiring metrics.

### Public Features
- **Public Project Directory:** Browsable marketplace of renewable energy projects accessible without authentication, featuring search by title, location, and renewable sector.
- **Public Skill Passport Verification:** Dedicated public verification page (`/verify/skill-passport/:id`) accessible to any site supervisor or client without login.
- **Mobile QR Scanner:** Built-in camera-based QR scanner allowing instant verification of physical or digital Skill Passports on mobile devices.

---

## 6. Skill Passport & QR Verification
Every registered technician receives a unique **Digital Skill Passport** identified by a secure alphanumeric code (e.g., `RT-PASS-XXXXXX`).
1. **Dynamic Generation:** The passport compiles verified credentials from MongoDB Atlas in real time: verified certifications, assessment pass scores, validated skills, and supervisor ratings.
2. **Public QR Code:** The system renders a standard SVG QR code encoding the absolute URL:  
   `https://<domain>/verify/skill-passport/<passportCode>`
3. **No-Login Access:** When scanned with any mobile camera, smartphone QR reader, or the built-in scanner, the URL opens the **Public Verification Page** directly.
4. **Tamper-Evident Display:** The public view displays official verification seals, issuing authority details, certificate IDs, and skill competencies without exposing private contact credentials.
5. **Safe Fallback:** If an unrecognized or invalid ID is scanned, the page displays a clean `Skill Passport Not Found` state with actionable guidance.

---

## 7. Matching System
RenewTech Workforce uses a multi-factor weighted matching algorithm implemented in `server/services/matchingEngine.js`:

| Matching Dimension | Weight | Description |
| :--- | :---: | :--- |
| **Skill Compatibility** | **35%** | Evaluates matched required skills vs. technician profile; verified skills receive a premium multiplier. |
| **Certifications** | **20%** | Compares active, verified technician certificates against mandatory project accreditations. |
| **Field Experience** | **15%** | Matches technician years of experience against project minimum requirements. |
| **Location & Cluster** | **10%** | Proximity match based on state, city, and technician's preferred work regional clusters. |
| **Current Availability** | **10%** | Immediate bonus for technicians currently marked as `Available` (vs. `On Project` or `Unavailable`). |
| **Assessment Scores** | **5%** | Benchmark performance on relevant domain assessments (Solar PV, Wind, Electrical Safety). |
| **Contractor Rating** | **5%** | Aggregate review score (technical skill, safety, punctuality, and workmanship quality). |

The engine calculates an overall compatibility percentage (0–100%), identifies matched and missing skills/certifications, and generates an automated narrative summary for contractors.

---

## 8. User Roles

| Role | Primary Responsibilities | Default Dashboard |
| :--- | :--- | :--- |
| **Technician** | Builds skill identity, uploads certificates, takes assessments, tracks project recommendations, applies to open vacancies, presents Digital Skill Passport. | `/technician/dashboard` |
| **EPC Company** | Creates renewable project requisitions, defines required crew roles, discovers candidates via matching score, reviews applications, hires technicians, tracks active workforce rosters. | `/epc/dashboard` |
| **Admin** | Audits uploaded certification documents, verifies credentials, monitors user compliance, oversees EPC companies and active project deployments. | `/admin/dashboard` |

---

## 9. Technology Stack

### Frontend
- **React 18** (SPA architecture)
- **Vite 5** (Fast ES module bundling & build tooling)
- **Tailwind CSS 3** (Custom design system & responsive utilities)
- **React Router 6** (Client-side routing, protected routes, and role-based redirects)
- **Framer Motion** (Smooth UI animations and interactive micro-interactions)
- **Recharts** (Interactive performance charts and data visualizations)
- **Lucide React** (Consistent UI iconography)
- **html5-qrcode & qrcode.react** (Client-side QR generation and live camera scanner)
- **Axios** (HTTP client with JWT authorization interceptors)

### Backend
- **Node.js** (LTS Runtime)
- **Express.js** (REST API framework)
- **MongoDB Atlas** (Cloud-hosted NoSQL document database)
- **Mongoose 8** (Schema modeling, indexing, and validation)

### Authentication & Security
- **Firebase Authentication** (Google OAuth 2.0 Sign-In)
- **JSON Web Tokens (JWT)** (Stateless session tokens with role payload)
- **bcryptjs** (Salted password hashing)
- **CORS** (Dynamic origin whitelisting supporting Vercel and production domains)

### Cloud Infrastructure
- **Frontend Hosting:** Vercel (Edge network deployment with SPA rewrites)
- **Backend API Hosting:** Render (Managed web service with continuous deployment)
- **Database:** MongoDB Atlas (Managed M0 Shared Cluster)

---

## 10. Project Structure

```
RenewTechWorforce/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/              # Static assets and images
│   │   ├── components/          # Reusable UI components
│   │   │   ├── common/          # Header, Navbar, Footer, Sidebar, Button
│   │   │   ├── landing/         # Landing sections, OpeningExperience
│   │   │   └── passport/        # DigitalSkillPassportCard, ScannerModal, ShareModal
│   │   ├── context/             # AuthContext (JWT + Firebase session state)
│   │   ├── pages/
│   │   │   ├── admin/           # AdminDashboard, AdminCertificates, AdminTechnicians, AdminCompanies
│   │   │   ├── auth/            # LoginPage, RegisterPage, ChooseRolePage, ForgotPasswordPage
│   │   │   ├── epc/             # EPCDashboard, ProjectsPage, PostProject, TechnicianSearch, Applications, Workforce
│   │   │   ├── public/          # SkillPassportVerificationPage, PublicProjects
│   │   │   ├── technician/      # TechnicianDashboard, Profile, Certificates, Assessments, Recommended, SkillPassport
│   │   │   └── LandingPage.jsx  # Main homepage
│   │   ├── services/            # api.js (Axios client), firebase.js (SDK config)
│   │   ├── App.jsx              # Main router and route protection
│   │   ├── index.css            # Tailwind directives and custom tokens
│   │   └── main.jsx             # React DOM entry point
│   ├── package.json
│   ├── vercel.json              # Client SPA rewrite rules
│   └── vite.config.js           # Vite build and proxy settings
├── server/
│   ├── config/                  # db.js (MongoDB Atlas connection)
│   ├── controllers/             # authController, technicianController, projectController, etc.
│   ├── middleware/              # auth.js (JWT protect and role authorize middleware)
│   ├── models/                  # User, TechnicianProfile, CompanyProfile, Project, Certificate, etc.
│   ├── routes/                  # authRoutes, technicianRoutes, projectRoutes, workforceRoutes, etc.
│   ├── scripts/                 # Seed scripts and live smoke test suites
│   ├── services/                # matchingEngine.js (multi-factor matching)
│   ├── package.json
│   └── server.js                # Express app entry point, CORS, and health checks
├── DEPLOYMENT.md                # Detailed production deployment runbook
├── package.json                 # Root package with concurrently dev scripts
├── render.yaml                  # Render Infrastructure-as-Code Blueprint
├── vercel.json                  # Root Vercel build & routing configuration
└── README.md                    # Project documentation
```

---

## 11. Application Flow

### Technician User Journey
1. **Sign Up:** Register using email/password or Google OAuth.
2. **Profile Completion:** Populate professional experience, location, and trade capabilities.
3. **Credential Submission:** Upload government/industry certifications (NISE, SCGJ) to enter verification queue.
4. **Competency Assessments:** Complete domain-specific quizzes; passing results update the Skill Passport.
5. **Project Discovery:** Browse recommended projects ranked by the matching algorithm.
6. **Application Submission:** Submit an application with a personalized cover note.
7. **Mobilization:** EPC reviews, shortlists, and deploys the technician; shift logs appear in Workforce.
8. **Skill Passport:** Technician exports or displays their digital passport; supervisors verify credentials via QR scan.

### EPC Contractor User Journey
1. **Sign Up:** Create an EPC Company profile with company registration and domain focus.
2. **Post Project:** Define project parameters (MW capacity, location, duration, budget, crew requirements).
3. **Talent Discovery:** Search pre-screened technicians or view algorithmically matched candidates.
4. **Pipeline Review:** Review applicant profiles, inspect certificates, and transition candidate status (`Applied` → `Shortlisted` → `Hired`).
5. **Roster Management:** View active project crews, log shift records, and track project completion.

---

## 12. Matching Flow

```
[ Project Requirements ]               [ Technician Profile ]
- Required Skills                      - Verified & Unverified Skills
- Mandatory Certifications             - Active Certificates
- Minimum Experience Years             - Recorded Field Experience
- Project Site City & State            - Operating City, State & Clusters
- Start & End Dates                    - Availability Status
- Domain Sector (Solar/Wind/BESS)      - Domain Assessment Scores
- Role Requirements                    - Client Rating & Reviews
                  │                                │
                  └───────────────┬────────────────┘
                                  ▼
                  ┌───────────────────────────────┐
                  │ Multi-Factor Weighted Scoring │
                  │  Skills Match (35%)           │
                  │  Certifications Match (20%)   │
                  │  Experience Fit (15%)         │
                  │  Location Proximity (10%)     │
                  │  Availability Status (10%)    │
                  │  Assessment Score (5%)        │
                  │  Contractor Rating (5%)       │
                  └───────────────┬───────────────┘
                                  ▼
                  ┌───────────────────────────────┐
                  │ Output: Match Score (0–100%)  │
                  │ + Match Breakdown & Gaps      │
                  │ + Automated Recommendation    │
                  └───────────────────────────────┘
```

---

## 13. Security & Access Control
- **Stateless JWT Authentication:** Access tokens signed using `HS256` containing user ID and role, with automated expiration.
- **Role-Based Access Control (RBAC):** Express middleware (`protect`, `authorize('technician', 'epc_company', 'admin')`) strictly enforces endpoint boundaries.
- **Frontend Route Guards:** React Router wrappers (`ProtectedRoute`, `PublicOnlyRoute`, `RoleBasedRoute`) prevent unauthorized dashboard access and redirect cleanly.
- **Safe Public Verification:** The public verification route (`/verify/skill-passport/:id`) allows anyone to inspect verified credentials while sanitizing and protecting sensitive personal data (e.g. passwords, private phone numbers).
- **Session Cleanup:** Secure logout clears tokens and session objects from browser storage.
- **Dynamic CORS Enforcement:** Production API restricts incoming cross-origin requests to explicit production domains and verified Vercel origins.

---

## 14. Environment Variables

> **IMPORTANT:** Never commit real secrets, private keys, or credentials to Git repositories.

### Frontend (`client/.env`)
```bash
# Production Render Backend API URL (no trailing slash)
VITE_API_URL=https://renewtechworforce.onrender.com

# Firebase Web App Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Backend (`server/.env`)
```bash
# Runtime Environment
NODE_ENV=production
PORT=5000

# MongoDB Atlas Connection URI
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/renewtech?retryWrites=true&w=majority

# JWT Authentication Secret (32+ characters)
JWT_SECRET=your_super_strong_random_jwt_secret_key

# Allowed Frontend Origins (comma-separated if multiple)
CLIENT_URL=https://renew-tech-worforce-vu14-k9p068elc.vercel.app
FRONTEND_URL=https://renew-tech-worforce-vu14-k9p068elc.vercel.app
```

---

## 15. Local Development

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- npm (v9.x or higher)
- MongoDB instance (local `mongodb://127.0.0.1:27017/renewtech` or free MongoDB Atlas cluster)

### Installation
```bash
# 1. Clone repository
git clone https://github.com/annuverma888/RenewTechWorforce.git
cd RenewTechWorforce

# 2. Install all dependencies across root, server, and client
npm run install:all
```

### Running Locally
```bash
# Start both Backend API (:5000) and Frontend (:5173) concurrently:
npm run dev

# Or run services individually:
npm run server    # Backend only
npm run client    # Frontend only
```

---

## 16. Production Deployment

### Frontend (Vercel)
- **Root Directory:** `client` (or root with provided `vercel.json`)
- **Build Command:** `npm run build`
- **Output Directory:** `dist` (or `client/dist`)
- **Rewrites:** Handled by `vercel.json` (`/(.*) -> /index.html`) for client-side routing.
- **Environment Variables:** Set `VITE_API_URL` to the Render backend URL.

### Backend (Render)
- **Service Type:** Web Service
- **Root Directory:** `server`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Health Check Path:** `/api/health`
- **Auto-Deploy:** Enabled on commits to `main`.

### Database (MongoDB Atlas)
- Shared M0 cluster hosted in AWS/GCP.
- Network Access: Allow access from `0.0.0.0/0` (or Render outbound IPs).

---

## 17. Production URLs
- **Frontend (Vercel):** [https://renew-tech-worforce-vu14-k9p068elc.vercel.app/](https://renew-tech-worforce-vu14-k9p068elc.vercel.app/)
- **Backend API (Render):** [https://renewtechworforce.onrender.com/](https://renewtechworforce.onrender.com/)
- **Backend Health Check:** [https://renewtechworforce.onrender.com/api/health](https://renewtechworforce.onrender.com/api/health)

---

## 18. Future Scope
The following enhancements are identified for upcoming development cycles:
- **Mobile Native Applications:** Dedicated iOS and Android applications built with React Native for offline shift logs.
- **Automated Government Credential Verification:** Direct API integration with DigiLocker and National Skill Development Corporation (NSDC) registries.
- **IoT & Telematics Integration:** Automated site check-in via GPS geofencing and on-site RFID/BLE beacons.
- **Advanced Workforce Scheduling:** Gantt-style mobilization planning and predictive weather disruption forecasting.
- **Expanded Accreditation Courses:** Integrated video training and proctored technical re-certifications.

---

## 19. Project Status
- **Architecture & Implementation:** 100% Complete (Phases 4A–4I and 5A–5H passed).
- **Backend API:** Live and healthy on Render.
- **Database:** Connected to MongoDB Atlas with live collections.
- **Frontend SPA:** Live on Vercel with responsive desktop, tablet, and mobile views.
- **Skill Passport & QR:** Live and publicly verifiable without authentication.
- **Production Status:** **READY FOR LAUNCH**.
