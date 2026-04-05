import { useState, useEffect } from 'react'
import { strategiesApi } from '../services/api'
import { ChevronDown, Info, Check } from 'lucide-react'

function StrategySelector({ selectedStrategy, onStrategySelect }) {
  const [strategies, setStrategies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedInfo, setSelectedInfo] = useState(null)

  // Încarcă strategiile disponibile la montare
  useEffect(() => {
    loadStrategies()
  }, [])

  const loadStrategies = async () => {
    try {
      setLoading(true)
      const response = await strategiesApi.getAvailable()
      setStrategies(response.data)
      
      // Selectează prima strategie by default
      if (response.data.length > 0 && !selectedStrategy) {
        onStrategySelect(response.data[0])
      }
    } catch (err) {
      setError('Eroare la încărcarea strategiilor')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStrategyClick = (strategy) => {
    onStrategySelect(strategy)
    setSelectedInfo(strategy)
    setIsOpen(false)
  }

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-10 bg-gray-700 rounded-lg"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card border-danger-500">
        <p className="text-danger-500">{error}</p>
        <button onClick={loadStrategies} className="btn-primary mt-4">
          Reîncearcă
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dropdown Selector */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-primary-500" />
          Selectează Strategia de Trading
        </h3>

        <div className="relative">
          {/* Dropdown Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-left hover:border-primary-500 transition-colors"
          >
            <div>
              {selectedStrategy ? (
                <div>
                  <span className="font-medium text-white">{selectedStrategy.name}</span>
                  <p className="text-sm text-gray-400 mt-1">
                    {selectedStrategy.description.substring(0, 60)}...
                  </p>
                </div>
              ) : (
                <span className="text-gray-400">Alege o strategie...</span>
              )}
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-gray-700 border border-gray-600 rounded-lg shadow-xl max-h-96 overflow-y-auto">
              {strategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => handleStrategyClick(strategy)}
                  className={`w-full px-4 py-4 text-left hover:bg-gray-600 transition-colors border-b border-gray-600 last:border-0 ${
                    selectedStrategy?.id === strategy.id ? 'bg-gray-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{strategy.name}</span>
                        {selectedStrategy?.id === strategy.id && (
                          <Check className="w-4 h-4 text-success-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {strategy.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Box pentru strategia selectată */}
        {selectedStrategy && (
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <h4 className="font-medium text-primary-400 mb-2">
              {selectedStrategy.name}
            </h4>
            <p className="text-gray-300 text-sm mb-4">
              {selectedStrategy.description}
            </p>
            
            {/* Parametri strategie */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-400">Parametri configurabili:</h5>
              {Object.entries(selectedStrategy.params).map(([key, param]) => (
                <div
                  key={key}
                  className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-gray-300">{param.description}</span>
                  <span className="text-sm font-mono text-primary-400">
                    Default: {param.default}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sumar Strategii */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {strategies.map((strategy) => (
          <button
            key={strategy.id}
            onClick={() => handleStrategyClick(strategy)}
            className={`p-4 rounded-lg border transition-all ${
              selectedStrategy?.id === strategy.id
                ? 'bg-primary-600/20 border-primary-500'
                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
            }`}
          >
            <h4 className="font-medium text-sm text-white">{strategy.name}</h4>
            <p className="text-xs text-gray-400 mt-1">
              {Object.keys(strategy.params).length} parametri
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

export default StrategySelector
