from pathlib import Path
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

ELEMENTS_DIR = Path(__file__).resolve().parent
REPO_ROOT = ELEMENTS_DIR.parents[1]
for import_path in (ELEMENTS_DIR, REPO_ROOT):
    if str(import_path) not in sys.path:
        sys.path.insert(0, str(import_path))

from api.router import api_router

app = FastAPI(
    title="Periodic Table API",
    description="Elementos químicos com linhas espectrais",
    version="1.0.0",
)
app.include_router(api_router)
app.mount(
    "/assets",
    StaticFiles(directory=ELEMENTS_DIR / "static"),
    name="assets",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)
