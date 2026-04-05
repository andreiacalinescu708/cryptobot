import { useState, useEffect } from 'react'
import api, { strategiesApi } from '../services/api'
import { 
  Play, Settings, Info, BarChart3, AlertTriangle, Shield, 
  TrendingUp, X, Check, DollarSign, Clock, Percent 
} from 'lucide-react'

function Strategies() {
  const [strategies, setStrategies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const [riskInfo, setRiskInfo] = useState(null)
  const [myStrategy, setMyStrategy] = useState(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [configuringStrategy, setConfiguringStrategy] = useState(null)
  const [activating, setActivating] = useState(false)
  const [message, setMessage] = useState(null)
  
  // Form state pentru configurare
  const [configForm, setConfigForm] = useState({
    trading_pair: 'BTCUSDT',
    timeframe: '1h',
    investment_amount: 100,
    strategy_params: {},
    max_position_size: 10,
    stop_loss_percent: 5,
    take_profit_percent: 10
  })

  useEffect(() => {
    loadStrategies()
    loadMyStrategy()
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

  const loadMyStrategy = async () => {
    try {
      const response = await api.get('/strategy-config/my-strategy')
      setMyStrategy(response.data)
    } catch (err) {
      console.error('Eroare la încărcarea strategiei:', err)
    }
  }

  const loadRiskInfo = async (strategyId) => {
    try {
      const response = await api.get(`/strategies/${strategyId}/risk-info`)
      if (response.data) {
        setRiskInfo(response.data)
        // Auto-populate risk config
        setConfigForm(prev => ({
          ...prev,
          stop_loss_percent: response.data.risk_config.stop_loss_pct,
          take_profit_percent: response.data.risk_config.take_profit_pct,
          max_position_size: response.data.risk_config.max_position_size_pct
        }))
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

  const openConfigModal = (strategy, e) => {
    e.stopPropagation()
    setConfiguringStrategy(strategy)
    // Initialize strategy params with defaults
    const defaultParams = {}
    Object.entries(strategy.params).forEach(([key, param]) => {
      defaultParams[key] = param.default
    })
    setConfigForm(prev => ({
      ...prev,
      strategy_params: defaultParams
    }))
    setShowConfigModal(true)
  }

  const closeConfigModal = () => {
    setShowConfigModal(false)
    setConfiguringStrategy(null)
  }

  const handleParamChange = (key, value) => {
    setConfigForm(prev => ({
      ...prev,
      strategy_params: {
        ...prev.strategy_params,
        [key]: parseFloat(value)
      }
    }))
  }

  const handleFormChange = (field, value) => {
    setConfigForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveConfig = async () => {
    try {
      await api.post('/strategy-config/', {
        selected_strategy_id: configuringStrategy.id,
        ...configForm
      })
      setMessage({ type: 'success', text: 'Configurare salvată cu succes!' })
      closeConfigModal()
      loadMyStrategy()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Eroare la salvare' })
    }
  }

  const activateStrategy = async (strategy, e) => {
    e.stopPropagation()
    
    // Verifică dacă are deja o strategie configurată
    if (!myStrategy?.has_strategy || myStrategy?.strategy?.id !== strategy.id) {
      // Deschide modal de configurare
      openConfigModal(strategy, e)
      return
    }

    setActivating(true)
    try {
      const response = await api.post('/strategy-config/activate')
      setMessage({ type: 'success', text: 'Strategie activată cu succes!' })
      loadMyStrategy()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      if (err.response?.status === 404) {
        // Nu are config, deschide modal
        openConfigModal(strategy, e)
      } else {
        setMessage({ type: 'error', text: err.response?.data?.detail || 'Eroare la activare' })
      }
    } finally {
      setActivating(false)
    }
  }

  const deactivateStrategy = async () => {
    try {
      await api.post('/strategy-config/deactivate')
      setMessage({ type: 'success', text: 'Strategie dezactivată!' })
      loadMyStrategy()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: 'Eroare la dezactivare' })
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

  const isStrategyActive = (strategyId) => {
    return myStrategy?.has_strategy && 
           myStrategy?.strategy?.id === strategyId && 
           myStrategy?.is_active
  }

  const isStrategyConfigured = (strategyId) => {
    return myStrategy?.has_strategy && myStrategy?.strategy?.id === strategyId
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Strategii de Trading</h1>
        <p className="text-gray-400 mt-1">
          Explorează și configurează cele 5 strategii disponibile
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* My Active Strategy */}
      {myStrategy?.has_strategy && (
        <div className="card border-primary-500 bg-primary-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{getStrategyIcon(myStrategy.strategy.id)}</span>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Strategia Ta: {myStrategy.strategy.name}
                </h3>
                <p className="text-sm text-gray-400">
                  Pereche: {myStrategy.config.trading_pair} | 
                  Timeframe: {myStrategy.config.timeframe} | 
                  Investiție: ${myStrategy.config.investment_amount}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${myStrategy.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {myStrategy.is_active ? '● Activă' : '○ Inactivă'}
              </span>
              {myStrategy.is_active ? (
                <button 
                  onClick={deactivateStrategy}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  Dezactivează
                </button>
              ) : (
                <button 
                  onClick={() => activateStrategy(myStrategy.strategy, { stopPropagation: () => {} })}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Reactivează
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Strategy Cards */}
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
              } ${isStrategyActive(strategy.id) ? 'border-green-500 bg-green-500/5' : ''}`}
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
                      {isStrategyActive(strategy.id) && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                          ● Activă
                        </span>
                      )}
                      {isStrategyConfigured(strategy.id) && !isStrategyActive(strategy.id) && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                          Configurată
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedStrategy(strategy)
                  }}
                >
                  <Info className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <p className="text-gray-300 text-sm mb-4">{strategy.short_description || strategy.description}</p>

              {/* Parametri */}
              <div className="space-y-2 mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Parametri</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(strategy.params).slice(0, 3).map(([key, param]) => (
                    <span
                      key={key}
                      className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                    >
                      {key}: {param.default}
                    </span>
                  ))}
                  {Object.keys(strategy.params).length > 3 && (
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400">
                      +{Object.keys(strategy.params).length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button 
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${
                    isStrategyActive(strategy.id)
                      ? 'bg-green-500/20 text-green-400 cursor-default'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                  onClick={(e) => activateStrategy(strategy, e)}
                  disabled={activating || isStrategyActive(strategy.id)}
                >
                  {isStrategyActive(strategy.id) ? (
                    <>
                      <Check className="w-4 h-4" />
                      Activată
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      {activating ? 'Se activează...' : 'Activează'}
                    </>
                  )}
                </button>
                <button 
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  onClick={(e) => openConfigModal(strategy, e)}
                >
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
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium border ${getRiskLevelColor(selectedStrategy.risk_level)}`}>
                {getRiskLevelIcon(selectedStrategy.risk_level)}
                {selectedStrategy.risk_level === 'LOW' ? 'Risc Scăzut' : 
                 selectedStrategy.risk_level === 'HIGH' ? 'Risc Ridicat' : 'Risc Mediu'}
              </span>
            </div>
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
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-3">Cum Funcționează</h4>
              <div className="bg-gray-700/50 p-4 rounded-lg text-sm text-gray-300 space-y-2">
                {selectedStrategy.beginner_description?.split('\n').slice(0, 10).map((line, i) => (
                  <p key={i}>{line}</p>
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

      {/* Config Modal */}
      {showConfigModal && configuringStrategy && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  Configurează: {configuringStrategy.name}
                </h3>
                <button 
                  onClick={closeConfigModal}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Trading Settings */}
              <div>
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary-500" />
                  Setări Trading
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Pereche Trading</label>
                    <select 
                      className="input w-full"
                      value={configForm.trading_pair}
                      onChange={(e) => handleFormChange('trading_pair', e.target.value)}
                    >
                      <option value="BTCUSDT">BTC/USDT</option>
                      <option value="ETHUSDT">ETH/USDT</option>
                      <option value="SOLUSDT">SOL/USDT</option>
                      <option value="BNBUSDT">BNB/USDT</option>
                      <option value="ADAUSDT">ADA/USDT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Timeframe</label>
                    <select 
                      className="input w-full"
                      value={configForm.timeframe}
                      onChange={(e) => handleFormChange('timeframe', e.target.value)}
                    >
                      <option value="5m">5 minute</option>
                      <option value="15m">15 minute</option>
                      <option value="1h">1 oră</option>
                      <option value="4h">4 ore</option>
                      <option value="1d">1 zi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Investment */}
              <div>
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  Investiție
                </h4>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Sumă Investită (USDT)
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    value={configForm.investment_amount}
                    onChange={(e) => handleFormChange('investment_amount', parseFloat(e.target.value))}
                    min={10}
                    step={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Aceasta este suma totală alocată pentru această strategie
                  </p>
                </div>
              </div>

              {/* Strategy Params */}
              <div>
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-yellow-500" />
                  Parametri Strategie
                </h4>
                <div className="space-y-3">
                  {Object.entries(configuringStrategy.params).map(([key, param]) => (
                    <div key={key} className="flex items-center justify-between bg-gray-700/30 p-3 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">{param.description || key}</p>
                        <p className="text-xs text-gray-400">
                          Min: {param.min} | Max: {param.max} | Default: {param.default}
                        </p>
                      </div>
                      <input
                        type="number"
                        value={configForm.strategy_params[key] || param.default}
                        onChange={(e) => handleParamChange(key, e.target.value)}
                        min={param.min}
                        max={param.max}
                        step={param.step || 1}
                        className="input w-24 text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Management */}
              <div>
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  Risk Management
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Stop Loss %</label>
                    <input
                      type="number"
                      className="input w-full text-red-400"
                      value={configForm.stop_loss_percent}
                      onChange={(e) => handleFormChange('stop_loss_percent', parseFloat(e.target.value))}
                      min={1}
                      max={50}
                      step={0.5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Take Profit %</label>
                    <input
                      type="number"
                      className="input w-full text-green-400"
                      value={configForm.take_profit_percent}
                      onChange={(e) => handleFormChange('take_profit_percent', parseFloat(e.target.value))}
                      min={1}
                      max={100}
                      step={0.5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Max Poziție %</label>
                    <input
                      type="number"
                      className="input w-full"
                      value={configForm.max_position_size}
                      onChange={(e) => handleFormChange('max_position_size', parseFloat(e.target.value))}
                      min={1}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-3">
              <button 
                onClick={closeConfigModal}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Anulează
              </button>
              <button 
                onClick={saveConfig}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Salvează & Activează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Strategies
