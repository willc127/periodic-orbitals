from pydantic import BaseModel
from typing import Optional


class Isotopo(BaseModel):
    numeroMassa: int
    simboloIsotopo: str  # ex: "²³⁵U"
    abundanciaNatural: float  # percentual; 0 se sintético/traço
    estavel: bool
    meiaVida: Optional[str] = None
    modoDecaimento: Optional[str] = None


class DadosIsotoposElemento(BaseModel):
    numeroAtomico: int
    simboloElemento: str
    nomeElemento: str
    isotopos: list[Isotopo]
