"""Global configuration for Pool助理.

Deadpool rule #1: configuration lives here, not scattered through twelve files
like a developer's emotional stability.
"""

from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent
SKILLS_DIR = BASE_DIR / "skills"
BACKUP_DIR = BASE_DIR / ".backups"
LOG_DIR = BASE_DIR / "logs"

AGENT_NAME = "Pool助理"
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "pool-assistant")

# SpeechRecognition uses Google's recognizer by default. Set language as needed.
STT_LANGUAGE = os.getenv("STT_LANGUAGE", "es-ES")
MIC_DEVICE_INDEX = None

# Keep the trigger explicit so the microphone isn't interpreted as a command 24/7.
WAKE_WORDS = ("pool", "deadpool", "pool asistente", "pool助理")

TTS_RATE = int(os.getenv("TTS_RATE", "175"))
TTS_VOLUME = float(os.getenv("TTS_VOLUME", "1.0"))

# Generated skills are deliberately isolated to this directory.
GENERATED_SKILL_PREFIX = "generated_"
MAX_SKILL_SOURCE_BYTES = 50_000
