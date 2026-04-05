import { useState, useEffect } from 'react'
import { strategiesApi } from '../services/api'
import { Play, Settings, Info, BarChart3, AlertTriangle, Shield, TrendingUp } from 'lucide-react'

function Strategies() {
  const [strategies, setStrategies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const [riskInfo, setRiskInfo] = useState(null)

  useEffect(() => {
    loadStrategies()
  }, [])

  const loadStrategies = async () => {
    try {
      const response = await strategiesApi.getAvailable()
      setStrategies(response.data)
    } catch (err) {
      console.error('Eroare la încărcarea strategiilor:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStrategyIcon = (id) => {
    const icons = {
      rsi: '📊',
      macd: '📈',
      ema_cross: '⚡',
      bollinger: '🎯',
      grid: '🔲',
    }
    return icons[id] || '🤖'
  }

  const getRiskLevelColor = (level) => {
    const colors = {
      LOW: 'bg-green-500/20 text-green-400 border-green-500/50',
      MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      HIGH: 'bg-red-500/20 text-red-400 border-red-500/50',
    }
    return colors[level] || colors.MEDIUM
  }

  const getRiskLevelIcon = (level) => {
    if (level === 'LOW') return <Shield className="w-4 h-4" />
    if (level === 'HIGH') return <AlertTriangle className="w-4 h-4" />
    return <TrendingUp className="w-4 h-4" />
  }

  const loadRiskInfo = async (strategyId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/strategies/${strategyId}/risk-info`)
      if (response.ok) {
        const data = await response.json()
        setRiskInfo(data)
      }
    } catch (err) {
      console.error('Eroare la încărcarea risk info:', err)
    }
  }

  useEffect(() => {
    if (selectedStrategy) {
      loadRiskInfo(selectedStrategy.id)
    }
  }, [selectedStrategy])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Strategii de Trading</h1>
        <p className="text-gray-400 mt-1">
          Explorează și configurează cele 5 strategii disponibile
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card animate-pulse h-48"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className={`card hover:border-primary-500 transition-colors cursor-pointer ${
                selectedStrategy?.id === strategy.id ? 'border-primary-500' : ''
              }`}
              onClick={() => setSelectedStrategy(strategy)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getStrategyIcon(strategy.id)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{strategy.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getRiskLevelColor(strategy.risk_level)}`}>
                        {getRiskLevelIcon(strategy.risk_level)}
                        {strategy.risk_level === 'LOW' ? 'Risc Scăzut' : 
                         strategy.risk_level === 'HIGH' ? 'Risc Ridicat' : 'Risc Mediu'}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Info className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <p className="text-gray-300 text-sm mb-4">{strategy.short_description || strategy.description}</p>

              {/* Parametri */}
              <div className="space-y-2 mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Parametri</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(strategy.params).map(([key, param]) => (
                    <span
                      key={key}
                      className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                    >
                      {key}: {param.default}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" />
                  Activează
                </button>
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Strategy Detail Panel */}
      {selectedStrategy && (
        <div className="card border-primary-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-primary-500" />
              <h3 className="text-xl font-semibold">Detalii: {selectedStrategy.name}</h3>
            </div>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium border ${getRiskLevelColor(selectedStrategy.risk_level)}`}>
              {getRiskLevelIcon(selectedStrategy.risk_level)}
              {selectedStrategy.risk_level === 'LOW' ? 'Risc Scăzut' : 
               selectedStrategy.risk_level === 'HIGH' ? 'Risc Ridicat' : 'Risc Mediu'}
            </span>
          </div>
          
          <p className="text-gray-300 mb-6">{selectedStrategy.beginner_description || selectedStrategy.description}</p>

          {/* Risk Management Info */}
          {riskInfo && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-500" />
                Risk Management Automat
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-700/30 p-3 rounded">
                  <p className="text-gray-400">Stop Loss</p>
                  <p className="text-red-400 font-semibold">-{riskInfo.risk_config.stop_loss_pct}%</p>
                </div>
                <div className="bg-gray-700/30 p-3 rounded">
                  <p className="text-gray-400">Take Profit</p>
                  <p className="text-green-400 font-semibold">+{riskInfo.risk_config.take_profit_pct}%</p>
                </div>
                <div className="bg-gray-700/30 p-3 rounded">
                  <p className="text-gray-400">Max Poziție</p>
                  <p className="text-white font-semibold">{riskInfo.risk_config.max_position_size_pct}%</p>
                </div>
                <div className="bg-gray-700/30 p-3 rounded">
                  <p className="text-gray-400">Risk/Reward</p>
                  <p className="text-white font-semibold">1:{(riskInfo.risk_config.take_profit_pct / riskInfo.risk_config.stop_loss_pct).toFixed(1)}</p>
                </div>
              </div>
              {riskInfo.risk_config.trailing_stop && (
                <p className="text-xs text-gray-400 mt-2">
                  ✓ Trailing stop activat la +{riskInfo.risk_config.trailing_stop_activation}% profit
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-3">Configurare Parametri</h4>
              <div className="space-y-3">
                {Object.entries(selectedStrategy.params).map(([key, param]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">{param.description || key}</p>
                      <p className="text-xs text-gray-400">
                        Range: {param.min} - {param.max}
                      </p>
                    </div>
                    <input
                      type="number"
                      defaultValue={param.default}
                      min={param.min}
                      max={param.max}
                      className="input w-24 text-right"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-white mb-3">Recomandări</h4>
              <div className="bg-gray-700/50 p-4 rounded-lg text-sm text-gray-300 space-y-2">
                <p><strong>{selectedStrategy.recommended_for || 'Recomandat pentru traderi'}</strong></p>
                {selectedStrategy.risk_details && (
                  <>
                    <p>• <strong>Win Rate:</strong> {selectedStrategy.risk_details.win_rate}</p>
                    <p>• <strong>Timeframe:</strong> {selectedStrategy.risk_details.timeframe}</p>
                    <p>• <strong>Pierdere Max:</strong> {selectedStrategy.risk_details.max_loss}</p>
                  </>
                )}
                {selectedStrategy.id === 'grid' && (
                  <p className="text-red-400 mt-2">
                    ⚠️ Atenție: Grid Trading poate acumula pierderi mari în trenduri puternice!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Strategies
