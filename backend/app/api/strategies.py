from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.strategies import AVAILABLE_STRATEGIES
from app.strategies.descriptions import get_strategy_description, get_risk_level_description
from app.core.risk_management import RiskManager, get_risk_config, RiskLevel

router = APIRouter(prefix="/strategies", tags=["strategies"])


@router.get("/available", response_model=List[Dict[str, Any]])
def get_available_strategies():
    """
    Returnează lista tuturor strategiilor disponibile cu parametrii lor.
    Include descrieri pentru începători și nivel de risc.
    """
    strategies = []
    
    for strategy_id, strategy_class in AVAILABLE_STRATEGIES.items():
        # Creează instanță temporară pentru a obține info
        strategy = strategy_class()
        info = strategy.get_info()
        info["id"] = strategy_id
        
        # Adaugă descrieri detaliate pentru începători
        descriptions = get_strategy_description(strategy_id)
        info["short_description"] = descriptions["short_description"]
        info["beginner_description"] = descriptions["beginner_description"]
        info["risk_level"] = descriptions["risk_level"]
        info["recommended_for"] = descriptions["recommended_for"]
        info["risk_details"] = get_risk_level_description(descriptions["risk_level"])
        
        strategies.append(info)
    
    return strategies


@router.get("/{strategy_id}/info")
def get_strategy_info(strategy_id: str):
    """Returnează detalii despre o strategie specifică, inclusiv descrieri pentru începători."""
    if strategy_id not in AVAILABLE_STRATEGIES:
        raise HTTPException(status_code=404, detail="Strategia nu a fost găsită")
    
    strategy_class = AVAILABLE_STRATEGIES[strategy_id]
    strategy = strategy_class()
    info = strategy.get_info()
    info["id"] = strategy_id
    
    # Adaugă descrieri detaliate
    descriptions = get_strategy_description(strategy_id)
    info["short_description"] = descriptions["short_description"]
    info["beginner_description"] = descriptions["beginner_description"]
    info["risk_level"] = descriptions["risk_level"]
    info["recommended_for"] = descriptions["recommended_for"]
    info["risk_details"] = get_risk_level_description(descriptions["risk_level"])
    
    return info


@router.get("/risk-levels/info")
def get_risk_levels_info():
    """Returnează informații despre toate nivelurile de risc."""
    return {
        "LOW": get_risk_level_description("LOW"),
        "MEDIUM": get_risk_level_description("MEDIUM"),
        "HIGH": get_risk_level_description("HIGH")
    }


@router.post("/calculate-position")
def calculate_position_size(
    portfolio_value: float,
    entry_price: float,
    risk_level: str = "MEDIUM",
    stop_loss_price: float = None
):
    """
    Calculează mărimea poziției în funcție de risk management.
    
    - portfolio_value: Valoarea totală a portofoliului
    - entry_price: Prețul de intrare
    - risk_level: LOW, MEDIUM, sau HIGH
    - stop_loss_price: (opțional) Prețul de stop loss
    """
    try:
        risk_mgr = RiskManager(RiskLevel(risk_level))
        result = risk_mgr.calculate_position_size(portfolio_value, entry_price, stop_loss_price)
        
        # Adaugă info despre configurația de risc
        config = get_risk_config(risk_level)
        result["risk_config"] = {
            "risk_level": risk_level,
            "stop_loss_pct": config.stop_loss_pct,
            "take_profit_pct": config.take_profit_pct,
            "max_position_size_pct": config.max_position_size_pct,
            "risk_reward_ratio": config.take_profit_pct / config.stop_loss_pct
        }
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Risk level invalid: {risk_level}")


@router.get("/{strategy_id}/risk-info")
def get_strategy_risk_info(strategy_id: str):
    """Returnează informații complete despre risk pentru o strategie."""
    if strategy_id not in AVAILABLE_STRATEGIES:
        raise HTTPException(status_code=404, detail="Strategia nu a fost găsită")
    
    strategy_class = AVAILABLE_STRATEGIES[strategy_id]
    strategy = strategy_class()
    risk_level = strategy.risk_level
    
    config = get_risk_config(risk_level)
    description = get_strategy_description(strategy_id)
    
    return {
        "strategy_id": strategy_id,
        "strategy_name": strategy.name,
        "risk_level": risk_level,
        "risk_details": get_risk_level_description(risk_level),
        "risk_config": {
            "max_position_size_pct": config.max_position_size_pct,
            "stop_loss_pct": config.stop_loss_pct,
            "take_profit_pct": config.take_profit_pct,
            "max_daily_loss_pct": config.max_daily_loss_pct,
            "max_open_positions": config.max_open_positions,
            "trailing_stop": config.trailing_stop,
            "trailing_stop_activation": config.trailing_stop_activation
        },
        "position_sizing_example": {
            "portfolio_1000_usd": {
                "max_position_value": 1000 * (config.max_position_size_pct / 100),
                "max_loss_per_trade": 1000 * (config.stop_loss_pct / 100),
                "target_profit_per_trade": 1000 * (config.take_profit_pct / 100)
            },
            "portfolio_10000_usd": {
                "max_position_value": 10000 * (config.max_position_size_pct / 100),
                "max_loss_per_trade": 10000 * (config.stop_loss_pct / 100),
                "target_profit_per_trade": 10000 * (config.take_profit_pct / 100)
            }
        },
        "description": description["beginner_description"]
    }


@router.post("/{strategy_id}/test")
def test_strategy(strategy_id: str, data: Dict[str, Any]):
    """
    Testează o strategie pe datele furnizate.
    
    Request body:
    - data: lista de candles {open, high, low, close, volume, timestamp}
    - params: parametrii personalizați pentru strategie (opțional)
    """
    import pandas as pd
    
    if strategy_id not in AVAILABLE_STRATEGIES:
        raise HTTPException(status_code=404, detail="Strategia nu a fost găsită")
    
    strategy_class = AVAILABLE_STRATEGIES[strategy_id]
    custom_params = data.get("params")
    
    strategy = strategy_class(params=custom_params)
    
    # Converteste datele în DataFrame
    df = pd.DataFrame(data.get("candles", []))
    
    if df.empty:
        raise HTTPException(status_code=400, detail="Nu au fost furnizate date")
    
    result = strategy.analyze(df)
    
    return {
        "strategy_id": strategy_id,
        "strategy_name": strategy.name,
        "result": result
    }
