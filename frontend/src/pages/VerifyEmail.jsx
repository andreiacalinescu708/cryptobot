import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/i18nContext'
import LanguageToggle from '../components/LanguageToggle'
import api from '../services/api'
import { Mail, Lock, Check, AlertCircle, RefreshCw } from 'lucide-react'

function VerifyEmail() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { t } = useI18n()
  
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    // Dacă userul e deja verificat și nu tocmai am verificat acum, redirect
    if (user?.is_verified && !success) {
      navigate('/')
    }
  }, [user, navigate, success])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleChange = (index, value) => {
    if (value.length > 1) return
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fullCode = code.join('')
    
    if (fullCode.length !== 6) {
      setError(t('verify.enterCode'))
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      await api.post('/auth/verify-code', { code: fullCode })
      setSuccess(true)
      setTimeout(() => {
        // Force reload to get fresh user data
        window.location.href = '/'
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.detail || t('verify.invalidCode'))
      setCode(['', '', '', '', '', ''])
      document.getElementById('code-0').focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError('')
    
    try {
      await api.post('/auth/send-verification-code')
      setCountdown(60) // 1 minut cooldown
    } catch (err) {
      setError(err.response?.data?.detail || t('common.error'))
    } finally {
      setResendLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-gray-400">{t('common.error')}</p>
      </div>
    )
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
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">{t('verify.title')}</h1>
          <p className="text-gray-400 mt-2">
            {t('verify.sentTo')} <span className="text-white">{user?.email}</span>
          </p>
        </div>

        <div className="card">
          {success ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success-500/20 rounded-full mb-4">
                <Check className="w-8 h-8 text-success-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('verify.success')}</h3>
              <p className="text-gray-400">{t('verify.redirecting')}</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-3 bg-danger-500/20 border border-danger-500/50 rounded-lg flex items-center gap-2 text-danger-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
                  {t('verify.enterCode')}
                </label>
                <p className="text-xs text-gray-500 text-center mb-4">
                  {t('verify.checkSpam')}
                </p>
                
                <div className="flex justify-center gap-2 mb-6">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {t('verify.verifying')}
                    </span>
                  ) : (
                    t('verify.verifyButton')
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm mb-2">{t('verify.noCodeReceived') || "Didn't receive the code?"}</p>
                <button
                  onClick={handleResend}
                  disabled={resendLoading || countdown > 0}
                  className="text-primary-400 hover:text-primary-300 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                >
                  {resendLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : countdown > 0 ? (
                    t('verify.resendIn', { seconds: countdown })
                  ) : (
                    t('verify.resend')
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
