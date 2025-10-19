from hydrogen import radial_function

def get_render_radius(n, l):
    # find the radius to render (the radius that contains signficant probibility of an electron)
    render_radius = 5 * n
    current_radius = 0
    check_step = render_radius / 50

    # max R(r)
    max_r = 0

    while current_radius < render_radius:
        curr_r = radial_function(current_radius, n, l) ** 2
        next_r = radial_function(current_radius + check_step, n, l) ** 2
        max_r = max(curr_r, next_r, max_r)

        # if R'(r) > 0 (rising)
        if next_r - curr_r > 0:

            # render radius = 4 * last peak
            current_radius += check_step
            render_radius = 5 * current_radius
        else:
            current_radius += check_step

    # remove buffer space from render radius
    while radial_function(render_radius, n, l) ** 2 < max_r / 100000:
        render_radius -= render_radius * 0.01

    return render_radius
