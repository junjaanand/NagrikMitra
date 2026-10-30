import os
import pytesseract
from PIL import Image, ImageDraw

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
tessdata_dir = os.path.abspath("backend/data/tessdata")
os.environ["TESSDATA_PREFIX"] = tessdata_dir

# Use --tessdata-dir without extra internal quotes, or simply let TESSDATA_PREFIX handle it
cfg = f"--oem 1 --psm 6 -l eng+hin"

img = Image.new("RGB", (500, 120), color=(255, 255, 255))
d = ImageDraw.Draw(img)
d.text((10, 10), "Government of India", fill=(0, 0, 0))
d.text((10, 40), "DOB: 15/08/1990", fill=(0, 0, 0))
d.text((10, 70), "2345 6789 0123", fill=(0, 0, 0))

txt = pytesseract.image_to_string(img, config=cfg)
print("Extracted text:\n", txt.strip())
print("\n[SUCCESS] Tesseract eng+hin successfully executed with custom tessdata!")
