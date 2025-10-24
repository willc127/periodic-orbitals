    n = 2
    planes = ["xz", "yz", "xy", "3d"]
    for n in range(0, n + 1):
        for l in range(0, n):
            for m in range(-l, l + 1):
                for plane in planes:
                    plane_offset = 0.0 if plane != "xy" else 0.05
                    orbitals_generator(n, l, m, plane, plane_offset=plane_offset)