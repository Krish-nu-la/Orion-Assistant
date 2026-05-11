import fitz
import easyocr
import numpy as np
from PIL import Image
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO


# Load EasyOCR only once.
# This avoids reloading the OCR model again and again.
reader = easyocr.Reader(["en"], gpu=False)


def extract_text_from_pdf_fast(pdf_path: str, dpi: int = 150, max_workers: int = 4) -> str:
    """
    Fast PDF extraction:
    1. Extract normal/selectable text first.
    2. OCR only image-based pages.
    3. Render image pages in parallel.
    4. Run OCR on only required pages.
    """

    doc = fitz.open(pdf_path)

    final_pages = [""] * len(doc)
    pages_needing_ocr = []

    # Step 1: Try normal text extraction first
    for page_number in range(len(doc)):
        page = doc[page_number]
        text = page.get_text("text").strip()

        if text:
            final_pages[page_number] = text
        else:
            pages_needing_ocr.append(page_number)

    # If every page had normal text, return directly
    if not pages_needing_ocr:
        doc.close()
        return "\n\n".join(final_pages)

    # Step 2: Render only image-based pages
    def render_page(page_number: int):
        page = doc[page_number]

        zoom = dpi / 72
        matrix = fitz.Matrix(zoom, zoom)

        pix = page.get_pixmap(matrix=matrix, alpha=False)
        img_bytes = pix.tobytes("png")

        image = Image.open(BytesIO(img_bytes)).convert("RGB")
        image_np = np.array(image)

        return page_number, image_np

    rendered_pages = []

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(render_page, page_num) for page_num in pages_needing_ocr]

        for future in as_completed(futures):
            page_number, image_np = future.result()
            rendered_pages.append((page_number, image_np))

    doc.close()

    # Keep correct page order
    rendered_pages.sort(key=lambda x: x[0])

    # Step 3: OCR only those pages
    for page_number, image_np in rendered_pages:
        result = reader.readtext(
            image_np,
            detail=0,
            paragraph=True,
            batch_size=8
        )

        page_text = "\n".join(result).strip()
        final_pages[page_number] = page_text

    return "\n\n".join(final_pages)