import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import EmailVerifiedRoute from './components/EmailVerifiedRoute'
import Dashboard from './pages/Dashboard'
import Strategies from './pages/Strategies'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Email Verification - nu necesită email verificat */}
        <Route path="/verify-email" element={
          <EmailVerifiedRoute requireVerified={false}>
            <VerifyEmail />
          </EmailVerifiedRoute>
        } />
        
        {/* Protected Routes - necesită email verificat */}
        <Route path="/" element={
          <EmailVerifiedRoute requireVerified={true}>
            <Layout>
              <Dashboard />
            </Layout>
          </EmailVerifiedRoute>
        } />
        <Route path="/strategies" element={
          <EmailVerifiedRoute requireVerified={true}>
            <Layout>
              <Strategies />
            </Layout>
          </EmailVerifiedRoute>
        } />
        <Route path="/settings" element={
          <EmailVerifiedRoute requireVerified={true}>
            <Layout>
              <Settings />
            </Layout>
          </EmailVerifiedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App
