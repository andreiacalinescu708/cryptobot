"""
Descrieri detaliate pentru strategii, explicate pentru începători.
"""

STRATEGY_DESCRIPTIONS = {
    "rsi": {
        "short_description": "Cumpără când prețul e prea jos, vinde când e prea sus",
        "beginner_description": """
## Ce face această strategie?

**RSI (Relative Strength Index)** măsoară dacă un preț este "prea jos" sau "prea sus" comparativ cu mișcările recente.

### Analogie simplă:
Imaginați-vă un arcaș care trage cu arcul:
- Când brațul e complet întins (RSI > 70) = trebuie să relaxeze = **SELL** (vinde)
- Când brațul e complet relaxat (RSI < 30) = poate trage din nou = **BUY** (cumpără)

### Când funcționează bine:
- ✅ Piețe care se mișcă sus-jos într-un interval
- ✅ Evită cumpărarea în vârfuri și vânzarea în funduri
- ✅ Bun pentru swing trading (câteva zile/săptămâni)

### Când NU funcționează:
- ❌ Trenduri puternice (poate da semnale premature)
- ❌ Știri bruște care schimbă prețul instant

### Parametri:
- **Perioada**: Câte lumânări (candlestick) analizăm (default: 14)
- **Supravânzare**: Sub ce nivel cumpărăm (default: 30)
- **Supracumpărare**: Peste ce nivel vindem (default: 70)
""",
        "risk_level": "MEDIUM",
        "recommended_for": "Începători - ușor de înțeles și configurat"
    },
    
    "macd": {
        "short_description": "Urmează trendul - cumpără când trendul devine bullish",
        "beginner_description": """
## Ce face această strategie?

**MACD (Moving Average Convergence Divergence)** detectează când un trend începe sau se schimbă.

### Analogie simplă:
Imaginați-vă două mașini care aleargă:
- Mașina rapidă (EMA 12) și mașina lentă (EMA 26)
- Când mașina rapidă depășește pe cea lentă = semnal de **BUY** (cumpără)
- Când mașina rapidă e depășită = semnal de **SELL** (vinde)

### Când funcționează bine:
- ✅ Trenduri clare (bull sau bear)
- ✅ Evită tranzacțiile când piața e stagnantă
- ✅ Bun pentru poziții de mai lungă durată

### Când NU funcționează:
- ❌ Piețe laterale (range-bound) - dă semnale false
- ❌ Mișcări bruște de preț (whipsaws)

### Parametri:
- **EMA Rapidă**: Perioada scurtă (default: 12)
- **EMA Lentă**: Perioada lungă (default: 26)
- **Linia de semnal**: Linia care confirmă semnalele (default: 9)
""",
        "risk_level": "MEDIUM",
        "recommended_for": "Traderi cu puțină experiență - urmărește trendul"
    },
    
    "ema_cross": {
        "short_description": "Golden Cross vs Death Cross - urmărește trendul major",
        "beginner_description": """
## Ce face această strategie?

**EMA Cross** (Golden Cross / Death Cross) este strategia clasică de urmărire a trendului folosită de traderi profesioniști.

### Analogie simplă:
Imaginați-vă o cursă de cai:
- **Golden Cross**: Calul rapid (EMA 50) depășește calul lent (EMA 200) = **BUY**
- **Death Cross**: Calul rapid e depășit de calul lent = **SELL**

Acesta e semnalul pe care îl folosesc mulți analiști Wall Street!

### Când funcționează bine:
- ✅ Trenduri puternice și de lungă durată
- ✅ Evită zgomotul din piețe volatile
- ✅ Excelent pentru investiții pe termen mediu-lung

### Când NU funcționează:
- ❌ Piețe fără direcție clară (poate da semnale tardive)
- ❌ Necesită răbdare - semnalele vin rar
- ❌ Poate pierde începutul trendului

### Parametri:
- **EMA Rapidă**: Default 50 (pentru mișcări mai rapide)
- **EMA Lentă**: Default 200 (pentru trendul major)

### Sfat:
Folosiți această strategie pentru poziții de săptămâni/luni, nu pentru day trading!
""",
        "risk_level": "LOW",
        "recommended_for": "Investitori pe termen mediu - conservator, sigur"
    },
    
    "bollinger": {
        "short_description": "Cumpără la banda inferioară, vinde la banda superioară",
        "beginner_description": """
## Ce face această strategie?

**Bollinger Bands** creează un "coridor" în jurul prețului. Când prețul atinge marginile coridorului, probabil se va întoarce.

### Analogie simplă:
Imaginați-vă o minge de tenis într-un tub:
- Mingea lovește peretele de jos (banda inferioară) = sare în sus = **BUY**
- Mingea lovește peretele de sus (banda superioară) = sare în jos = **SELL**
- Banda de mijloc = media prețului

### Când funcționează bine:
- ✅ Piețe laterale (range-bound)
- ✅ Volatilitate moderată
- ✅ Bun pentru scalping și day trading

### Când NU funcționează:
- ❌ Trenduri puternice (prețul poate "merge pe bandă" mult timp)
- ❌ Volatilitate extremă (benzile se lărgesc prea mult)
- ❌ Necesită confirmare cu alți indicatori

### Parametri:
- **Perioada SMA**: Media mobilă centrală (default: 20)
- **Deviația standard**: Cât de larg e coridorul (default: 2.0)

### Sfat:
Așteptați confirmare! Dacă prețul atinge banda inferioară și începe să crească, atunci cumpărați.
Nu cumpărați doar pentru că a atins banda!
""",
        "risk_level": "MEDIUM",
        "recommended_for": "Day traderi - necesită atenție și confirmare"
    },
    
    "grid": {
        "short_description": "Cumpără jos, vinde sus - automat, fără să ghicești direcția",
        "beginner_description": """
## Ce face această strategie?

**Grid Trading** plasează ordere automate la intervale fixe în jurul prețului curent. 
Nu încercăm să ghicim unde va merge prețul - profităm de mișcările naturale!

### Analogie simplă:
Imaginați-vă un comerciant care cumpără mere când prețul scade și vinde când crește:
- Preț mere: 1 leu → cumpără 10 mere
- Preț mere: 0.9 lei → cumpără 10 mere
- Preț mere: 1.1 lei → vinde 10 mere = PROFIT!
- Preț mere: 1.2 lei → vinde 10 mere = PROFIT!

Repetăm la infinit în sus și în jos!

### Când funcționează bine:
- ✅ Piețe laterale (fără trend clar)
- ✅ Criptomonede volatile care fluctuează mult
- ✅ Automat - nu trebuie să stai cu ochii pe grafic

### Când NU funcționează:
- ❌ Trenduri puternice (rămâi fără bani dacă prețul scade continuu)
- ❌ Necesită capital suficient pentru multiple ordere
- ❌ Poate genera multe tranzacții (taxe!)

### Parametri:
- **Număr nivele**: Câte ordere de fiecare parte (default: 10)
- **Distanță între nivele**: Cât de departe sunt orderele (default: 1%)
- **Range total**: Cât de larg e grid-ul (default: 10%)

### ⚠️ Risc IMPORTANT:
Dacă prețul scade mult sub cel mai jos nivel, poți rămâne cu multe cumpărături "în pierdere"!
Folosiți STOP LOSS sau limitați suma investită!

### Sfat:
Ideal pentru BTC/ETH care fluctuează mult dar revin. Periculos pentru shitcoins care pot scadea 90%!
""",
        "risk_level": "HIGH",
        "recommended_for": "Traderi avansați - necesită management de risc strict"
    }
}


def get_strategy_description(strategy_id: str) -> dict:
    """Get full description for a strategy."""
    return STRATEGY_DESCRIPTIONS.get(strategy_id, {
        "short_description": "No description available",
        "beginner_description": "No detailed description available",
        "risk_level": "UNKNOWN",
        "recommended_for": "Unknown"
    })


def get_risk_level_description(risk_level: str) -> str:
    """Get description for risk level."""
    risk_descriptions = {
        "LOW": {
            "label": "Risc Scăzut",
            "color": "green",
            "description": "Semnale rare dar sigure. Pierderi mici, profituri moderate. Ideal pentru începători.",
            "max_loss": "5-10% per tranzacție",
            "win_rate": "60-70%",
            "timeframe": "Mediu-lung (săptămâni-luni)"
        },
        "MEDIUM": {
            "label": "Risc Mediu", 
            "color": "yellow",
            "description": "Echilibru între frecvența semnalelor și siguranță. Necesită cunoștințe de bază.",
            "max_loss": "10-15% per tranzacție",
            "win_rate": "50-60%",
            "timeframe": "Mediu (zile-săptămâni)"
        },
        "HIGH": {
            "label": "Risc Ridicat",
            "color": "red",
            "description": "Multe tranzacții, profit potențial mare dar și pierderi posibile. Necesită experiență!",
            "max_loss": "15-25% per tranzacție",
            "win_rate": "40-50% (dar profit/risc bun)",
            "timeframe": "Scurt (ore-zile)"
        }
    }
    return risk_descriptions.get(risk_level, risk_descriptions["MEDIUM"])
