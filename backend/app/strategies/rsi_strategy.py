import pandas as pd
import numpy as np
from typing import Dict, Any
from .base import BaseStrategy


class RSIStrategy(BaseStrategy):
    """
    RSI (Relative Strength Index) Strategy
    
    Cumpără când RSI < oversold (default: 30)
    Vinde când RSI > overbought (default: 70)
    """
    
    def __init__(self, params: Dict[str, Any] = None):
        super().__init__(
            name="RSI Strategy",
            description="Strategie bazată pe indicatorul RSI. Cumpără în zona de supravânzare (RSI < 30) și vinde în zona de supracumpărare (RSI > 70).",
            params=params
        )
        self.params = params or self.get_default_params()
    
    def get_default_params(self) -> Dict[str, Any]:
        return {
            "period": {
                "type": "integer",
                "default": 14,
                "min": 5,
                "max": 50,
                "description": "Perioada RSI"
            },
            "oversold": {
                "type": "integer", 
                "default": 30,
                "min": 10,
                "max": 40,
                "description": "Nivel supravânzare (cumpărare)"
            },
            "overbought": {
                "type": "integer",
                "default": 70,
                "min": 60,
                "max": 90,
                "description": "Nivel supracumpărare (vânzare)"
            }
        }
    
    def calculate_rsi(self, data: pd.DataFrame, period: int = 14) -> pd.Series:
        """Calculează RSI pentru datele date."""
        close = data['close']
        delta = close.diff()
        
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    def analyze(self, data: pd.DataFrame) -> Dict[str, Any]:
        period = self.params.get("period", {}).get("default", 14)
        oversold = self.params.get("oversold", {}).get("default", 30)
        overbought = self.params.get("overbought", {}).get("default", 70)
        
        rsi = self.calculate_rsi(data, period)
        current_rsi = rsi.iloc[-1]
        
        signal = "HOLD"
        strength = 0.0
        
        if current_rsi < oversold:
            signal = "BUY"
            strength = (oversold - current_rsi) / oversold
        elif current_rsi > overbought:
            signal = "SELL"
            strength = (current_rsi - overbought) / (100 - overbought)
        
        return {
            "signal": signal,
            "strength": min(strength, 1.0),
            "details": {
                "rsi_value": round(current_rsi, 2),
                "oversold": oversold,
                "overbought": overbought,
                "period": period
            }
        }
