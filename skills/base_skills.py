"""Built-in skills for ChromeOS/Crostini."""
from __future__ import annotations
import shutil
import subprocess
import urllib.parse

def open_chrome(url: str = "https://www.google.com") -> str:
    handler = shutil.which("garcon-url-handler")
    if not handler:
        return "No encuentro garcon-url-handler. Parece que Crostini decidió hacer huelga."
    subprocess.Popen([handler, url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return f"ChromeOS abierto en {url}. Sí, incluso yo tengo que usar tu navegador."

def play_youtube(query: str) -> str:
    encoded = urllib.parse.quote_plus(query)
    return open_chrome(f"https://www.youtube.com/results?search_query={encoded}")

SKILLS = {"open_chrome": open_chrome, "play_youtube": play_youtube}
