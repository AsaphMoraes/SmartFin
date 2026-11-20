from pathlib import Path

import webview

from src.backend.api import Api
from src.backend.database import init_db

RAIZ = Path(__file__).resolve().parent


def main():
    init_db()
    api = Api()
    api._janela = webview.create_window(
        "SmartFin",
        url=(RAIZ / "src" / "public" / "index.html").resolve().as_uri(),
        js_api=api,
        width=1280,
        height=800,
        min_size=(1024, 700),
    )
    webview.start()


if __name__ == "__main__":
    main()
