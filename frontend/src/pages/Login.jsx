import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/i18nContext'
import LanguageToggle from '../components/LanguageToggle'
import api from '../services/api'
import { TrendingUp, Mail, Lock, AlertCircle } from 'lucide-react'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(formData.email, formData.password)
      
      // Verifică dacă emailul e verificat
      if (!user.is_verified) {
        // Trimite codul automat
        try {
          await api.post('/auth/send-verification-code')
        } catch (emailErr) {
          console.error('Eroare trimitere email:', emailErr)
        }
        navigate('/verify-email')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Eroare la autentificare')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">CryptoBot</h1>
          <p className="text-gray-400 mt-2">Autentificare în cont</p>
        </div>

        {/* Login Form */}
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
                'Autentificare'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Nu ai cont?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300">
                Înregistrează-te
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Prin autentificare, ești de acord cu{' '}
          <a href="#" className="text-primary-400 hover:underline">Termenii de utilizare</a>
          {' '}și{' '}
          <a href="#" className="text-primary-400 hover:underline">Politica de confidențialitate</a>
        </p>
      </div>
    </div>
  )
}

export default Login
