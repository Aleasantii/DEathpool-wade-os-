import ast
from core.agent import Agent

def test_generated_skill_rejects_import():
    tree = ast.parse("import os")
    try:
        Agent._validate(tree)
    except ValueError:
        return
    raise AssertionError("unsafe import was accepted")

def test_generated_skill_requires_registry():
    tree = ast.parse("def hello(): return 'hi'")
    try:
        Agent._validate(tree)
    except ValueError:
        return
    raise AssertionError("missing SKILLS was accepted")
