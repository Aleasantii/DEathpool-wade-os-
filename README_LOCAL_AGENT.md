# Pool助理 — Deadpool local

Asistente de voz local para Crostini/Linux con Ollama, STT, TTS y skills modulares.

## Instalación

~~~bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip portaudio19-dev espeak-ng
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
~~~

Instala Ollama, descarga el modelo base y crea el modelo:

~~~bash
ollama pull qwen2.5:3b
ollama create pool-assistant -f Modelfile
~~~

Ejecuta:

~~~bash
source .venv/bin/activate
python main.py
~~~

## Arquitectura

- main.py: bucle de voz y wake word.
- core/audio.py: micrófono y TTS.
- core/agent.py: Ollama, routing y autoextensión.
- skills/: módulos dinámicos.
- .backups/: copias de seguridad de skills generadas.

La autoextensión solo puede crear módulos dentro de skills/. Antes de activar una skill nueva se valida su AST y se ejecuta py_compile. Las modificaciones de skills existentes reciben un backup .bak.

## ChromeOS

La skill incluida usa garcon-url-handler para abrir ChromeOS y puede abrir búsquedas de YouTube.

## Seguridad

El código generado por un LLM debe considerarse no confiable. Pool助理 no permite imports, subprocess, eval, exec, open ni modificaciones arbitrarias desde las skills generadas. Revisa siempre una skill antes de darle acceso a capacidades sensibles.

~~~bash
systemctl --user enable --now pool-assistant.service
~~~

El servicio systemd es opcional y debe configurarse con la ruta real del proyecto.
