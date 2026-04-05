import { useState, useEffect } from 'react'
import { strategiesApi } from '../services/api'
import { Play, Settings, Info, BarChart3 } from 'lucide-react'

function Strategies() {
  const [strategies, setStrategies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStrategy, setSelectedStrategy] = useState(null)

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
                    <p className="text-sm text-gray-400">ID: {strategy.id}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Info className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <p className="text-gray-300 text-sm mb-4">{strategy.description}</p>

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
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-primary-500" />
            <h3 className="text-xl font-semibold">Detalii: {selectedStrategy.name}</h3>
          </div>
          
          <p className="text-gray-300 mb-6">{selectedStrategy.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-3">Configurare Parametri</h4>
              <div className="space-y-3">
                {Object.entries(selectedStrategy.params).map(([key, param]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">{param.description}</p>
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
              <h4 className="font-medium text-white mb-3">Cum Funcționează</h4>
              <div className="bg-gray-700/50 p-4 rounded-lg text-sm text-gray-300 space-y-2">
                {selectedStrategy.id === 'rsi' && (
                  <>
                    <p>• <strong>Cumpărare:</strong> RSI &lt; nivel supravânzare (30)</p>
                    <p>• <strong>Vânzare:</strong> RSI &gt; nivel supracumpărare (70)</p>
                    <p>• Indicator clasic de momentum</p>
                  </>
                )}
                {selectedStrategy.id === 'macd' && (
                  <>
                    <p>• <strong>Cumpărare:</strong> MACD trece peste linia de semnal</p>
                    <p>• <strong>Vânzare:</strong> MACD trece sub linia de semnal</p>
                    <p>• Urmărește trendul și momentumul</p>
                  </>
                )}
                {selectedStrategy.id === 'ema_cross' && (
                  <>
                    <p>• <strong>Golden Cross:</strong> EMA rapidă &gt; EMA lentă</p>
                    <p>• <strong>Death Cross:</strong> EMA rapidă &lt; EMA lentă</p>
                    <p>• Ideal pentru identificarea trendurilor lungi</p>
                  </>
                )}
                {selectedStrategy.id === 'bollinger' && (
                  <>
                    <p>• <strong>Cumpărare:</strong> Preț atinge banda inferioară</p>
                    <p>• <strong>Vânzare:</strong> Preț atinge banda superioară</p>
                    <p>• Indicator de volatilitate și revenire la medie</p>
                  </>
                )}
                {selectedStrategy.id === 'grid' && (
                  <>
                    <p>• Plasează ordere la intervale fixe</p>
                    <p>• <strong>Cumpără jos</strong> și <strong>vinde sus</strong></p>
                    <p>• Ideal pentru piețe laterale (range-bound)</p>
                  </>
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
