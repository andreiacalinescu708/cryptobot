import { useState } from 'react'
import { Key, Bell, Shield, Wallet } from 'lucide-react'

function Settings() {
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [notifications, setNotifications] = useState({
    trades: true,
    profit: true,
    errors: true,
  })

  const handleSave = () => {
    // Aici se va salva în backend
    alert('Setări salvate!')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Setări</h1>
        <p className="text-gray-400 mt-1">
          Configurează API keys și preferințele contului
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Binance API Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Key className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Binance API</h3>
              <p className="text-sm text-gray-400">Conectează-te la Binance</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Introdu API Key"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Secret
              </label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Introdu API Secret"
                className="input w-full"
              />
            </div>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                ⚠️ Asigură-te că API key-ul are permisiuni de citire și trading, dar fără permisiune de withdraw.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Bell className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Notificări</h3>
              <p className="text-sm text-gray-400">Configurează alertele</p>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <span className="text-gray-300 capitalize">
                  {key === 'trades' ? 'Trades Executate' : 
                   key === 'profit' ? 'Profit/Pierdere' : 'Erori'}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setNotifications({ ...notifications, [key]: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-success-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-success-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Securitate</h3>
              <p className="text-sm text-gray-400">Setări de securitate</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">2FA (Two Factor Auth)</span>
                <span className="px-2 py-1 bg-success-500/20 text-success-500 text-xs rounded">
                  Activat
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Protejează contul cu autentificare în doi pași
              </p>
            </div>

            <div className="p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Criptare API Keys</span>
                <span className="px-2 py-1 bg-success-500/20 text-success-500 text-xs rounded">
                  AES-256
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Cheile API sunt criptate în baza de date
              </p>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Wallet className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Plăți (Crypto.com)</h3>
              <p className="text-sm text-gray-400">Gestionează abonamentul</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-300">Plan Curent</span>
                <span className="px-3 py-1 bg-primary-500 text-white text-sm rounded-full">
                  Pro
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Acces la toate strategiile și perechile de trading
              </p>
              <p className="text-lg font-semibold text-white">
                $29<span className="text-sm text-gray-400">/lună</span>
              </p>
            </div>

            <button className="w-full py-2 border border-purple-500 text-purple-400 rounded-lg hover:bg-purple-500/10 transition-colors">
              Gestionează Abonamentul
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary px-8">
          Salvează Setările
        </button>
      </div>
    </div>
  )
}

export default Settings
