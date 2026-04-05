import pandas as pd
import numpy as np
from typing import Dict, Any
from .base import BaseStrategy


class MACDStrategy(BaseStrategy):
    """
    MACD (Moving Average Convergence Divergence) Strategy
    
    Cumpără când MACD trece deasupra liniei de semnal (bullish crossover)
    Vinde când MACD trece sub linia de semnal (bearish crossover)
    """
    
    def __init__(self, params: Dict[str, Any] = None):
        super().__init__(
            name="MACD Strategy",
            description="Strategie bazată pe MACD. Cumpără la crossover bullish (MACD trece peste semnal) și vinde la crossover bearish.",
            params=params
        )
        self.params = params or self.get_default_params()
    
    def get_default_params(self) -> Dict[str, Any]:
        return {
            "fast_period": {
                "type": "integer",
                "default": 12,
                "min": 5,
                "max": 20,
                "description": "Perioada EMA rapidă"
            },
            "slow_period": {
                "type": "integer",
                "default": 26,
                "min": 15,
                "max": 50,
                "description": "Perioada EMA lentă"
            },
            "signal_period": {
                "type": "integer",
                "default": 9,
                "min": 5,
                "max": 15,
                "description": "Perioada liniei de semnal"
            }
        }
    
    def calculate_macd(self, data: pd.DataFrame) -> tuple:
        """Calculează MACD, semnal și histograma."""
        fast = self.params.get("fast_period", {}).get("default", 12)
        slow = self.params.get("slow_period", {}).get("default", 26)
        signal = self.params.get("signal_period", {}).get("default", 9)
        
        ema_fast = data['close'].ewm(span=fast, adjust=False).mean()
        ema_slow = data['close'].ewm(span=slow, adjust=False).mean()
        
        macd_line = ema_fast - ema_slow
        signal_line = macd_line.ewm(span=signal, adjust=False).mean()
        histogram = macd_line - signal_line
        
        return macd_line, signal_line, histogram
    
    def analyze(self, data: pd.DataFrame) -> Dict[str, Any]:
        macd_line, signal_line, histogram = self.calculate_macd(data)
        
        current_macd = macd_line.iloc[-1]
        current_signal = signal_line.iloc[-1]
        prev_macd = macd_line.iloc[-2]
        prev_signal = signal_line.iloc[-2]
        
        signal = "HOLD"
        strength = 0.0
        
        # Bullish crossover: MACD trece deasupra semnalului
        if prev_macd <= prev_signal and current_macd > current_signal:
            signal = "BUY"
            strength = abs(current_macd - current_signal) / abs(current_signal) if current_signal != 0 else 0.5
        
        # Bearish crossover: MACD trece sub semnal
        elif prev_macd >= prev_signal and current_macd < current_signal:
            signal = "SELL"
            strength = abs(current_macd - current_signal) / abs(current_signal) if current_signal != 0 else 0.5
        
        return {
            "signal": signal,
            "strength": min(strength, 1.0),
            "details": {
                "macd": round(current_macd, 4),
                "signal_line": round(current_signal, 4),
                "histogram": round(histogram.iloc[-1], 4),
                "trend": "bullish" if current_macd > current_signal else "bearish"
            }
        }
