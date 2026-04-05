from .base import BaseStrategy
from .rsi_strategy import RSIStrategy
from .macd_strategy import MACDStrategy
from .ema_cross_strategy import EMACrossStrategy
from .bollinger_strategy import BollingerBandsStrategy
from .grid_strategy import GridStrategy

# Lista tuturor strategiilor disponibile
AVAILABLE_STRATEGIES = {
    "rsi": RSIStrategy,
    "macd": MACDStrategy,
    "ema_cross": EMACrossStrategy,
    "bollinger": BollingerBandsStrategy,
    "grid": GridStrategy,
}

__all__ = [
    "BaseStrategy",
    "RSIStrategy", 
    "MACDStrategy",
    "EMACrossStrategy",
    "BollingerBandsStrategy",
    "GridStrategy",
    "AVAILABLE_STRATEGIES",
]
