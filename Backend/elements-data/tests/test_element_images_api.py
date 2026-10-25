from api.endpoints.elements import _with_absolute_image_url


def test_absolute_image_url_uses_request_host_without_mutating_cached_data() -> None:
    element: dict[str, object] = {
        "symbol": "Fe",
        "link_image": "/assets/elements/fe.jpg",
    }

    result = _with_absolute_image_url(element, "https://api.example.test/")

    assert result["link_image"] == "https://api.example.test/assets/elements/fe.jpg"
    assert element["link_image"] == "/assets/elements/fe.jpg"


def test_absolute_image_url_preserves_non_asset_urls() -> None:
    element: dict[str, object] = {
        "link_image": "https://example.test/fe.jpg",
    }

    result = _with_absolute_image_url(element, "https://api.example.test/")

    assert result["link_image"] == "https://example.test/fe.jpg"
