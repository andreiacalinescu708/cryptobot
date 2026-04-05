from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import pandas as pd


class BaseStrategy(ABC):
    """Clasa de bază pentru toate strategiile de trading."""
    
    def __init__(self, name: str, description: str, params: Dict[str, Any] = None):
        self.name = name
        self.description = description
        self.params = params or {}
    
    @abstractmethod
    def analyze(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Analizează datele și returnează semnalul de trading.
        
        Returns:
            Dict cu: {
                "signal": "BUY" | "SELL" | "HOLD",
                "strength": float (0-1),
                "details": dict cu detalii suplimentare
            }
        """
        pass
    
    @abstractmethod
    def get_default_params(self) -> Dict[str, Any]:
        """Returnează parametrii default ai strategiei."""
        pass
    
    def get_info(self) -> Dict[str, Any]:
        """Returnează informații despre strategie pentru frontend."""
        return {
            "id": self.name.lower().replace(" ", "_"),
            "name": self.name,
            "description": self.description,
            "params": self.get_default_params(),
        }
