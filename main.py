"""Entry point for Pool助理."""
from __future__ import annotations
import time
import speech_recognition as sr
from core.agent import Agent
from core.audio import AudioManager
import config

def main() -> None:
    print(f"🔴 {config.AGENT_NAME} arrancando...")
    audio = AudioManager()
    agent = Agent()
    audio.speak("Pool online. Di Pool seguido de una orden. Intenta no romper nada.")
    while True:
        try:
            text = audio.listen()
            if not text:
                continue
            lowered = text.lower()
            if not any(word in lowered for word in config.WAKE_WORDS):
                continue
            command = text
            for word in config.WAKE_WORDS:
                command = command.replace(word, "").replace(word.title(), "")
            command = command.strip(" ,.-:")
            if not command:
                audio.speak("¿Sí? Estoy esperando una orden, genio.")
                continue
            audio.speak(agent.ask(command))
        except sr.WaitTimeoutError:
            continue
        except KeyboardInterrupt:
            audio.speak("Me voy. Pulsa Ctrl+C otra vez si quieres dramatismo.")
            break
        except Exception as exc:
            print(f"💥 Error: {exc}")
            time.sleep(1)

if __name__ == "__main__":
    main()
