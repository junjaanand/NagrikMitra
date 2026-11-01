# -*- coding: utf-8 -*-
"""
Compile the Ultimate 100-Question Master Viva Guide in Markdown and DOCX.
"""

import sys
import os
import shutil
import re
from pathlib import Path

# Add backend/scripts to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from master_guide_sections import SECTION_PITCH_AND_FOUNDATION, SECTION_FOUNDATIONAL_CS_QA
from qa_parts_1_to_4 import MODULE_1_TO_4
from qa_parts_5_to_8 import MODULE_5_TO_8
from qa_parts_9_to_13 import MODULE_9_TO_13
from viva_part_5_strategy import SECTION_PART_5_STRATEGY

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_shading(cell, color_hex="F1F5F9"):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), color_hex)
    tcPr.append(shd)

def clean_for_xml(text):
    if not text:
        return ""
    # Filter out ASCII control characters (< 32 except tab, newline, cr) and 127
    return "".join(ch for ch in text if ch in "\t\n\r" or (ord(ch) >= 32 and ord(ch) != 127))

def renumber_qa_module(module_text: str, offset: int = 25) -> str:
    def repl(match):
        q_num = int(match.group(1))
        new_q_num = q_num + offset
        rest = match.group(2)
        return f"### Q{new_q_num}:{rest}"
    return re.sub(r'### Q(\d+):(.*?)(?=\n)', repl, module_text)

def build_full_master_markdown() -> str:
    # Renumber project questions to Q26-Q100
    mod_1_4_renumbered = renumber_qa_module(MODULE_1_TO_4, offset=25)
    mod_5_8_renumbered = renumber_qa_module(MODULE_5_TO_8, offset=25)
    mod_9_13_renumbered = renumber_qa_module(MODULE_9_TO_13, offset=25)
    
    # Strip redundant module header prefixes so structure is completely cohesive
    # Add level headers
    level_2_header = "\n## Level 2: Project Identity, Architecture, Backend & Database (Q26 – Q47)\n\n"
    level_3_header = "\n## Level 3: Two-Stage Recommendation Engine & Vernacular Frontend (Q48 – Q74)\n\n"
    level_4_header = "\n## Level 4: Computer Vision/OCR, DPDP Act 2023 Compliance & Cloud DevOps (Q75 – Q93)\n\n"
    level_5_header = "\n## Level 5: Tough External Examiner Interrogation & Trap Questions (Q94 – Q100)\n\n"
    
    # In mod_9_13, find where Module 13 begins and insert level_5_header
    mod_9_13_parts = mod_9_13_renumbered.split("## 🎯 Module 13: Tough External Examiner Interrogation & Trap Questions")
    if len(mod_9_13_parts) == 2:
        mod_9_12 = mod_9_13_parts[0]
        mod_13 = mod_9_13_parts[1]
        part_4_rest = level_2_header + mod_1_4_renumbered + "\n" + level_3_header + mod_5_8_renumbered + "\n" + level_4_header + mod_9_12 + "\n" + level_5_header + mod_13
    else:
        part_4_rest = level_2_header + mod_1_4_renumbered + "\n" + level_3_header + mod_5_8_renumbered + "\n" + level_4_header + mod_9_13_renumbered

    full_content = (
        SECTION_PITCH_AND_FOUNDATION.strip() + "\n\n" +
        SECTION_FOUNDATIONAL_CS_QA.strip() + "\n\n" +
        part_4_rest.strip() + "\n\n" +
        SECTION_PART_5_STRATEGY.strip() + "\n"
    )
    return full_content

def convert_markdown_to_docx(md_content: str, output_docx_path: Path):
    print(f"Converting Master Guide to {output_docx_path.name}...")
    doc = docx.Document()
    
    # 1 inch margins
    for s in doc.sections:
        s.top_margin = Inches(1.0)
        s.bottom_margin = Inches(1.0)
        s.left_margin = Inches(1.0)
        s.right_margin = Inches(1.0)
        
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(11.5)
    font.color.rgb = RGBColor(30, 41, 59) # Slate 800

    lines = md_content.split("\n")
    i = 0
    in_code_block = False
    code_lines = []
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # 1. Code block handling
        if stripped.startswith("```"):
            if in_code_block:
                if code_lines:
                    table = doc.add_table(rows=1, cols=1)
                    table.alignment = WD_TABLE_ALIGNMENT.CENTER
                    cell = table.cell(0, 0)
                    set_cell_shading(cell, "F8FAFC")
                    set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
                    cp = cell.paragraphs[0]
                    cp.paragraph_format.space_after = Pt(2)
                    cp.paragraph_format.space_before = Pt(2)
                    run = cp.add_run(clean_for_xml("\n".join(code_lines)))
                    run.font.name = 'Consolas'
                    run.font.size = Pt(9.0)
                    run.font.color.rgb = RGBColor(51, 65, 85)
                    doc.add_paragraph().paragraph_format.space_after = Pt(4)
                code_lines = []
                in_code_block = False
            else:
                in_code_block = True
                code_lines = []
            i += 1
            continue
            
        if in_code_block:
            code_lines.append(line)
            i += 1
            continue
            
        # 2. Skip horizontal rules
        if stripped in ("---", "***", "___"):
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(6)
            i += 1
            continue
            
        # 3. Tables
        if stripped.startswith("|") and stripped.endswith("|"):
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith("|") and lines[i].strip().endswith("|"):
                table_lines.append(lines[i].strip())
                i += 1
                
            header_row = [c.strip() for c in table_lines[0].split("|")[1:-1]]
            data_rows = []
            for r in table_lines[1:]:
                cells = [c.strip() for c in r.split("|")[1:-1]]
                if all(re.match(r'^:?-+:?$', c) for c in cells if c):
                    continue
                data_rows.append(cells)
                
            num_cols = len(header_row)
            if num_cols > 0:
                table = doc.add_table(rows=len(data_rows) + 1, cols=num_cols)
                table.alignment = WD_TABLE_ALIGNMENT.CENTER
                
                # Header styling
                for col_idx, text in enumerate(header_row):
                    cell = table.cell(0, col_idx)
                    set_cell_shading(cell, "0F766E") # Teal 700
                    set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
                    p = cell.paragraphs[0]
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    run = p.add_run(clean_for_xml(text))
                    run.font.bold = True
                    run.font.name = 'Times New Roman'
                    run.font.size = Pt(10)
                    run.font.color.rgb = RGBColor(255, 255, 255)
                    
                # Data rows
                for row_idx, row_data in enumerate(data_rows):
                    shading_color = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
                    for col_idx in range(num_cols):
                        cell = table.cell(row_idx + 1, col_idx)
                        set_cell_shading(cell, shading_color)
                        set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
                        p = cell.paragraphs[0]
                        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                        val = row_data[col_idx] if col_idx < len(row_data) else ""
                        clean_val = val.replace("**", "").replace("`", "")
                        run = p.add_run(clean_for_xml(clean_val))
                        run.font.name = 'Times New Roman'
                        run.font.size = Pt(9.5)
                        run.font.color.rgb = RGBColor(30, 41, 59)
                        
                doc.add_paragraph().paragraph_format.space_after = Pt(6)
            continue
            
        # 4. Headings
        if stripped.startswith("# "):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(18)
            p.paragraph_format.space_after = Pt(10)
            run = p.add_run(clean_for_xml(stripped[2:]))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(20)
            run.font.bold = True
            run.font.color.rgb = RGBColor(15, 118, 110) # Teal 700
            i += 1
            continue
            
        if stripped.startswith("## "):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(8)
            run = p.add_run(clean_for_xml(stripped[3:]))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(15)
            run.font.bold = True
            run.font.color.rgb = RGBColor(30, 41, 59)
            i += 1
            continue
            
        if stripped.startswith("### "):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run(clean_for_xml(stripped[4:]))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(12.5)
            run.font.bold = True
            run.font.color.rgb = RGBColor(3, 105, 161) # Sky 700
            i += 1
            continue
            
        # 5. Bullet points
        if stripped.startswith("- ") or stripped.startswith("* "):
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.space_before = Pt(1)
            raw_text = stripped[2:]
            parts = re.split(r'(\*\*.*?\*\*)', raw_text)
            for part in parts:
                if part.startswith("**") and part.endswith("**"):
                    r = p.add_run(clean_for_xml(part[2:-2]))
                    r.font.bold = True
                else:
                    clean = part.replace("`", "")
                    p.add_run(clean_for_xml(clean))
            i += 1
            continue
            
        # 6. Standard Paragraph
        if stripped:
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.line_spacing = 1.15
            parts = re.split(r'(\*\*.*?\*\*)', stripped)
            for part in parts:
                if part.startswith("**") and part.endswith("**"):
                    r = p.add_run(clean_for_xml(part[2:-2]))
                    r.font.bold = True
                else:
                    clean = part.replace("`", "")
                    p.add_run(clean_for_xml(clean))
                    
        i += 1
        
    doc.save(str(output_docx_path))
    print(f"Successfully created: {output_docx_path} ({os.path.getsize(output_docx_path)} bytes)")

def main():
    print("Building Ultimate 100-Question Master Viva & Defense Guide...")
    full_markdown = build_full_master_markdown()
    
    # 1. Output Markdown Paths
    md_workspace = Path("D:/2hrs/NAGRIKMITRA_VIVA_COMPLETE_MASTER_GUIDE.md")
    md_artifact = Path("C:/Users/VARUN/.gemini/antigravity/brain/342686b1-d31d-43f5-abcd-a4dd0a7ecfa8/NAGRIKMITRA_VIVA_COMPLETE_MASTER_GUIDE.md")
    
    md_workspace.write_text(full_markdown, encoding="utf-8")
    print(f"Wrote workspace markdown: {md_workspace} ({os.path.getsize(md_workspace)} bytes)")
    
    shutil.copyfile(md_workspace, md_artifact)
    print(f"Copied to artifact directory: {md_artifact}")
    
    # 2. Output DOCX Paths
    docx_workspace = Path("D:/2hrs/NagrikMitra_Viva_Complete_Master_Guide.docx")
    docx_artifact = Path("C:/Users/VARUN/.gemini/antigravity/brain/342686b1-d31d-43f5-abcd-a4dd0a7ecfa8/NagrikMitra_Viva_Complete_Master_Guide.docx")
    
    convert_markdown_to_docx(full_markdown, docx_workspace)
    shutil.copyfile(docx_workspace, docx_artifact)
    print(f"Copied DOCX to artifact directory: {docx_artifact}")
    
    print("\nALL ULTIMATE VIVA DELIVERABLES COMPILED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
