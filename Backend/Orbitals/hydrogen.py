import numpy as np
import scipy.special as spe


# radial function
def radial_function(r: float, n: int = 1, l: int = 0) -> float:
    coeff = np.sqrt(
        (2.0 / n) ** 3 * spe.factorial(n - l - 1) / (2.0 * n * spe.factorial(n + l))
    )
    laguerre = spe.assoc_laguerre(2.0 * r / n, n - l - 1, 2 * l + 1)
    return coeff * np.exp(-r / n) * (2.0 * r / n) ** l * laguerre


# wave function complex
def psi(n: int, l: int, m: int, r: float, azimuth: float, zenith: float) -> float:
    """
    Função de onda complexa original
    """
    Y = spe.sph_harm(m, l, azimuth, zenith)
    radial = radial_function(r, n, l)
    
    if m < 0:
        return (-1) ** m * np.imag(Y * radial) * (2**0.5)
    elif m > 0:
        return (-1) ** m * np.real(Y * radial) * (2**0.5)
    else:  # m == 0
        return Y * radial


# wave function, for real orbitals (used in chemistry)
def psi_real(n: int, l: int, m: int, r: float, azimuth: float, zenith: float) -> float:
    """
    Orbitais reais padrão da química
    """
    if m == 0:
        return spe.sph_harm(0, l, azimuth, zenith).real * radial_function(r, n, l)
    elif m > 0:
        y_plus = spe.sph_harm(m, l, azimuth, zenith)
        y_minus = spe.sph_harm(-m, l, azimuth, zenith)
        return (1/np.sqrt(2)) * (y_plus + (-1)**m * y_minus).real * radial_function(r, n, l)
    else:  # m < 0
        m_abs = abs(m)
        y_plus = spe.sph_harm(m_abs, l, azimuth, zenith)
        y_minus = spe.sph_harm(-m_abs, l, azimuth, zenith)
        return (1/np.sqrt(2)) * (y_plus - (-1)**m_abs * y_minus).imag * radial_function(r, n, l)


# probability given wave function output
def prob(res: float) -> float:
    return np.absolute(res) ** 2


# final function we are trying to calculate, returns prob(psi(...)) given cartesian coordiantes
def cartesian_prob(n: int, l: int, m: int, x: float, y: float, z: float) -> float:
    r = (x * x + y * y + z * z) ** 0.5
    if r < 1e-10:  # near origin
        return 0.0 if l > 0 else prob(psi(n, l, m, 0, 0, 0))

    azimuth = np.arctan2(y, x)
    # use arccos for more stable theta near poles
    zenith = np.arccos(z / r) if abs(z) < r else (0 if z > 0 else np.pi)
    return prob(psi(n, l, m, r, azimuth, zenith))


# final function we are trying to calculate, for real orbitals
# returns prob(psi_real(...)) given cartesian coordiantes
def cartesian_prob_real(n: int, l: int, m: int, x: float, y: float, z: float) -> float:
    r = (x * x + y * y + z * z) ** 0.5
    if r < 1e-10:  # near origin
        return 0.0 if l > 0 else prob(psi_real(n, l, m, 0, 0, 0))

    azimuth = np.arctan2(y, x)
    # use arccos for more stable theta near poles
    zenith = np.arccos(z / r) if abs(z) < r else (0 if z > 0 else np.pi)
    return prob(psi_real(n, l, m, r, azimuth, zenith))












