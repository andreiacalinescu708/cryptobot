import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
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
        
        {/* Email Verification */}
        <Route path="/verify-email" element={
          <PrivateRoute>
            <VerifyEmail />
          </PrivateRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/strategies" element={
          <PrivateRoute>
            <Layout>
              <Strategies />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <Layout>
              <Settings />
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App
