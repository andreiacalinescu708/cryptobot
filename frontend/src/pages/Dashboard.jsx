import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import StrategySelector from '../components/StrategySelector'
import { TrendingUp, TrendingDown, DollarSign, Activity, Save, Check, AlertCircle, Wallet, BarChart3, Clock } from 'lucide-react'

function Dashboard() {
  const { user } = useAuth()
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const [currentConfig, setCurrentConfig] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  // Încarcă datele reale la montare
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load dashboard stats
      const statsResponse = await api.get('/dashboard/stats')
      setStats(statsResponse.data)
      
      // Load strategy config
      const configResponse = await api.get('/strategy-config/my-strategy')
      if (configResponse.data.has_strategy) {
        setCurrentConfig(configResponse.data)
        if (configResponse.data.strategy) {
          setSelectedStrategy(configResponse.data.strategy)
        }
      }
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError('Eroare la încărcarea datelor')
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
        strategy_params: {},
        trading_pair: 'BTCUSDT',
        timeframe: '1h',
        investment_amount: '100',
        max_position_size: '10',
        stop_loss_percent: '5',
        take_profit_percent: '10'
      })
      
      setSaveSuccess(true)
      loadDashboardData() // Reload stats
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
      loadDashboardData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Eroare la activare')
    }
  }

  const handleDeactivateStrategy = async () => {
    try {
      await api.post('/strategy-config/deactivate')
      loadDashboardData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Eroare la dezactivare')
    }
  }

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
        {stats?.strategy?.is_active && (
          <div className="flex items-center gap-2 px-4 py-2 bg-success-500/20 border border-success-500/50 rounded-full">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            <span className="text-success-400 text-sm font-medium">Bot Activ</span>
          </div>
        )}
      </div>

      {/* Stats Grid - DATE REALE */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Trades */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Tranzacții</p>
                <p className="text-2xl font-bold mt-1 text-white">
                  {stats.trading_stats.total_trades}
                </p>
              </div>
              <div className="p-3 bg-primary-500/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          </div>

          {/* Win Rate */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className={`text-2xl font-bold mt-1 ${stats.trading_stats.win_rate >= 50 ? 'text-success-500' : 'text-yellow-500'}`}>
                  {stats.trading_stats.win_rate}%
                </p>
              </div>
              <div className="p-3 bg-success-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-success-500" />
              </div>
            </div>
          </div>

          {/* Net P&L */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Profit/Pierdere Net</p>
                <p className={`text-2xl font-bold mt-1 ${stats.trading_stats.net_pnl >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
                  {stats.trading_stats.net_pnl >= 0 ? '+' : ''}{stats.trading_stats.net_pnl.toFixed(2)} USDT
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stats.trading_stats.net_pnl >= 0 ? 'bg-success-500/20' : 'bg-danger-500/20'}`}>
                {stats.trading_stats.net_pnl >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-success-500" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-danger-500" />
                )}
              </div>
            </div>
          </div>

          {/* Active Trades */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tranzacții Active</p>
                <p className="text-2xl font-bold mt-1 text-yellow-500">
                  {stats.trading_stats.active_trades}
                </p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strategy Config Section */}
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

      {/* Trading Status & Recent Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Trading */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Status Trading</h3>
          
          {stats?.strategy?.has_config ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stats.strategy.is_active ? 'bg-success-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className={stats.strategy.is_active ? 'text-success-500 font-medium' : 'text-gray-400'}>
                  {stats.strategy.is_active ? 'Bot Activ' : 'Bot Inactiv'}
                </span>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                <p className="text-gray-400 text-sm">Strategie: <span className="text-white font-medium">{stats.strategy.selected_strategy}</span></p>
                <p className="text-gray-400 text-sm">Pereche: <span className="text-white">{stats.strategy.trading_pair}</span></p>
                <p className="text-gray-400 text-sm">Timeframe: <span className="text-white">{stats.strategy.timeframe}</span></p>
              </div>

              {stats.strategy.is_active ? (
                <button onClick={handleDeactivateStrategy} className="btn-danger w-full">
                  Oprește Bot
                </button>
              ) : (
                <button onClick={handleActivateStrategy} className="btn-success w-full">
                  Pornește Bot
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>Nu ai configurat nicio strategie încă.</p>
              <p className="text-sm mt-2">Selectează o strategie de mai sus pentru a începe.</p>
            </div>
          )}
        </div>

        {/* Recent Trades */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Tranzacții Recente</h3>
          
          {stats?.recent_trades && stats.recent_trades.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_trades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{trade.trading_pair}</p>
                    <p className="text-sm text-gray-400">{trade.side} • {trade.status}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${trade.profit_loss && trade.profit_loss > 0 ? 'text-success-500' : trade.profit_loss && trade.profit_loss < 0 ? 'text-danger-500' : 'text-gray-400'}`}>
                      {trade.profit_loss ? `${trade.profit_loss > 0 ? '+' : ''}${trade.profit_loss.toFixed(2)} USDT` : 'Pending'}
                    </p>
                    <p className="text-sm text-gray-400">{new Date(trade.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>Nu există tranzacții încă.</p>
              <p className="text-sm mt-2">Tranzacțiile vor apărea aici când botul începe să tranzacționeze.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
