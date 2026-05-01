def orbital_real_name(n: int, l: int, m: int) -> str:
    """
    Converte números quânticos (n, l, m) para o nome do orbital real.
    Usando match/case para melhor legibilidade.
    """
    # Validação dos números quânticos
    if n < 1:
        raise ValueError("n deve ser >= 1")
    if not (0 <= l <= n-1):
        raise ValueError(f"l deve estar entre 0 e {n-1} para n={n}")
    if not (-l <= m <= l):
        raise ValueError(f"m deve estar entre {-l} e {l} para l={l}")

    # Determina o nome base do orbital a partir de l e m
    match l:
        case 0:
            orbital = "s"
        case 1:
            match m:
                case 0: orbital = "p_z"
                case 1: orbital = "p_x"
                case -1: orbital = "p_y"
                case _: raise ValueError(f"m inválido para l=1: {m}")
        case 2:
            match m:
                case 0: orbital = "d_{z²}"
                case 1: orbital = "d_{xz}"
                case -1: orbital = "d_{yz}"
                case 2: orbital = "d_{x²-y²}"
                case -2: orbital = "d_{xy}"
                case _: raise ValueError(f"m inválido para l=2: {m}")
        case _:
            raise NotImplementedError(
                f"Conversão para l={l} (orbitais f ou superiores) não implementada."
            )

    return f"{n}{orbital}"


# Exemplos de uso
if __name__ == "__main__":
    print(orbital_real_name(3, 2, 0))   # 3d_{z²}
    print(orbital_real_name(2, 1, 0))   # 2p_z
    print(orbital_real_name(2, 1, 1))   # 2p_x
    print(orbital_real_name(2, 1, -1))  # 2p_y
    print(orbital_real_name(4, 2, 2))   # 4d_{x²-y²}
    print(orbital_real_name(4, 2, -2))  # 4d_{xy}
    print(orbital_real_name(1, 0, 0))   # 1s