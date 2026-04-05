from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.deps import get_current_user, get_tenant_id
from app.models.user import User
from app.models.strategy import StrategyConfig
from app.models.trade import Trade
from app.models.api_key import BinanceApiKey

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: int = Depends(get_tenant_id)
):
    """
    Get real dashboard statistics for the current user.
    """
    # Get strategy config
    strategy_config = db.query(StrategyConfig).filter(
        StrategyConfig.tenant_id == tenant_id
    ).first()
    
    # Get API key status
    api_key = db.query(BinanceApiKey).filter(
        BinanceApiKey.tenant_id == tenant_id
    ).first()
    
    # Get trade statistics
    trades = db.query(Trade).filter(Trade.tenant_id == tenant_id).all()
    
    # Calculate stats
    total_trades = len(trades)
    profitable_trades = [t for t in trades if t.profit_loss and t.profit_loss > 0]
    loss_trades = [t for t in trades if t.profit_loss and t.profit_loss < 0]
    
    total_profit = sum(t.profit_loss for t in profitable_trades if t.profit_loss) if profitable_trades else 0
    total_loss = sum(t.profit_loss for t in loss_trades if t.profit_loss) if loss_trades else 0
    
    # Calculate win rate
    win_rate = (len(profitable_trades) / total_trades * 100) if total_trades > 0 else 0
    
    # Get active trades count
    active_trades = len([t for t in trades if t.status == "PENDING"])
    
    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "created_at": current_user.created_at,
        },
        "strategy": {
            "has_config": strategy_config is not None,
            "is_active": strategy_config.is_active if strategy_config else False,
            "selected_strategy": strategy_config.selected_strategy_id if strategy_config else None,
            "trading_pair": strategy_config.trading_pair if strategy_config else None,
            "timeframe": strategy_config.timeframe if strategy_config else None,
        },
        "api_status": {
            "has_api_key": api_key is not None,
            "is_testnet": api_key.is_testnet if api_key else False,
        },
        "trading_stats": {
            "total_trades": total_trades,
            "profitable_trades": len(profitable_trades),
            "loss_trades": len(loss_trades),
            "win_rate": round(win_rate, 2),
            "total_profit": float(total_profit) if total_profit else 0,
            "total_loss": float(abs(total_loss)) if total_loss else 0,
            "net_pnl": float(total_profit + total_loss) if (total_profit or total_loss) else 0,
            "active_trades": active_trades,
        },
        "recent_trades": [
            {
                "id": trade.id,
                "trade_id": trade.trade_id,
                "strategy_id": trade.strategy_id,
                "trading_pair": trade.trading_pair,
                "side": trade.side,
                "quantity": float(trade.quantity),
                "price": float(trade.price),
                "profit_loss": float(trade.profit_loss) if trade.profit_loss else None,
                "profit_loss_percent": float(trade.profit_loss_percent) if trade.profit_loss_percent else None,
                "status": trade.status,
                "created_at": trade.created_at,
            }
            for trade in sorted(trades, key=lambda x: x.created_at or datetime.min, reverse=True)[:5]
        ]
    }


@router.get("/balance")
def get_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: int = Depends(get_tenant_id)
):
    """
    Get balance info (placeholder until Binance integration).
    """
    # TODO: Integrate with Binance API to get real balance
    return {
        "message": "Binance integration pending",
        "total_balance_usdt": 0,
        "available_balance_usdt": 0,
        "in_order": 0,
    }
