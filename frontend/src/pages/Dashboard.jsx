import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import StrategySelector from '../components/StrategySelector'
import { TrendingUp, TrendingDown, DollarSign, Activity, Save, Check, AlertCircle } from 'lucide-react'

function Dashboard() {
  const { user } = useAuth()
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const [currentConfig, setCurrentConfig] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Încarcă configurația salvată la montare
  useEffect(() => {
    loadUserConfig()
  }, [])

  const loadUserConfig = async () => {
    try {
      const response = await api.get('/strategy-config/my-strategy')
      if (response.data.has_strategy) {
        setCurrentConfig(response.data)
        // Setează strategia selectată dacă există
        if (response.data.strategy) {
          setSelectedStrategy(response.data.strategy)
        }
      }
    } catch (err) {
      console.error('Error loading config:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveStrategy = async () => {
    if (!selectedStrategy) return
    
    setSaving(true)
    setError('')
    setSaveSuccess(false)

    try {
      await api.post('/strategy-config/', {
        selected_strategy_id: selectedStrategy.id,
        strategy_params: {}, // Default params
        trading_pair: 'BTCUSDT',
        timeframe: '1h',
        investment_amount: '100',
        max_position_size: '10',
        stop_loss_percent: '5',
        take_profit_percent: '10'
      })
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Eroare la salvare')
    } finally {
      setSaving(false)
    }
  }

  const handleActivateStrategy = async () => {
    try {
      await api.post('/strategy-config/activate')
      loadUserConfig()
    } catch (err) {
      setError(err.response?.data?.detail || 'Eroare la activare')
    }
  }

  const handleDeactivateStrategy = async () => {
    try {
      await api.post('/strategy-config/deactivate')
      loadUserConfig()
    } catch (err) {
      setError(err.response?.data?.detail || 'Eroare la dezactivare')
    }
  }

  // Statistici mock pentru demonstrație
  const stats = [
    { label: 'Profit Total', value: '+12.5%', icon: TrendingUp, color: 'text-success-500' },
    { label: 'Pierdere Totală', value: '-2.1%', icon: TrendingDown, color: 'text-danger-500' },
    { label: 'Balance', value: '$10,250', icon: DollarSign, color: 'text-primary-500' },
    { label: 'Active Trades', value: '3', icon: Activity, color: 'text-yellow-500' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Bun venit, {user?.full_name || user?.email}!
          </p>
        </div>
        {currentConfig?.is_active && (
          <div className="flex items-center gap-2 px-4 py-2 bg-success-500/20 border border-success-500/50 rounded-full">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            <span className="text-success-400 text-sm font-medium">Bot Activ</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Selector */}
      <div className="space-y-4">
        <StrategySelector
          selectedStrategy={selectedStrategy}
          onStrategySelect={setSelectedStrategy}
        />

        {/* Save Button */}
        {selectedStrategy && (
          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveStrategy}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : saveSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Se salvează...' : saveSuccess ? 'Salvat!' : 'Salvează Strategia'}
            </button>

            {error && (
              <div className="flex items-center gap-2 text-danger-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trading Status */}
      {currentConfig?.has_strategy && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Status Trading</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${currentConfig.is_active ? 'bg-success-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className={currentConfig.is_active ? 'text-success-500 font-medium' : 'text-gray-400'}>
                  {currentConfig.is_active ? 'Bot Activ' : 'Bot Inactiv'}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Strategia ta: <span className="text-white font-medium">{currentConfig.strategy?.name}</span>
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Pereche: {currentConfig.config?.trading_pair} | Timeframe: {currentConfig.config?.timeframe}
              </p>
            </div>
            
            {currentConfig.is_active ? (
              <button onClick={handleDeactivateStrategy} className="btn-danger">
                Oprește Bot
              </button>
            ) : (
              <button onClick={handleActivateStrategy} className="btn-success">
                Pornește Bot
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
