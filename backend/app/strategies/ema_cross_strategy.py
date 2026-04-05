import pandas as pd
import numpy as np
from typing import Dict, Any
from .base import BaseStrategy


class EMACrossStrategy(BaseStrategy):
    """
    EMA Cross Strategy (Golden Cross / Death Cross)
    
    Cumpără când EMA rapidă trece deasupra EMA lente (Golden Cross)
    Vinde când EMA rapidă trece sub EMA lenta (Death Cross)
    """
    
    def __init__(self, params: Dict[str, Any] = None):
        super().__init__(
            name="EMA Cross Strategy",
            description="Strategie bazată pe încrucișarea EMA. Cumpără la Golden Cross (EMA rapidă > EMA lentă) și vinde la Death Cross.",
            params=params
        )
        self.params = params or self.get_default_params()
    
    def get_default_params(self) -> Dict[str, Any]:
        return {
            "fast_ema": {
                "type": "integer",
                "default": 50,
                "min": 10,
                "max": 100,
                "description": "Perioada EMA rapidă"
            },
            "slow_ema": {
                "type": "integer",
                "default": 200,
                "min": 50,
                "max": 500,
                "description": "Perioada EMA lentă"
            }
        }
    
    def analyze(self, data: pd.DataFrame) -> Dict[str, Any]:
        fast_period = self.params.get("fast_ema", {}).get("default", 50)
        slow_period = self.params.get("slow_ema", {}).get("default", 200)
        
        # Calculare EMA
        ema_fast = data['close'].ewm(span=fast_period, adjust=False).mean()
        ema_slow = data['close'].ewm(span=slow_period, adjust=False).mean()
        
        current_fast = ema_fast.iloc[-1]
        current_slow = ema_slow.iloc[-1]
        prev_fast = ema_fast.iloc[-2]
        prev_slow = ema_slow.iloc[-2]
        
        signal = "HOLD"
        strength = 0.0
        
        # Golden Cross: EMA rapidă trece deasupra EMA lente
        if prev_fast <= prev_slow and current_fast > current_slow:
            signal = "BUY"
            strength = abs(current_fast - current_slow) / current_slow
        
        # Death Cross: EMA rapidă trece sub EMA lenta
        elif prev_fast >= prev_slow and current_fast < current_slow:
            signal = "SELL"
            strength = abs(current_fast - current_slow) / current_slow
        
        return {
            "signal": signal,
            "strength": min(strength, 1.0),
            "details": {
                "fast_ema": round(current_fast, 2),
                "slow_ema": round(current_slow, 2),
                "fast_period": fast_period,
                "slow_period": slow_period,
                "trend": "uptrend" if current_fast > current_slow else "downtrend"
            }
        }
