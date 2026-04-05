import { createContext, useContext, useState, useEffect } from 'react'

const i18nContext = createContext(null)

// Translations
const translations = {
  ro: {
    // Auth
    'auth.login': 'Autentificare',
    'auth.register': 'Înregistrare',
    'auth.email': 'Email',
    'auth.password': 'Parolă',
    'auth.confirmPassword': 'Confirmă parola',
    'auth.fullName': 'Nume complet',
    'auth.forgotPassword': 'Ai uitat parola?',
    'auth.noAccount': 'Nu ai cont?',
    'auth.hasAccount': 'Ai deja cont?',
    'auth.createAccount': 'Creează cont',
    'auth.loginButton': 'Autentifică-te',
    'auth.registerButton': 'Înregistrare',
    'auth.logout': 'Deconectare',
    
    // Verify Email
    'verify.title': 'Verificare Email',
    'verify.sentTo': 'Am trimis un cod de 6 cifre pe',
    'verify.enterCode': 'Introdu codul de verificare',
    'verify.checkSpam': 'Verifică și în folderul Spam/Junk dacă nu vezi emailul',
    'verify.verifyButton': 'Verifică',
    'verify.verifying': 'Se verifică...',
    'verify.resend': 'Retrimite codul',
    'verify.resendIn': 'Retrimite în {seconds}s',
    'verify.success': 'Email verificat!',
    'verify.redirecting': 'Vei fi redirectat...',
    'verify.invalidCode': 'Cod invalid sau expirat',
    'verify.noCodeReceived': 'Nu ai primit codul?',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Bun venit',
    'dashboard.totalProfit': 'Profit Total',
    'dashboard.totalTrades': 'Tranzacții Totale',
    'dashboard.winRate': 'Rată de Succes',
    'dashboard.activeStrategies': 'Strategii Active',
    'dashboard.recentTrades': 'Tranzacții Recente',
    'dashboard.noTrades': 'Nu există tranzacții recente',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.strategies': 'Strategii',
    'nav.trades': 'Tranzacții',
    'nav.settings': 'Setări',
    'nav.profile': 'Profil',
    'nav.apiKeys': 'Chei API',
    
    // Common
    'common.loading': 'Se încarcă...',
    'common.error': 'Eroare',
    'common.save': 'Salvează',
    'common.cancel': 'Anulează',
    'common.delete': 'Șterge',
    'common.edit': 'Editează',
    'common.create': 'Creează',
    'common.search': 'Caută',
    'common.filter': 'Filtrează',
    'common.close': 'Închide',
    'common.back': 'Înapoi',
    'common.next': 'Următorul',
    'common.submit': 'Trimite',
    'common.success': 'Succes',
    'common.warning': 'Atenție',
    'common.info': 'Informație',
    'common.confirm': 'Confirmă',
    'common.yes': 'Da',
    'common.no': 'Nu',
  },
  en: {
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.createAccount': 'Create account',
    'auth.loginButton': 'Login',
    'auth.registerButton': 'Register',
    'auth.logout': 'Logout',
    
    // Verify Email
    'verify.title': 'Email Verification',
    'verify.sentTo': 'We sent a 6-digit code to',
    'verify.enterCode': 'Enter verification code',
    'verify.checkSpam': 'Check Spam/Junk folder if you don\'t see the email',
    'verify.verifyButton': 'Verify',
    'verify.verifying': 'Verifying...',
    'verify.resend': 'Resend code',
    'verify.resendIn': 'Resend in {seconds}s',
    'verify.success': 'Email verified!',
    'verify.redirecting': 'Redirecting...',
    'verify.invalidCode': 'Invalid or expired code',
    'verify.noCodeReceived': "Didn't receive the code?",
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.totalProfit': 'Total Profit',
    'dashboard.totalTrades': 'Total Trades',
    'dashboard.winRate': 'Win Rate',
    'dashboard.activeStrategies': 'Active Strategies',
    'dashboard.recentTrades': 'Recent Trades',
    'dashboard.noTrades': 'No recent trades',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.strategies': 'Strategies',
    'nav.trades': 'Trades',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.apiKeys': 'API Keys',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Info',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
  }
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'ro'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
  }, [language])

  const t = (key, params = {}) => {
    let text = translations[language]?.[key] || translations['en']?.[key] || key
    
    // Replace params
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param])
    })
    
    return text
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ro' ? 'en' : 'ro')
  }

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isRomanian: language === 'ro',
    isEnglish: language === 'en'
  }

  return (
    <i18nContext.Provider value={value}>
      {children}
    </i18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(i18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

export default i18nContext