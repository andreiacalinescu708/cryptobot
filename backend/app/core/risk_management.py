"""
Risk Management System pentru Crypto Trading Bot
Gestionează position sizing, stop loss, take profit și risk per trade.
"""

from enum import Enum
from dataclasses import dataclass
from typing import Dict, Any, Optional
import math


class RiskLevel(Enum):
    """Niveluri de risc pentru strategii."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


@dataclass
class RiskConfig:
    """Configurație pentru risk management."""
    risk_level: RiskLevel
    max_position_size_pct: float  # % din portofoliu per poziție
    stop_loss_pct: float  # % distanță stop loss
    take_profit_pct: float  # % distanță take profit
    max_daily_loss_pct: float  # % pierdere maximă pe zi
    max_open_positions: int  # număr maxim de poziții deschise
    trailing_stop: bool = False  # folosește trailing stop
    trailing_stop_activation: float = 0.0  # % profit pentru activare trailing stop


# Configurații predefinite pentru fiecare nivel de risc
RISK_CONFIGS = {
    RiskLevel.LOW: RiskConfig(
        risk_level=RiskLevel.LOW,
        max_position_size_pct=10.0,  # Max 10% din portofoliu per poziție
        stop_loss_pct=5.0,  # Stop loss la -5%
        take_profit_pct=10.0,  # Take profit la +10% (1:2 R/R)
        max_daily_loss_pct=3.0,  # Oprire trading dacă pierdem 3% într-o zi
        max_open_positions=5,  # Max 5 poziții simultan
        trailing_stop=True,
        trailing_stop_activation=3.0  # Activează trailing după +3%
    ),
    
    RiskLevel.MEDIUM: RiskConfig(
        risk_level=RiskLevel.MEDIUM,
        max_position_size_pct=5.0,  # Max 5% din portofoliu per poziție
        stop_loss_pct=10.0,  # Stop loss la -10%
        take_profit_pct=15.0,  # Take profit la +15% (1:1.5 R/R)
        max_daily_loss_pct=5.0,  # Oprire trading dacă pierdem 5% într-o zi
        max_open_positions=10,  # Max 10 poziții simultan
        trailing_stop=True,
        trailing_stop_activation=5.0  # Activează trailing după +5%
    ),
    
    RiskLevel.HIGH: RiskConfig(
        risk_level=RiskLevel.HIGH,
        max_position_size_pct=2.0,  # Max 2% din portofoliu per poziție
        stop_loss_pct=15.0,  # Stop loss la -15%
        take_profit_pct=30.0,  # Take profit la +30% (1:2 R/R)
        max_daily_loss_pct=10.0,  # Oprire trading dacă pierdem 10% într-o zi
        max_open_positions=20,  # Max 20 poziții simultan (grid trading)
        trailing_stop=False,  # Fără trailing pentru high frequency
        trailing_stop_activation=0.0
    )
}


class RiskManager:
    """Manager pentru controlul riscului în trading."""
    
    def __init__(self, risk_level: RiskLevel = RiskLevel.MEDIUM):
        self.config = RISK_CONFIGS[risk_level]
        self.daily_pnl = 0.0  # Profit/Loss zilnic
        self.open_positions_count = 0
        self.trading_enabled = True
    
    def can_open_position(self, portfolio_value: float) -> tuple[bool, str]:
        """
        Verifică dacă putem deschide o poziție nouă.
        Returnează (True, "") sau (False, "motiv").
        """
        if not self.trading_enabled:
            return False, "Trading dezactivat - limită zilnică atinsă"
        
        if self.open_positions_count >= self.config.max_open_positions:
            return False, f"Limită poziții atinsă ({self.config.max_open_positions})"
        
        if self.daily_pnl <= -portfolio_value * (self.config.max_daily_loss_pct / 100):
            self.trading_enabled = False
            return False, f"Stop trading - pierdere zilnică: {self.daily_pnl:.2f}"
        
        return True, "OK"
    
    def calculate_position_size(
        self,
        portfolio_value: float,
        entry_price: float,
        stop_loss_price: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Calculează mărimea poziției în funcție de risc.
        
        Formula: Position Size = (Portfolio × Risk%) / (Entry - Stop Loss)
        """
        max_position_value = portfolio_value * (self.config.max_position_size_pct / 100)
        
        # Dacă avem preț specific de stop loss, calculăm mărimea bazat pe risc
        if stop_loss_price and stop_loss_price < entry_price:
            risk_amount = portfolio_value * (self.config.stop_loss_pct / 100)
            price_risk = abs(entry_price - stop_loss_price) / entry_price
            
            if price_risk > 0:
                position_value = risk_amount / price_risk
                position_value = min(position_value, max_position_value)
            else:
                position_value = max_position_value
        else:
            position_value = max_position_value
        
        quantity = position_value / entry_price if entry_price > 0 else 0
        
        return {
            "position_value": round(position_value, 2),
            "quantity": round(quantity, 8),  # 8 decimale pentru crypto
            "max_portfolio_pct": self.config.max_position_size_pct,
            "entry_price": entry_price,
            "stop_loss_price": stop_loss_price or entry_price * (1 - self.config.stop_loss_pct / 100),
            "take_profit_price": entry_price * (1 + self.config.take_profit_pct / 100)
        }
    
    def calculate_stop_loss(self, entry_price: float, side: str = "BUY") -> float:
        """Calculează prețul de stop loss."""
        if side == "BUY":
            return entry_price * (1 - self.config.stop_loss_pct / 100)
        else:  # SELL/SHORT
            return entry_price * (1 + self.config.stop_loss_pct / 100)
    
    def calculate_take_profit(self, entry_price: float, side: str = "BUY") -> float:
        """Calculează prețul de take profit."""
        if side == "BUY":
            return entry_price * (1 + self.config.take_profit_pct / 100)
        else:  # SELL/SHORT
            return entry_price * (1 - self.config.take_profit_pct / 100)
    
    def update_trailing_stop(
        self,
        entry_price: float,
        current_price: float,
        current_stop_loss: float,
        side: str = "BUY"
    ) -> float:
        """Actualizează stop loss-ul dacă prețul a mers în favoarea noastră."""
        if not self.config.trailing_stop:
            return current_stop_loss
        
        if side == "BUY":
            profit_pct = (current_price - entry_price) / entry_price * 100
            
            if profit_pct >= self.config.trailing_stop_activation:
                # Mutăm stop loss la breakeven + 50% din profit
                new_stop = entry_price + (current_price - entry_price) * 0.5
                return max(current_stop_loss, new_stop)
        else:  # SELL/SHORT
            profit_pct = (entry_price - current_price) / entry_price * 100
            
            if profit_pct >= self.config.trailing_stop_activation:
                new_stop = entry_price - (entry_price - current_price) * 0.5
                return min(current_stop_loss, new_stop)
        
        return current_stop_loss
    
    def check_exit_conditions(
        self,
        entry_price: float,
        current_price: float,
        stop_loss: float,
        take_profit: float,
        side: str = "BUY"
    ) -> Dict[str, Any]:
        """Verifică dacă trebuie să închidem poziția."""
        if side == "BUY":
            if current_price <= stop_loss:
                return {"should_exit": True, "reason": "STOP_LOSS", "pnl_pct": (current_price - entry_price) / entry_price * 100}
            
            if current_price >= take_profit:
                return {"should_exit": True, "reason": "TAKE_PROFIT", "pnl_pct": (current_price - entry_price) / entry_price * 100}
        else:  # SELL/SHORT
            if current_price >= stop_loss:
                return {"should_exit": True, "reason": "STOP_LOSS", "pnl_pct": (entry_price - current_price) / entry_price * 100}
            
            if current_price <= take_profit:
                return {"should_exit": True, "reason": "TAKE_PROFIT", "pnl_pct": (entry_price - current_price) / entry_price * 100}
        
        return {"should_exit": False, "reason": None, "pnl_pct": 0}
    
    def record_trade(self, pnl: float):
        """Înregistrează profit/pierderea unei tranzacții."""
        self.daily_pnl += pnl
        self.open_positions_count = max(0, self.open_positions_count - 1)
    
    def open_position(self):
        """Marchează deschiderea unei poziții."""
        self.open_positions_count += 1
    
    def reset_daily_stats(self):
        """Resetează statisticile zilnice."""
        self.daily_pnl = 0.0
        self.trading_enabled = True
    
    def get_status(self) -> Dict[str, Any]:
        """Returnează statusul curent al risk managerului."""
        return {
            "risk_level": self.config.risk_level.value,
            "trading_enabled": self.trading_enabled,
            "daily_pnl": round(self.daily_pnl, 2),
            "open_positions": self.open_positions_count,
            "max_positions": self.config.max_open_positions,
            "stop_loss_pct": self.config.stop_loss_pct,
            "take_profit_pct": self.config.take_profit_pct,
            "max_position_size_pct": self.config.max_position_size_pct
        }


def get_risk_config(risk_level: str) -> RiskConfig:
    """Returnează configurația pentru un nivel de risc."""
    try:
        level = RiskLevel(risk_level.upper())
        return RISK_CONFIGS[level]
    except (ValueError, KeyError):
        return RISK_CONFIGS[RiskLevel.MEDIUM]


def calculate_kelly_criterion(win_rate: float, avg_win: float, avg_loss: float) -> float:
    """
    Formula Kelly - cât % din portofoliu să alocăm per trade.
    
    Kelly % = W - [(1 - W) / R]
    W = win rate
    R = ratio avg_win / avg_loss
    """
    if avg_loss == 0 or win_rate == 0:
        return 0.0
    
    r = avg_win / avg_loss
    kelly = win_rate - ((1 - win_rate) / r)
    
    # Folosim Kelly Fraction (jumătate din valoarea Kelly pentru conservatorism)
    return max(0, kelly * 0.5)
