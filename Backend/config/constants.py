"""Constantes da aplicação."""

# Números quânticos
MIN_N = 1
MAX_N = 7

# Padrões de renderização
DEFAULT_SAMPLES = 400
DEFAULT_CMAP = "magma"
DEFAULT_PLANE = "xz"

# Limites
MAX_SAMPLES = 600
MIN_SAMPLES = 100

# Planos permitidos
ALLOWED_PLANES = ["xz", "xy", "yz"]

# Status API
STATUS_OK = "ok"
STATUS_ERROR = "error"

# Mensagens de erro
ERROR_INVALID_N = "n deve estar entre {min} e {max}"
ERROR_INVALID_L = "l deve estar entre 0 e n-1"
ERROR_INVALID_M = "m deve estar entre -l e l"
ERROR_ORBITAL_NOT_FOUND = "Orbital não encontrado"
ERROR_IMAGE_NOT_FOUND = "Imagem não encontrada"
ERROR_INVALID_PLANE = "Plano deve ser um de: {planes}"
ERROR_INVALID_SAMPLES = "samples deve estar entre {min} e {max}"
