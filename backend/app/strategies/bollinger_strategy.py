import pandas as pd
import numpy as np
from typing import Dict, Any
from .base import BaseStrategy


class BollingerBandsStrategy(BaseStrategy):
    """
    Bollinger Bands Strategy
    
    Cumpără când prețul atinge banda inferioară (supravânzare)
    Vinde când prețul atinge banda superioară (supracumpărare)
    Banda de mijloc este SMA (Simple Moving Average)
    """
    
    def __init__(self, params: Dict[str, Any] = None):
        super().__init__(
            name="Bollinger Bands Strategy",
            description="Strategie bazată pe benzile Bollinger. Cumpără la banda inferioară, vinde la banda superioară. Indicator de volatilitate.",
            params=params
        )
        self.params = params or self.get_default_params()
    
    def get_default_params(self) -> Dict[str, Any]:
        return {
            "period": {
                "type": "integer",
                "default": 20,
                "min": 10,
                "max": 50,
                "description": "Perioada SMA"
            },
            "std_dev": {
                "type": "float",
                "default": 2.0,
                "min": 1.0,
                "max": 4.0,
                "step": 0.5,
                "description": "Numărul de deviații standard"
            }
        }
    
    def calculate_bollinger(self, data: pd.DataFrame) -> tuple:
        """Calculează benzile Bollinger."""
        period = self.params.get("period", {}).get("default", 20)
        std_dev = self.params.get("std_dev", {}).get("default", 2.0)
        
        sma = data['close'].rolling(window=period).mean()
        std = data['close'].rolling(window=period).std()
        
        upper_band = sma + (std * std_dev)
        lower_band = sma - (std * std_dev)
        
        return sma, upper_band, lower_band
    
    def analyze(self, data: pd.DataFrame) -> Dict[str, Any]:
        sma, upper_band, lower_band = self.calculate_bollinger(data)
        
        current_price = data['close'].iloc[-1]
        current_sma = sma.iloc[-1]
        current_upper = upper_band.iloc[-1]
        current_lower = lower_band.iloc[-1]
        
        # B% indicator (0 = lower band, 1 = upper band)
        b_percent = (current_price - current_lower) / (current_upper - current_lower) if current_upper != current_lower else 0.5
        
        signal = "HOLD"
        strength = 0.0
        
        # Cumpără la banda inferioară sau sub
        if current_price <= current_lower:
            signal = "BUY"
            strength = min(abs(current_lower - current_price) / current_price * 10, 1.0)
        
        # Vinde la banda superioară sau peste
        elif current_price >= current_upper:
            signal = "SELL"
            strength = min(abs(current_price - current_upper) / current_price * 10, 1.0)
        
        return {
            "signal": signal,
            "strength": strength,
            "details": {
                "price": round(current_price, 2),
                "sma": round(current_sma, 2),
                "upper_band": round(current_upper, 2),
                "lower_band": round(current_lower, 2),
                "b_percent": round(b_percent, 4),
                "bandwidth": round((current_upper - current_lower) / current_sma, 4)
            }
        }
