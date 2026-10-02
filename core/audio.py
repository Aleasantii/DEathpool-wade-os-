"""Voice input/output for Pool助理."""
from __future__ import annotations
import speech_recognition as sr
import pyttsx3
import config

class AudioManager:
    def __init__(self) -> None:
        self.recognizer = sr.Recognizer()
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 0.8
        self.tts = pyttsx3.init()
        self.tts.setProperty("rate", config.TTS_RATE)
        self.tts.setProperty("volume", config.TTS_VOLUME)

    def listen(self) -> str:
        with sr.Microphone(device_index=config.MIC_DEVICE_INDEX) as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
            print("🎙️ Pool: te escucho...")
            audio = self.recognizer.listen(source, timeout=8, phrase_time_limit=15)
        try:
            text = self.recognizer.recognize_google(audio, language=config.STT_LANGUAGE)
            print(f"🗣️ Tú: {text}")
            return text.strip()
        except sr.UnknownValueError:
            return ""
        except sr.RequestError as exc:
            raise RuntimeError(f"STT no disponible: {exc}") from exc

    def speak(self, text: str) -> None:
        if not text:
            return
        print(f"🔴 Pool: {text}")
        self.tts.say(text)
        self.tts.runAndWait()
