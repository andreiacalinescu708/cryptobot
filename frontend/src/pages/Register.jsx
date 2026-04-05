import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { TrendingUp, Mail, Lock, User, AlertCircle, Check } from 'lucide-react'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password.length < 8) {
      setError('Parola trebuie să aibă cel puțin 8 caractere')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Parolele nu coincid')
      return
    }

    setLoading(true)

    try {
      await register(formData.email, formData.password, formData.fullName)
      
      // Trimite automat codul de verificare
      try {
        await api.post('/auth/send-verification-code')
      } catch (emailErr) {
        console.error('Eroare trimitere email:', emailErr)
        // Continuăm chiar dacă emailul nu merge, userul poate retrimite manual
      }
      
      // Redirect la verificare email
      navigate('/verify-email')
    } catch (err) {
      setError(err.response?.data?.detail || 'Eroare la înregistrare')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">CryptoBot</h1>
          <p className="text-gray-400 mt-2">Creează cont nou</p>
        </div>

        {/* Register Form */}
        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-danger-500/20 border border-danger-500/50 rounded-lg flex items-center gap-2 text-danger-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nume complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input w-full pl-10"
                  placeholder="Ion Popescu"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input w-full pl-10"
                  placeholder="nume@exemplu.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Parolă
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input w-full pl-10"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 caractere
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmă parola
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input w-full pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Se încarcă...
                </span>
              ) : (
                'Înregistrare'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Ai deja cont?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300">
                Autentifică-te
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: Check, text: '5 Strategii' },
            { icon: Check, text: 'Multi-Tenant' },
            { icon: Check, text: 'API Criptate' },
          ].map((feature) => (
            <div key={feature.text} className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <feature.icon className="w-4 h-4 text-success-500" />
              {feature.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Register
