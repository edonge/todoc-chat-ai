# Project Structure - Todoc Chat AI
**Generated:** December 25, 2024, 18:04

## Overview
This is a monorepo containing a mobile web application for an integrated parenting support platform. The project consists of a FastAPI backend and a React (Vite) frontend.

## Root Directory Structure

```
todoc-chat-ai/
├── .git/                          # Git repository
├── .gitignore                     # Git ignore rules
├── .DS_Store                      # macOS system file
├── README.md                      # Project documentation
├── vercel.json                    # Vercel deployment configuration
├── package-lock.json              # Root package lock file
├── frontend/                      # Frontend application (React + Vite + TypeScript)
└── backend/                       # Backend API (FastAPI + Python)
```

---

## Frontend Structure (`/frontend`)

### Root Files
- `index.html` - HTML entry point
- `package.json` - Frontend dependencies and scripts
- `package-lock.json` - Dependency lock file
- `tsconfig.json` - TypeScript configuration
- `tsconfig.node.json` - TypeScript config for Node.js
- `vite.config.ts` - Vite build configuration

### Source Directory (`/frontend/src`)

#### API Layer (`/src/api`)
- `client.ts` - API client configuration (Axios)
- `index.ts` - API exports
- `types.ts` - TypeScript type definitions for API
- `/hooks/` - Custom React hooks for API calls
  - `useAuth.ts` - Authentication hooks
  - `useChat.ts` - Chat functionality hooks
  - `useCommunity.ts` - Community features hooks
  - `useKids.ts` - Child management hooks
  - `useRecords.ts` - Record management hooks

#### Components (`/src/components`)

**Common Components (`/components/common`)**
- `Header.tsx` - Main header component
- `ImageWithFallback.tsx` - Image component with fallback handling

**Example Components (`/components/examples`)**
- `CreateKidForm.tsx` - Child registration form
- `KidsList.tsx` - List of children
- `LoginForm.tsx` - Login form component

**UI Components (`/components/ui`)**
Comprehensive shadcn/ui component library including:
- `accordion.tsx`, `alert.tsx`, `alert-dialog.tsx`
- `avatar.tsx`, `badge.tsx`, `breadcrumb.tsx`
- `button.tsx`, `calendar.tsx`, `card.tsx`
- `carousel.tsx`, `chart.tsx`, `checkbox.tsx`
- `collapsible.tsx`, `command.tsx`, `context-menu.tsx`
- `dialog.tsx`, `drawer.tsx`, `dropdown-menu.tsx`
- `form.tsx`, `hover-card.tsx`, `input.tsx`, `input-otp.tsx`
- `label.tsx`, `menubar.tsx`, `navigation-menu.tsx`
- `pagination.tsx`, `popover.tsx`, `progress.tsx`
- `radio-group.tsx`, `resizable.tsx`, `scroll-area.tsx`
- `select.tsx`, `separator.tsx`, `sheet.tsx`
- `sidebar.tsx`, `skeleton.tsx`, `slider.tsx`
- `sonner.tsx` (toast notifications), `switch.tsx`
- `table.tsx`, `tabs.tsx`, `textarea.tsx`
- `toggle.tsx`, `toggle-group.tsx`, `tooltip.tsx`
- `use-mobile.ts` - Mobile detection hook
- `utils.ts` - UI utility functions

#### Contexts (`/src/contexts`)
- `AuthContext.tsx` - Authentication context provider
- `LanguageContext.tsx` - Internationalization context

#### Screens (`/src/screens`)
Main application screens:
- `/BottomNavigation/BottomNavigation.tsx` - Bottom navigation bar
- `/Chat/ChatScreen.tsx` - AI chat interface
- `/ChildRegistration/ChildRegistrationScreen.tsx` - Onboarding screen
- `/Community/CommunityScreen.tsx` - Community/forum screen
- `/Home/HomeScreen.tsx` - Home dashboard
- `/Login/LoginScreen.tsx` - Login/authentication screen
- `/Navigation/DialNavigation.tsx` - Dial-style navigation component
- `/Record/RecordScreen.tsx` - Record management screen

#### Services (`/src/services`)
- `/api/childService.ts` - Child-related API service functions

#### Store (`/src/store`)
- `useAuthStore.ts` - Zustand store for authentication state

#### Styles (`/src/styles`)
- `globals.css` - Global CSS styles

#### Utilities (`/src/utils`)
- `dateValidation.ts` - Date validation utilities

#### Other Files
- `App.tsx` - Main application component (routing logic)
- `main.tsx` - Application entry point
- `index.css` - Main CSS file
- `/locales/translations.ts` - Translation/localization data
- `/docs/Attributions.md` - Attribution documentation
- `/docs/Guidelines.md` - Development guidelines

---

## Backend Structure (`/backend`)

### Root Files
- `requirements.txt` - Python dependencies
- `package-lock.json` - Node.js lock file (if any)
- `Procfile` - Process file for deployment
- `railway.json` - Railway deployment configuration
- `railway.toml` - Railway configuration
- `runtime.txt` - Python runtime version

### Application Directory (`/backend/app`)

#### API Routes (`/app/api`)
- `__init__.py` - Package initialization
- `deps.py` - Dependency injection utilities
- `/v1/` - API version 1 routes
  - `__init__.py`
  - `auth.py` - Authentication endpoints
  - `chat.py` - Chat/AI endpoints
  - `community.py` - Community endpoints
  - `files.py` - File upload endpoints
  - `kids.py` - Child management endpoints
  - `records.py` - Record management endpoints

#### Core (`/app/core`)
- `config.py` - Application configuration
- `database.py` - Database connection and setup
- `security.py` - Security utilities (JWT, password hashing)

#### Models (`/app/models`)
Database models (SQLAlchemy):
- `__init__.py`
- `ai_mode.py` - AI mode model
- `chat_message.py` - Chat message model
- `chat_session.py` - Chat session model
- `comment.py` - Comment model
- `enums.py` - Enumeration definitions
- `growth_record.py` - Growth record model
- `health_record.py` - Health record model
- `kid.py` - Child model
- `meal_record.py` - Meal record model
- `post_like.py` - Post like model
- `post.py` - Post model
- `record.py` - Base record model
- `sleep_record.py` - Sleep record model
- `stool_record.py` - Stool record model
- `user.py` - User model

#### RAG (Retrieval-Augmented Generation) (`/app/rag`)
AI/RAG functionality:
- `__init__.py`
- `ingest.py` - Document ingestion
- `ingest_common.py` - Common ingestion utilities
- `ingest_mom.py` - Mom-specific ingestion
- `ingest_nutri.py` - Nutrition-specific ingestion
- `retriever.py` - Document retrieval
- `retriever_common.py` - Common retrieval utilities
- `retriever_mom.py` - Mom-specific retrieval
- `retriever_nutri.py` - Nutrition-specific retrieval

#### Schemas (`/app/schemas`)
Pydantic schemas for request/response validation:
- `__init__.py`
- `chat.py` - Chat schemas
- `community.py` - Community schemas
- `kid.py` - Child schemas
- `record.py` - Record schemas
- `user.py` - User schemas

#### Services (`/app/services`)
- `__init__.py`
- `ai_service.py` - AI service implementation

#### Utils (`/app/utils`)
- `__init__.py` - Utility functions

#### Main Entry Point
- `main.py` - FastAPI application entry point

---

## Technology Stack

### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite 6.3.5
- **Language:** TypeScript 5.9.3
- **UI Library:** shadcn/ui (Radix UI components)
- **Styling:** Tailwind CSS
- **State Management:** Zustand 5.0.9
- **HTTP Client:** Axios 1.13.2
- **Forms:** React Hook Form 7.55.0
- **Charts:** Recharts 2.15.2
- **Notifications:** Sonner 2.0.3
- **Icons:** Lucide React 0.487.0

### Backend
- **Framework:** FastAPI 0.115.0
- **Language:** Python 3.12
- **ORM:** SQLAlchemy 2.0.31
- **Database:** PostgreSQL (via psycopg2-binary)
- **Authentication:** python-jose 3.5.0, passlib 1.7.4, bcrypt 4.2.1
- **AI/ML:** 
  - google-generativeai 0.8.5 (Gemini API)
  - openai 1.59.8
  - faiss-cpu 1.9.0.post1 (vector search)
  - tiktoken 0.8.0
- **Document Processing:** pypdf 5.1.0
- **Server:** Uvicorn 0.30.0

### Deployment
- **Platform:** Vercel (configured via `vercel.json`)
- **Alternative:** Railway (configured via `railway.json` and `railway.toml`)

---

## Key Features

### Frontend Features
1. **Authentication Flow**
   - Login screen
   - Child registration (onboarding)
   - Protected routes

2. **Main Screens**
   - Home dashboard
   - Record management (meals, sleep, growth, health, stool)
   - AI chat interface
   - Community/forum

3. **Navigation**
   - Header with child selector
   - Bottom navigation
   - Dial navigation component

4. **UI/UX**
   - Dark mode support
   - Responsive mobile design
   - Toast notifications
   - Comprehensive component library

### Backend Features
1. **API Endpoints**
   - Authentication (JWT-based)
   - Child management
   - Record management (multiple types)
   - AI chat with RAG
   - Community features (posts, comments, likes)
   - File uploads

2. **AI/RAG System**
   - Document ingestion (common, mom-specific, nutrition-specific)
   - Vector retrieval system
   - Integration with Google Gemini and OpenAI

3. **Database Models**
   - User management
   - Child profiles
   - Multiple record types (meal, sleep, growth, health, stool)
   - Chat sessions and messages
   - Community posts and interactions

---

## Development Notes

### Frontend Developer Focus
As a front-end developer, you should focus on:
- `/frontend/src/` directory
- UI components in `/frontend/src/components/`
- Screen components in `/frontend/src/screens/`
- Styling in `/frontend/src/styles/` and component files
- API integration via `/frontend/src/api/` hooks

### Backend (Do Not Modify)
The backend is maintained separately. Avoid modifying:
- `/backend/` directory
- Backend API logic
- Database models
- Authentication logic

---

## File Count Summary

- **Frontend Components:** ~50+ UI components
- **Frontend Screens:** 8 main screens
- **Backend API Routes:** 6 main route modules
- **Backend Models:** 13 database models
- **Backend Schemas:** 5 schema modules
- **RAG Modules:** 7 retrieval/ingestion modules

---

*This structure document was generated automatically on December 25, 2024 at 18:04.*

