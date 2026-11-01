# -*- coding: utf-8 -*-
"""
Build Complete NagrikMitra Viva & Technical Defense Q&A Dossier
Generates:
1. D:\2hrs\NAGRIKMITRA_VIVA_AND_TECHNICAL_QA.md
2. C:\Users\VARUN\.gemini\antigravity\brain\342686b1-d31d-43f5-abcd-a4dd0a7ecfa8\NAGRIKMITRA_VIVA_AND_TECHNICAL_QA.md
3. D:\2hrs\NagrikMitra_Viva_Questions_and_Answers.docx
4. C:\Users\VARUN\.gemini\antigravity\brain\342686b1-d31d-43f5-abcd-a4dd0a7ecfa8\NagrikMitra_Viva_Questions_and_Answers.docx
"""

import sys
import os
import shutil
from pathlib import Path

# Set output encoding to UTF-8
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

print("Script initialized.")
