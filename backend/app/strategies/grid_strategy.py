import pandas as pd
import numpy as np
from typing import Dict, Any, List
from .base import BaseStrategy


class GridStrategy(BaseStrategy):
    """
    Grid Trading Strategy
    
    Plasează ordere de cumpărare și vânzare la intervale fixe (grid) în jurul prețului curent.
    Ideal pentru piețe laterale (range-bound).
    
    Cumpără când prețul scade la un nivel de grid inferior
    Vinde când prețul crește la un nivel de grid superior
    """
    
    def __init__(self, params: Dict[str, Any] = None):
        super().__init__(
            name="Grid Trading Strategy",
            description="Strategie Grid care plasează ordere la intervale fixe. Ideal pentru piețe laterale. Cumpără jos, vinde sus automat.",
            params=params
        )
        self.params = params or self.get_default_params()
        self.grid_levels: List[float] = []
        self.last_price: float = 0.0
    
    def get_default_params(self) -> Dict[str, Any]:
        return {
            "grid_count": {
                "type": "integer",
                "default": 10,
                "min": 4,
                "max": 50,
                "description": "Numărul de nivele grid (per parte)"
            },
            "grid_spacing": {
                "type": "float",
                "default": 1.0,
                "min": 0.1,
                "max": 10.0,
                "step": 0.1,
                "description": "Distanța între nivele (%)"
            },
            "grid_range": {
                "type": "float",
                "default": 10.0,
                "min": 5.0,
                "max": 50.0,
                "step": 1.0,
                "description": "Range total al grid-ului (%)"
            }
        }
    
    def calculate_grid_levels(self, center_price: float) -> List[float]:
        """Calculează nivelele grid în jurul prețului central."""
        grid_range = self.params.get("grid_range", {}).get("default", 10.0) / 100
        grid_count = self.params.get("grid_count", {}).get("default", 10)
        
        range_amount = center_price * grid_range
        step = range_amount / grid_count
        
        levels = []
        for i in range(-grid_count, grid_count + 1):
            level = center_price + (i * step)
            levels.append(level)
        
        return sorted(levels)
    
    def find_nearest_grid_level(self, price: float) -> tuple:
        """Găsește cel mai apropiat nivel de grid."""
        lower = None
        upper = None
        
        for level in self.grid_levels:
            if level <= price:
                lower = level
            if level >= price and upper is None:
                upper = level
        
        return lower, upper
    
    def analyze(self, data: pd.DataFrame) -> Dict[str, Any]:
        current_price = data['close'].iloc[-1]
        
        # Inițializare grid dacă e prima rulare
        if not self.grid_levels:
            self.grid_levels = self.calculate_grid_levels(current_price)
            self.last_price = current_price
        
        # Recalculează grid dacă prețul s-a mișcat prea mult (re-centering)
        price_change_pct = abs(current_price - self.grid_levels[len(self.grid_levels)//2]) / self.grid_levels[len(self.grid_levels)//2] * 100
        grid_range = self.params.get("grid_range", {}).get("default", 10.0)
        
        if price_change_pct > grid_range * 0.3:  # Recentrează dacă s-a mișcat 30% din range
            self.grid_levels = self.calculate_grid_levels(current_price)
        
        lower_level, upper_level = self.find_nearest_grid_level(current_price)
        
        signal = "HOLD"
        strength = 0.0
        
        # Verifică dacă prețul a atins un nivel de cumpărare (sub nivelul inferior)
        if lower_level and current_price <= lower_level * 1.001:  # 0.1% toleranță
            signal = "BUY"
            strength = 0.7
        
        # Verifică dacă prețul a atins un nivel de vânzare (peste nivelul superior)
        elif upper_level and current_price >= upper_level * 0.999:  # 0.1% toleranță
            signal = "SELL"
            strength = 0.7
        
        self.last_price = current_price
        
        return {
            "signal": signal,
            "strength": strength,
            "details": {
                "current_price": round(current_price, 2),
                "lower_level": round(lower_level, 2) if lower_level else None,
                "upper_level": round(upper_level, 2) if upper_level else None,
                "grid_center": round(self.grid_levels[len(self.grid_levels)//2], 2),
                "active_levels": len(self.grid_levels),
                "grid_range": self.params.get("grid_range", {}).get("default", 10.0)
            }
        }
