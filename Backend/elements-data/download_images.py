import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from services.elements import _source_image_url

DATA_DIR = Path(__file__).resolve().parent
ELEMENTS_FILE = DATA_DIR / "data" / "elements-data.json"
IMAGES_DIR = DATA_DIR / "static" / "elements"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
JPEG_SIGNATURE = b"\xff\xd8\xff"


def _image_filename(element: dict[str, object]) -> str:
    atomic_number = int(element["atomic_number"])
    if atomic_number >= 104:
        return "transactinoid.png"
    symbol = str(element["symbol"]).lower()
    return f"{symbol}.jpg"


def _download_image(url: str, destination: Path) -> None:
    request = Request(url, headers={"User-Agent": "PeriodicOrbitals/1.0"})
    with urlopen(request, timeout=30) as response:
        content_type = response.headers.get_content_type()
        image_data = response.read()

    if content_type == "image/png":
        valid_image = image_data.startswith(PNG_SIGNATURE)
    elif content_type in {"image/jpeg", "image/pjpeg"}:
        valid_image = image_data.startswith(JPEG_SIGNATURE)
    else:
        valid_image = False

    if not valid_image:
        raise ValueError(f"Resposta não é uma imagem PNG ou JPEG: {url}")
    destination.write_bytes(image_data)


def main() -> None:
    elements: list[dict[str, object]] = json.loads(
        ELEMENTS_FILE.read_text(encoding="utf-8")
    )
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    for element in elements:
        image_url = _source_image_url(
            str(element["name"]), int(element["atomic_number"])
        )
        if image_url is None:
            print(f"Ignorada: {element['name']} (a página não licencia essa imagem)")
            continue
        destination = IMAGES_DIR / _image_filename(element)
        if destination.exists():
            print(f"Já existe: {destination.name}")
            continue
        try:
            _download_image(image_url, destination)
        except (HTTPError, URLError, TimeoutError, ValueError) as error:
            raise RuntimeError(
                f"Falha ao baixar a imagem de {element['name']} ({image_url})"
            ) from error
        print(f"Baixada: {destination.name}")


if __name__ == "__main__":
    main()
