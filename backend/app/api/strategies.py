from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.strategies import AVAILABLE_STRATEGIES
from app.strategies.descriptions import get_strategy_description, get_risk_level_description

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
