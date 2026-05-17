import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const KeyListPage = lazy(() => import('./pages/KeyListPage'))
const GenerateKeyPage = lazy(() => import('./pages/GenerateKeyPage'))
const KeyDetailsPage = lazy(() => import('./pages/KeyDetailsPage'))
const EditKeyMetadataPage = lazy(() => import('./pages/EditKeyMetadataPage'))
const RotateKeyPage = lazy(() => import('./pages/RotateKeyPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))

export const router = createBrowserRouter([
  { path: '/login', element: <Suspense fallback={null}><LoginPage /></Suspense> },
  { path: '/register', element: <Suspense fallback={null}><RegisterPage /></Suspense> },
  {
    path: '/',
    element: <Suspense fallback={null}><ProtectedRoute /></Suspense>,
    children: [
      { index: true, element: <Suspense fallback={null}><DashboardPage /></Suspense> },
      { path: 'keys', element: <Suspense fallback={null}><KeyListPage /></Suspense> },
      { path: 'keys/new', element: <Suspense fallback={null}><GenerateKeyPage /></Suspense> },
      { path: 'keys/:id', element: <Suspense fallback={null}><KeyDetailsPage /></Suspense> },
      { path: 'keys/:id/edit', element: <Suspense fallback={null}><EditKeyMetadataPage /></Suspense> },
      { path: 'keys/:id/rotate', element: <Suspense fallback={null}><RotateKeyPage /></Suspense> },
      { path: 'settings', element: <Suspense fallback={null}><SettingsPage /></Suspense> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
