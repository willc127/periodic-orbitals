    n_max: int = 3
    total_combinacoes: int = (n_max * (n_max + 1) * (2 * n_max + 1)) // 6
    total_imagens: int = total_combinacoes * 4
    planos: list[str] = ["xz", "yz", "xy","3d"]
    atual: int = 0
    cmap = "plasma"
    # lista de cmaps interessantes
    # cmaps = ["viridis", "plasma", "inferno", "magma", "cividis", "twilight", "twilight_shifted", "hsv"]
    print(f"{Fore.LIGHTGREEN_EX}Total de imagens: {total_imagens}\n{Style.RESET_ALL}")

    barra_progresso = tqdm(total=total_imagens, ncols=100, unit='combinações')
    for n in range(1, n_max + 1):
        for l in range(0, n):
            for m in range(-l, l + 1):
                for plano in planos:
                           orbitals_generator(n, l, m, plano, cmap= cmap)
                           atual += 1
                           barra_progresso.update(1)
                           print()
                           time.sleep(0.01)

    barra_progresso.close()