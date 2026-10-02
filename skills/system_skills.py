"""Safe system skills. No shell=True, because we enjoy having a Chromebook."""
from __future__ import annotations
import shutil
import subprocess

ALLOWED = {
    "terminal": ["x-terminal-emulator"],
    "files": ["xdg-open", "/home"],
}

def system_info() -> str:
    result = subprocess.run(["uname", "-a"], capture_output=True, text=True, timeout=5)
    return result.stdout.strip() or "No pude consultar el sistema."

def open_file_manager() -> str:
    exe = shutil.which("xdg-open")
    if not exe:
        return "xdg-open no está disponible."
    subprocess.Popen([exe, "/home"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return "Gestor de archivos abierto. Mira qué emocionante."

SKILLS = {
    "system_info": system_info,
    "open_file_manager": open_file_manager,
}
