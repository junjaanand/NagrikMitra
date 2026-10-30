#!/usr/bin/env python3
"""
Academic Deliverables Generator for NagrikMitra
Parses NAGRIKMITRA_PROJECT_BLACK_BOOK.md and NAGRIKMITRA_RESEARCH_PAPER_HBRP.md
and produces publication-grade Microsoft Word (.docx) documents with formal formatting,
tables, styled headings, and typography matching university and journal guidelines.
"""

import re
import sys
from pathlib import Path
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets cell internal padding in twips."""
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
    """Sets background shading of a table cell."""
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def add_styled_paragraph(doc, text, style='Normal', space_after=6, space_before=0, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT):
    p = doc.add_paragraph(style=style)
    p.alignment = align
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.line_spacing = line_spacing
    
    # Process inline formatting: bold (**), italic (*), code (`)
    tokens = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)', text)
    for token in tokens:
        if not token:
            continue
        if token.startswith('**') and token.endswith('**') and len(token) >= 4:
            run = p.add_run(token[2:-2])
            run.bold = True
        elif token.startswith('*') and token.endswith('*') and len(token) >= 2:
            run = p.add_run(token[1:-1])
            run.italic = True
        elif token.startswith('`') and token.endswith('`') and len(token) >= 2:
            run = p.add_run(token[1:-1])
            run.font.name = 'Consolas'
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(15, 23, 42)
        else:
            p.add_run(token)
    return p

def convert_markdown_to_docx(md_path: Path, output_docx_path: Path, doc_title: str):
    print(f"\nProcessing {md_path.name} -> {output_docx_path.name}...")
    doc = docx.Document()
    
    # Set standard academic 1-inch margins
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(1.0)
        s.bottom_margin = Inches(1.0)
        s.left_margin = Inches(1.0)
        s.right_margin = Inches(1.0)
    
    # Configure default Normal font style
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(11.5)
    font.color.rgb = RGBColor(30, 41, 59) # Slate 800

    lines = md_path.read_text(encoding="utf-8").split("\n")
    
    i = 0
    in_code_block = False
    code_lines = []
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # 1. Handle code blocks (e.g. ``` or ```mermaid)
        if stripped.startswith("```"):
            if in_code_block:
                # End of code block: output as shaded box
                if code_lines:
                    table = doc.add_table(rows=1, cols=1)
                    table.alignment = WD_TABLE_ALIGNMENT.CENTER
                    cell = table.cell(0, 0)
                    set_cell_shading(cell, "F8FAFC")
                    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
                    cp = cell.paragraphs[0]
                    cp.paragraph_format.space_after = Pt(2)
                    cp.paragraph_format.space_before = Pt(2)
                    run = cp.add_run("\n".join(code_lines))
                    run.font.name = 'Consolas'
                    run.font.size = Pt(9.0)
                    run.font.color.rgb = RGBColor(51, 65, 85)
                    # Add small spacing after
                    doc.add_paragraph().paragraph_format.space_after = Pt(6)
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
            p.paragraph_format.space_after = Pt(8)
            i += 1
            continue
            
        # 3. Handle markdown tables
        if stripped.startswith("|") and stripped.endswith("|"):
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith("|") and lines[i].strip().endswith("|"):
                table_lines.append(lines[i].strip())
                i += 1
                
            # Filter out separator row (e.g. |:---|:---|)
            header_row = [c.strip() for c in table_lines[0].split("|")[1:-1]]
            data_rows = []
            for r in table_lines[1:]:
                cells = [c.strip() for c in r.split("|")[1:-1]]
                if all(re.match(r'^:?-+:?$', c) for c in cells if c):
                    continue # Skip delimiter line
                data_rows.append(cells)
                
            if header_row and data_rows:
                num_cols = len(header_row)
                table = doc.add_table(rows=len(data_rows) + 1, cols=num_cols)
                table.alignment = WD_TABLE_ALIGNMENT.CENTER
                table.style = 'Table Grid'
                
                # Header row styling
                hdr_cells = table.rows[0].cells
                for ci, col_text in enumerate(header_row):
                    if ci < len(hdr_cells):
                        cell = hdr_cells[ci]
                        set_cell_shading(cell, "0F766E") # Dark Emerald / Teal Header
                        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
                        p = cell.paragraphs[0]
                        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        p.paragraph_format.space_after = Pt(2)
                        p.paragraph_format.space_before = Pt(2)
                        run = p.add_run(col_text.replace("**", ""))
                        run.bold = True
                        run.font.name = 'Times New Roman'
                        run.font.size = Pt(10.5)
                        run.font.color.rgb = RGBColor(255, 255, 255)
                        
                # Data rows styling
                for ri, row_data in enumerate(data_rows):
                    row_cells = table.rows[ri + 1].cells
                    row_bg = "F8FAFC" if ri % 2 == 1 else "FFFFFF"
                    for ci, cell_text in enumerate(row_data):
                        if ci < len(row_cells):
                            cell = row_cells[ci]
                            set_cell_shading(cell, row_bg)
                            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
                            p = cell.paragraphs[0]
                            p.paragraph_format.space_after = Pt(2)
                            p.paragraph_format.space_before = Pt(2)
                            # Render formatted cell text
                            tokens = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)', cell_text)
                            for token in tokens:
                                if not token:
                                    continue
                                if token.startswith('**') and token.endswith('**') and len(token) >= 4:
                                    r = p.add_run(token[2:-2])
                                    r.bold = True
                                elif token.startswith('`') and token.endswith('`') and len(token) >= 2:
                                    r = p.add_run(token[1:-1])
                                    r.font.name = 'Consolas'
                                    r.font.size = Pt(9.0)
                                else:
                                    p.add_run(token)
                                    
                # Add spacing after table
                doc.add_paragraph().paragraph_format.space_after = Pt(8)
            continue
            
        # 4. Handle Headings
        if stripped.startswith("# "):
            h = doc.add_heading(level=1)
            h.paragraph_format.space_before = Pt(18)
            h.paragraph_format.space_after = Pt(8)
            run = h.add_run(stripped[2:])
            run.font.name = 'Times New Roman'
            run.font.size = Pt(18)
            run.bold = True
            run.font.color.rgb = RGBColor(15, 23, 42) # Slate 900
            i += 1
            continue
            
        if stripped.startswith("## "):
            h = doc.add_heading(level=2)
            h.paragraph_format.space_before = Pt(14)
            h.paragraph_format.space_after = Pt(6)
            run = h.add_run(stripped[3:])
            run.font.name = 'Times New Roman'
            run.font.size = Pt(14.5)
            run.bold = True
            run.font.color.rgb = RGBColor(4, 120, 87) # Emerald 700
            i += 1
            continue
            
        if stripped.startswith("### "):
            h = doc.add_heading(level=3)
            h.paragraph_format.space_before = Pt(10)
            h.paragraph_format.space_after = Pt(4)
            run = h.add_run(stripped[4:])
            run.font.name = 'Times New Roman'
            run.font.size = Pt(12.5)
            run.bold = True
            run.font.color.rgb = RGBColor(30, 41, 59)
            i += 1
            continue

        if stripped.startswith("#### "):
            h = doc.add_heading(level=4)
            h.paragraph_format.space_before = Pt(8)
            h.paragraph_format.space_after = Pt(2)
            run = h.add_run(stripped[5:])
            run.font.name = 'Times New Roman'
            run.font.size = Pt(11.5)
            run.bold = True
            run.font.color.rgb = RGBColor(71, 85, 105)
            i += 1
            continue

        # 5. Handle Lists
        if re.match(r'^\s*[-*]\s+', stripped):
            item_text = re.sub(r'^\s*[-*]\s+', '', stripped)
            p = add_styled_paragraph(doc, item_text, style='List Bullet', space_after=3)
            i += 1
            continue
            
        if re.match(r'^\s*\d+\.\s+', stripped):
            item_text = re.sub(r'^\s*\d+\.\s+', '', stripped)
            p = add_styled_paragraph(doc, item_text, style='List Number', space_after=3)
            i += 1
            continue

        # 6. Regular Body Paragraph
        if stripped:
            add_styled_paragraph(doc, stripped, space_after=6)
        else:
            # Empty line
            pass
            
        i += 1

    doc.save(output_docx_path)
    print(f"✓ Successfully generated: {output_docx_path.name} ({output_docx_path.stat().st_size / 1024:.1f} KB)")

if __name__ == "__main__":
    black_book_md = PROJECT_ROOT / "NAGRIKMITRA_PROJECT_BLACK_BOOK.md"
    black_book_docx = PROJECT_ROOT / "NagrikMitra_Black_Book_Final.docx"
    
    research_paper_md = PROJECT_ROOT / "NAGRIKMITRA_RESEARCH_PAPER_HBRP.md"
    research_paper_docx = PROJECT_ROOT / "NagrikMitra_Research_Paper_HBRP_Final.docx"
    
    print("======================================================================")
    print(" NAGRIKMITRA: ACADEMIC DELIVERABLES & BLACK BOOK GENERATOR             ")
    print("======================================================================")
    
    convert_markdown_to_docx(
        black_book_md,
        black_book_docx,
        "NagrikMitra: Final Year B.Tech Project Technical Report (Black Book)"
    )
    
    convert_markdown_to_docx(
        research_paper_md,
        research_paper_docx,
        "NagrikMitra: HBRP Research Paper Manuscript"
    )
    print("\n>>> ALL ACADEMIC DELIVERABLE DOCX FILES GENERATED SUCCESSFULLY! <<<\n")
