from PIL import Image
import os
from pathlib import Path
from typing import Optional


def create_grouped_figure(
    images_folder: str, orbital_name: str, output_path: Optional[str] = None
) -> Image.Image:
    """
    Cria uma imagem contendo 4 vistas do orbital:
    - Superior esquerdo: 3D
    - Superior direito: Projeção XZ
    - Inferior esquerdo: Projeção YZ
    - Inferior direito: Projeção XY

    Args:
        images_folder: Caminho da pasta contendo as imagens dos orbitais
        orbital_name: Nome do orbital (ex: '1-0-0', '2-1-0')
        output_path: Caminho para salvar a imagem combinada (opcional)

    Returns:
        Image.Image: Imagem PIL contendo as 4 vistas
    """

    # Construir os caminhos das imagens
    orbital_folder = Path(images_folder) / orbital_name

    img_3d = Image.open(orbital_folder / f"{orbital_name}-3d-real.png")
    img_xz = Image.open(orbital_folder / f"{orbital_name}-cross-section-xz.png")
    img_yz = Image.open(orbital_folder / f"{orbital_name}-cross-section-yz.png")
    img_xy = Image.open(orbital_folder / f"{orbital_name}-cross-section-xy.png")

    # Redimensionar as imagens para o mesmo tamanho (se necessário)
    # Assumindo que as imagens têm o mesmo tamanho
    img_width, img_height = img_3d.size

    # Criar uma nova imagem para acomodar as 4 imagens (2x2)
    combined_width = img_width * 2
    combined_height = img_height * 2
    combined_image = Image.new("RGB", (combined_width, combined_height))

    # Posicionar as imagens
    # Superior esquerdo: 3D
    combined_image.paste(img_3d, (0, 0))

    # Superior direito: XZ
    combined_image.paste(img_xz, (img_width, 0))

    # Inferior esquerdo: YZ
    combined_image.paste(img_yz, (0, img_height))

    # Inferior direito: XY
    combined_image.paste(img_xy, (img_width, img_height))

    # Salvar a imagem se um caminho de saída foi fornecido
    if output_path:
        combined_image.save(output_path)
        print(f"Imagem combinada salva em: {output_path}")

    return combined_image


def batch_create_grouped_figures(
    images_folder: str, output_folder: str | None = None
) -> None:
    """
    Cria imagens agrupadas para todos os orbitais disponíveis.

    Args:
        images_folder: Caminho da pasta contendo os orbitais
        output_folder: Caminho da pasta para salvar as imagens combinadas
    """

    images_path = Path(images_folder)

    # Se output_folder não foi especificado, criar uma pasta "grouped" no mesmo nível
    if output_folder is None:
        output_folder_path = images_path / "grouped"
    else:
        output_folder_path = Path(output_folder)

    output_folder_path.mkdir(parents=True, exist_ok=True)

    # Iterar sobre todas as pastas de orbitais
    for orbital_folder in sorted(images_path.iterdir()):
        if orbital_folder.is_dir():
            orbital_name = orbital_folder.name

            # Verificar se todos os arquivos necessários existem
            required_files = [
                f"{orbital_name}-3d-real.png",
                f"{orbital_name}-cross-section-xz.png",
                f"{orbital_name}-cross-section-yz.png",
                f"{orbital_name}-cross-section-xy.png",
            ]

            if all((orbital_folder / file).exists() for file in required_files):
                output_path = output_folder_path / f"{orbital_name}-combined.png"
                try:
                    create_grouped_figure(
                        str(images_path), orbital_name, str(output_path)
                    )
                    print(f"✓ Processado: {orbital_name}")
                except Exception as e:
                    print(f"✗ Erro ao processar {orbital_name}: {e}")
            else:
                print(f"⚠ Arquivos incompletos para {orbital_name}")
