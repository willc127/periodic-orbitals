from __future__ import annotations

from typing import List, Literal

import numpy as np
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from skimage.measure import marching_cubes

from Backend.orbitals_generation.core.hydrogen import (
    cartesian_prob_real,
    psi_real_at_cartesian,
    radial_function,
)

router = APIRouter(prefix="/api/v1/orbitals", tags=["orbitals"])


class CloudResponse(BaseModel):
    positions: List[float]
    phases: List[int]


class SurfaceResponse(BaseModel):
    vertices: List[float]
    normals: List[float]
    phases: List[int]


class RadialResponse(BaseModel):
    radii: List[float]
    values: List[float]


class DensityResponse(BaseModel):
    plane: Literal["XY", "XZ", "YZ"]
    size: int
    values: List[List[float]]


def _default_box_half(n: int) -> float:
    return max(12.0, n * n * 1.7 + 4.0)


def _ensure_nlm(n: int, l: int, m: int) -> None:
    if n < 1 or n > 7:
        raise HTTPException(status_code=422, detail="n deve estar entre 1 e 7")
    if l < 0 or l >= n:
        raise HTTPException(status_code=422, detail="l deve estar entre 0 e n-1")
    if m < -l or m > l:
        raise HTTPException(status_code=422, detail="m deve estar entre -l e l")


@router.get("/cloud", response_model=CloudResponse)
async def orbital_cloud(
    n: int = Query(..., ge=1, le=7),
    l: int = Query(..., ge=0),
    m: int = Query(...),
    points: int = Query(10000, ge=100, le=40000),
    boxHalf: float | None = Query(None),
) -> CloudResponse:
    _ensure_nlm(n, l, m)
    box_half = float(boxHalf) if boxHalf is not None else _default_box_half(n)

    gN = 28
    step = (2.0 * box_half) / gN
    pdf_max = 0.0
    for ix in range(gN + 1):
        x = -box_half + ix * step
        for iy in range(gN + 1):
            y = -box_half + iy * step
            for iz in range(gN + 1):
                z = -box_half + iz * step
                pdf_max = max(pdf_max, cartesian_prob_real(n, l, m, x, y, z))
    pdf_max *= 1.3
    if pdf_max <= 0:
        pdf_max = 1e-12

    positions: List[float] = []
    phases: List[int] = []
    count = 0
    attempts = 0
    max_attempts = points * 300
    while count < points and attempts < max_attempts:
        attempts += 1
        x = np.random.uniform(-box_half, box_half)
        y = np.random.uniform(-box_half, box_half)
        z = np.random.uniform(-box_half, box_half)
        psi_value = psi_real_at_cartesian(n, l, m, x, y, z)
        p = psi_value * psi_value
        if np.random.random() * pdf_max < p:
            positions.extend([float(x), float(y), float(z)])
            phases.append(1 if psi_value >= 0 else -1)
            count += 1

    if count < points and positions:
        last_x = positions[-3]
        last_y = positions[-2]
        last_z = positions[-1]
        last_phase = phases[-1]
        for _ in range(count, points):
            positions.extend([last_x, last_y, last_z])
            phases.append(last_phase)

    return CloudResponse(positions=positions, phases=phases)


@router.get("/surface", response_model=SurfaceResponse)
async def orbital_surface(
    n: int = Query(..., ge=1, le=7),
    l: int = Query(..., ge=0),
    m: int = Query(...),
    isoValue: float = Query(0.0008, gt=0.0),
    resolution: int = Query(32, ge=8, le=64),
    boxHalf: float | None = Query(None),
) -> SurfaceResponse:
    _ensure_nlm(n, l, m)
    box_half = float(boxHalf) if boxHalf is not None else _default_box_half(n)
    grid_n = resolution
    size = grid_n + 1
    step = (2.0 * box_half) / grid_n

    field = np.zeros((size, size, size), dtype=np.float32)
    for ix in range(size):
        x = -box_half + ix * step
        for iy in range(size):
            y = -box_half + iy * step
            for iz in range(size):
                z = -box_half + iz * step
                psi_value = psi_real_at_cartesian(n, l, m, x, y, z)
                field[ix, iy, iz] = float(psi_value * psi_value)

    if np.max(field) < isoValue:
        return SurfaceResponse(vertices=[], normals=[], phases=[])

    verts, faces, normals, _ = marching_cubes(
        field, level=isoValue, spacing=(step, step, step)
    )
    verts = verts + np.array([-box_half, -box_half, -box_half], dtype=np.float32)

    triangle_vertices = verts[faces].reshape(-1, 3)
    triangle_normals = normals[faces].reshape(-1, 3)

    unique_verts = verts
    psi_signs = np.array(
        [
            (
                1
                if psi_real_at_cartesian(n, l, m, float(x), float(y), float(z)) >= 0
                else -1
            )
            for x, y, z in unique_verts
        ]
    )
    phases = psi_signs[faces].reshape(-1).tolist()

    return SurfaceResponse(
        vertices=triangle_vertices.astype(np.float32).reshape(-1).tolist(),
        normals=triangle_normals.astype(np.float32).reshape(-1).tolist(),
        phases=phases,
    )


@router.get("/radial", response_model=RadialResponse)
async def orbital_radial(
    n: int = Query(..., ge=1, le=7),
    l: int = Query(..., ge=0),
    points: int = Query(500, ge=50, le=2000),
) -> RadialResponse:
    _ensure_nlm(n, l, 0)
    r_max = n * n * 2.8 + 6.0
    radii: List[float] = []
    values: List[float] = []
    for i in range(points + 1):
        r = (i / points) * r_max
        R = radial_function(r, n, l)
        radii.append(float(r))
        values.append(float(4.0 * np.pi * r * r * R * R))
    return RadialResponse(radii=radii, values=values)


@router.get("/density", response_model=DensityResponse)
async def orbital_density(
    n: int = Query(..., ge=1, le=7),
    l: int = Query(..., ge=0),
    m: int = Query(...),
    plane: Literal["XY", "XZ", "YZ"] = Query("XY"),
    samples: int = Query(200, ge=50, le=400),
    planeOffset: float = Query(0.0),
) -> DensityResponse:
    _ensure_nlm(n, l, m)
    render_radius_eff = _default_box_half(n)
    step = (2.0 * render_radius_eff) / samples
    size = samples + 1
    rows: List[List[float]] = []

    if plane == "XY":
        for iy in range(size):
            y = -render_radius_eff + iy * step
            row = [
                float(cartesian_prob_real(n, l, m, x, y, planeOffset))
                for x in np.linspace(-render_radius_eff, render_radius_eff, size)
            ]
            rows.append(row)
    elif plane == "XZ":
        for iz in range(size):
            z = -render_radius_eff + iz * step
            row = [
                float(cartesian_prob_real(n, l, m, x, planeOffset, z))
                for x in np.linspace(-render_radius_eff, render_radius_eff, size)
            ]
            rows.append(row)
    else:  # YZ
        for iz in range(size):
            z = -render_radius_eff + iz * step
            row = [
                float(cartesian_prob_real(n, l, m, planeOffset, y, z))
                for y in np.linspace(-render_radius_eff, render_radius_eff, size)
            ]
            rows.append(row)

    return DensityResponse(plane=plane, size=size, values=rows)
