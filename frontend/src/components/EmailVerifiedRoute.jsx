import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Componentă care verifică dacă emailul e verificat
// Dacă nu e verificat, redirect la /verify-email
// Dacă e verificat, redirect la / (dashboard)
function EmailVerifiedRoute({ children, requireVerified = true }) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // Dacă requireVerified=true și userul NU e verificat → redirect la verify-email
  if (requireVerified && !user?.is_verified) {
    return <Navigate to="/verify-email" />
  }

  // Dacă requireVerified=false (suntem pe /verify-email) și userul E verificat → redirect la /
  if (!requireVerified && user?.is_verified) {
    return <Navigate to="/" />
  }

  return children
}

export default EmailVerifiedRoute
