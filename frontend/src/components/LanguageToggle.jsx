import { useI18n } from '../context/i18nContext'
import { Globe } from 'lucide-react'

function LanguageToggle() {
  const { language, toggleLanguage, isRomanian } = useI18n()

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
      title={isRomanian ? 'Switch to English' : 'Schimbă în Română'}
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase">{language}</span>
    </button>
  )
}

export default LanguageToggle