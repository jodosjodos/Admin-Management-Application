# Credit Jambo Admin Frontend# React + TypeScript + Vite

Admin web application for managing the Credit Jambo fintech platform. Built with React 18, TypeScript, and Vite.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## 🚀 FeaturesCurrently, two official plugins are available:

### Authentication & Authorization- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- **Admin Login** - Secure JWT-based authentication- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- **Role-Based Access** - Support for SUPER_ADMIN, ADMIN, and SUPPORT roles

- **Session Management** - Auto-logout on token expiration## React Compiler

### DashboardThe React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

- **Platform Statistics** - Real-time metrics for users, savings, credits, and transactions

- **Pending Credit Requests** - Quick view of requests awaiting approval## Expanding the ESLint configuration

- **Recent Activity Feed** - Monitor platform activity in real-time

- **Growth Indicators** - Track platform growth trendsIf you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

### User Management```js

- **User List** - View all registered users with detailsexport default defineConfig([

- **Account Control** - Activate/deactivate user accounts globalIgnores(['dist']),

- **Status Monitoring** - Track user account statuses {

- **Search & Filter** - Find users quickly files: ['**/*.{ts,tsx}'],

  extends: [

### Credit Management // Other configs...

- **Credit Requests** - View all credit applications

- **Approval Workflow** - Approve or reject credit requests // Remove tseslint.configs.recommended and replace with this

- **Credit Score Display** - Visual credit scoring system tseslint.configs.recommendedTypeChecked,

- **Status Filters** - Filter by PENDING, APPROVED, REJECTED status // Alternatively, use this for stricter rules

- **Request Details** - View full credit application information tseslint.configs.strictTypeChecked,

      // Optionally, add this for stylistic rules

### Transaction Monitoring tseslint.configs.stylisticTypeChecked,

- **All Transactions** - Platform-wide transaction history

- **Type Filtering** - Filter by transaction type (deposits, withdrawals, credits, repayments) // Other configs...

- **Real-Time Updates** - Live transaction feed ],

- **Transaction Details** - View amount, balance, and user information languageOptions: {

      parserOptions: {

## 📋 Technology Stack project: ['./tsconfig.node.json', './tsconfig.app.json'],

        tsconfigRootDir: import.meta.dirname,

- **Frontend Framework:** React 18 },

- **Build Tool:** Vite 7.1.12 // other options...

- **Language:** TypeScript 5.6 },

- **Routing:** React Router DOM 7 },

- **State Management:** React Context API])

- **Data Fetching:** TanStack Query (React Query)```

- **HTTP Client:** Axios

- **Charts:** Recharts (for analytics)You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

- **Styling:** Custom CSS with CSS Variables

````js

## 🛠️ Prerequisites// eslint.config.js

import reactX from 'eslint-plugin-react-x'

- Node.js 18 or higherimport reactDom from 'eslint-plugin-react-dom'

- npm or yarn

- Admin Backend running on port 3001export default defineConfig([

  globalIgnores(['dist']),

## 📦 Installation  {

    files: ['**/*.{ts,tsx}'],

```bash    extends: [

# Install dependencies      // Other configs...

npm install      // Enable lint rules for React

      reactX.configs['recommended-typescript'],

# Copy environment variables      // Enable lint rules for React DOM

cp .env.example .env      reactDom.configs.recommended,

    ],

# Update .env with your backend URL    languageOptions: {

VITE_API_URL=http://localhost:3001      parserOptions: {

```        project: ['./tsconfig.node.json', './tsconfig.app.json'],

        tsconfigRootDir: import.meta.dirname,

## 🚀 Development      },

      // other options...

```bash    },

# Start development server  },

npm run dev])

````

# Server will start on http://localhost:5173

````

## 🏗️ Build

```bash
# Build for production
npm run build

# Output will be in dist/ directory
# Build size: ~305 KB JavaScript, ~18 KB CSS
````

## 🧪 Linting

```bash
# Run ESLint
npm run lint
```

## 📁 Project Structure

```
src/
├── assets/             # Static assets
├── components/         # React components
│   ├── Layout.tsx     # Admin sidebar layout
│   └── ProtectedRoute.tsx
├── contexts/          # React Context providers
│   └── AuthContext.tsx
├── pages/             # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── UsersPage.tsx
│   ├── CreditsPage.tsx
│   └── TransactionsPage.tsx
├── services/          # API services
│   ├── api.ts
│   ├── authService.ts
│   └── dashboardService.ts
├── styles/            # CSS files
│   ├── Auth.css
│   ├── Layout.css
│   ├── Dashboard.css
│   ├── Users.css
│   ├── Credits.css
│   └── Transactions.css
├── App.tsx           # Main app component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## 🔐 Authentication

### Admin Roles

- **SUPER_ADMIN** - Full system access, can create other admins
- **ADMIN** - Manage users, approve credits, view transactions
- **SUPPORT** - Read-only access, customer support functions

### Test Credentials

**Super Admin:**

- Email: admin@creditjambo.com
- Password: Admin@123

**Regular Admin:**

- Email: testadmin@creditjambo.com
- Password: Test@123

**Support:**

- Email: support@creditjambo.com
- Password: Support@123

## 🎨 Styling

The application uses a custom CSS design system with CSS variables:

### Brand Colors

- **Primary:** #01c156 (Credit Jambo Green)
- **Secondary:** #00da90 (Light Green)
- **Dark:** #1a1a1a (Text/UI)
- **Light:** #f5f5f5 (Background)

### Components

- Responsive sidebar navigation
- Stats cards with hover effects
- Filterable data tables
- Status badges (pending, approved, rejected)
- Loading spinners
- Error messages
- Modal dialogs

## 🔌 API Integration

### Base Configuration

```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
```

### Request Interceptor

Automatically adds JWT token to all requests:

```typescript
config.headers.Authorization = `Bearer ${token}`;
```

### Response Interceptor

Handles 401 errors and auto-logout:

```typescript
if (error.response?.status === 401) {
  // Clear auth and redirect to login
}
```

## 📊 State Management

### Auth Context

Manages admin authentication state:

- Login/logout functionality
- Token storage (localStorage: 'adminAccessToken')
- Admin profile
- Role-based access

### React Query

Handles server state:

- Caching dashboard stats
- Automatic refetch on focus
- Optimistic updates
- Error handling

## 🌐 Routing

| Route           | Component        | Access    |
| --------------- | ---------------- | --------- |
| `/login`        | LoginPage        | Public    |
| `/dashboard`    | DashboardPage    | Protected |
| `/users`        | UsersPage        | Protected |
| `/credits`      | CreditsPage      | Protected |
| `/transactions` | TransactionsPage | Protected |

## 📱 Responsive Design

The application is fully responsive:

- **Desktop:** Full sidebar with navigation
- **Tablet:** Compact sidebar
- **Mobile:** Icon-only sidebar navigation

## 🔧 Environment Variables

```env
VITE_API_URL=http://localhost:3001
```

## 🚢 Deployment

### Build Production Bundle

```bash
npm run build
```

### Deploy to Static Hosting

The `dist/` folder can be deployed to:

- Vercel
- Netlify
- AWS S3 + CloudFront
- Nginx/Apache server

### Environment Configuration

Update `VITE_API_URL` to your production backend URL.

## 📝 Development Guidelines

### Adding a New Page

1. Create page component in `src/pages/`
2. Create corresponding CSS in `src/styles/`
3. Add route in `App.tsx`
4. Wrap in `<ProtectedRoute>` if auth required
5. Add navigation link in `Layout.tsx`

### Creating a Service

1. Add service file in `src/services/`
2. Define TypeScript interfaces
3. Use `apiClient` for HTTP requests
4. Export typed functions

### Styling Best Practices

- Use CSS variables from `index.css`
- Follow naming conventions (.btn, .card, .badge)
- Ensure responsive design (mobile-first)
- Add hover states for interactivity
- Include loading and error states

## 🐛 Known Issues

- None currently reported

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)

## 📄 License

MIT License - Credit Jambo Platform

## 👥 Support

For issues or questions:

- Contact: admin@creditjambo.com
- Documentation: See PROJECT_STATUS.md in root directory

---

**Credit Jambo Admin** - Empowering Financial Management 💚
