import ast
import importlib.util
import json
import re
import shutil
import subprocess
import sys
import time
import ollama
import config
from skills.base_skills import SKILLS

SYSTEM_PROMPT = '''You are Pool, a local Spanish voice assistant inspired by Deadpool. Be sarcastic but useful. Return JSON only. Types: chat, skill, propose_skill. Never claim an action happened unless executed. If a requested capability is missing, return propose_skill with name, description and reason.'''

class Agent:
    def __init__(self):
        config.SKILLS_DIR.mkdir(exist_ok=True)
        config.BACKUP_DIR.mkdir(exist_ok=True)
        self.skills = dict(SKILLS)
        self.client = ollama.Client(host=config.OLLAMA_HOST)
        self.pending = None

    def reload_skills(self):
        for path in config.SKILLS_DIR.glob('*.py'):
            if path.name in ('__init__.py','base_skills.py') or path.name.startswith('_'):
                continue
            try:
                spec = importlib.util.spec_from_file_location('pool_'+path.stem, path)
                if not spec or not spec.loader: continue
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                exported = getattr(module, 'SKILLS', {})
                if isinstance(exported, dict): self.skills.update(exported)
            except Exception as exc:
                print('Skill ignored:', path.name, exc)

    def ask(self, text):
        self.reload_skills()
        if self.pending:
            if self._is_yes(text):
                request = self.pending
                self.pending = None
                return self._create_skill(request)
            if self._is_no(text):
                self.pending = None
                return 'Vale. Evolución cancelada. Seguimos con lo que sí sé hacer.'
            return 'Tengo una mejora pendiente. Di sí para crearla o no para cancelarla.'
        try:
            response = self.client.chat(model=config.OLLAMA_MODEL, messages=[{'role':'system','content':SYSTEM_PROMPT},{'role':'user','content':text}], options={'temperature':0.4})
            action = self._parse(response['message']['content'])
            return self._dispatch(action, text)
        except Exception as exc:
            return 'Ollama ha fallado: ' + str(exc)

    def _dispatch(self, action, original):
        kind = action.get('type')
        if kind == 'chat': return str(action.get('message','Silencio incómodo.'))
        if kind == 'skill':
            fn = self.skills.get(action.get('name'))
            if not fn: return 'Esa habilidad no existe. Puedo aprenderla si quieres.'
            try: return str(fn(**action.get('args',{})))
            except Exception as exc: return 'La habilidad explotó: ' + str(exc)
        if kind == 'propose_skill':
            self.pending = action
            return 'No sé hacer eso todavía. Puedo crear una habilidad nueva llamada ' + str(action.get('name','nueva')) + '. ¿Me das permiso para crearla y probarla?'
        return 'No entendí la orden.'

    def _create_skill(self, request):
        name = re.sub(r'[^a-zA-Z0-9_]+','_',str(request.get('name','skill'))).strip('_').lower()[:40] or 'skill'
        description = str(request.get('description',''))
        prompt = ('Create one safe Python skill named '+name+' for this goal: '+description+'. '
                  'No imports. No subprocess. No eval/exec/open. No deleting or editing files. '
                  'Define a function and SKILLS={"'+name+'": function}. Return only Python code.')
        try:
            response = self.client.chat(model=config.OLLAMA_MODEL, messages=[{'role':'system','content':SYSTEM_PROMPT},{'role':'user','content':prompt}], options={'temperature':0.2})
            source = re.sub(r'^```(?:python)?\\s*','',response['message']['content'].strip())
            source = re.sub(r'\\s*```$','',source).strip()
            tree = ast.parse(source)
            self._validate(tree)
            path = config.SKILLS_DIR / ('generated_'+name+'.py')
            if path.exists(): shutil.copy2(path, config.BACKUP_DIR / (path.name+'.'+str(int(time.time()))+'.bak'))
            path.write_text(source, encoding='utf-8')
            result = subprocess.run([sys.executable,'-m','py_compile',str(path)],capture_output=True,text=True,timeout=10)
            if result.returncode:
                path.unlink(missing_ok=True)
                return 'La skill no compila: '+result.stderr
            self.reload_skills()
            return 'Listo. He creado y probado '+name+'. Ya puedo usar esa capacidad.'
        except Exception as exc:
            return 'La mejora fue rechazada o falló la prueba: '+str(exc)

    @staticmethod
    def _validate(tree):
        for node in ast.walk(tree):
            if isinstance(node,(ast.Import,ast.ImportFrom,ast.Delete,ast.Global,ast.Nonlocal)):
                raise ValueError('construcción no permitida')
            if isinstance(node,ast.Call) and isinstance(node.func,ast.Name) and node.func.id in {'eval','exec','__import__','open','compile'}:
                raise ValueError('llamada peligrosa: '+node.func.id)
        if not any(isinstance(n,ast.Name) and n.id=='SKILLS' for n in ast.walk(tree)):
            raise ValueError('falta SKILLS')

    @staticmethod
    def _parse(raw):
        match = re.search(r'\\{.*\\}',raw,re.S)
        if not match: return {'type':'chat','message':raw}
        try: return json.loads(match.group(0))
        except json.JSONDecodeError: return {'type':'chat','message':raw}

    @staticmethod
    def _is_yes(text): return text.strip().lower() in {'si','sí','vale','ok','dale','hazlo','adelante','yes'}
    @staticmethod
    def _is_no(text): return text.strip().lower() in {'no','cancelar','cancela','nah'}
