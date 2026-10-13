"""Builds the portrait, the avatar and the Open Graph image in public/images.

Usage: python scripts/make-images.py <source-photo>
Needs Pillow and the fonts in public/fonts (Pillow reads woff2).
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images"
FONTS = ROOT / "public" / "fonts"

# Night tokens from the design system.
BG = (0x13, 0x12, 0x11)
INK = (0xEC, 0xE6, 0xDB)
INK_MUTED = (0xB3, 0xAB, 0x9F)
LAMP = (0xE5, 0x95, 0x72)
LINE = (0x2C, 0x2A, 0x26)


def square_crop(img: Image.Image, cx: int, cy: int, size: int) -> Image.Image:
    left = max(0, min(img.width - size, cx - size // 2))
    top = max(0, min(img.height - size, cy - size // 2))
    return img.crop((left, top, left + size, top + size))


def fitting_font(path: Path, text: str, max_width: int, size: int) -> ImageFont.FreeTypeFont:
    while size > 12:
        font = ImageFont.truetype(str(path), size)
        if font.getlength(text) <= max_width:
            return font
        size -= 2
    return ImageFont.truetype(str(path), size)


def main(source: str) -> None:
    img = Image.open(source).convert("RGB")
    OUT.mkdir(parents=True, exist_ok=True)
    side = min(img.size)

    portrait = square_crop(img, img.width // 2, img.height // 2, side).resize((720, 720), Image.LANCZOS)
    portrait.save(OUT / "patrick-kraft.webp", "WEBP", quality=82, method=6)

    # The face sits slightly above the middle of the photo.
    face = square_crop(img, round(img.width * 0.50), round(img.height * 0.37), round(side * 0.60))
    face.resize((144, 144), Image.LANCZOS).save(OUT / "patrick-kraft-avatar.webp", "WEBP", quality=85, method=6)

    og = Image.new("RGB", (1200, 630), BG)
    og.paste(portrait.resize((630, 630), Image.LANCZOS), (570, 0))
    draw = ImageDraw.Draw(og)
    draw.line([(569, 0), (569, 630)], fill=LINE, width=1)
    role = "Anwendungsentwickler in Umschulung"
    draw.text((72, 236), "Patrick Kraft", font=fitting_font(FONTS / "Newsreader-Variable.woff2", "Patrick Kraft", 450, 76), fill=INK)
    draw.text((72, 340), role, font=fitting_font(FONTS / "Geist-Variable.woff2", role, 450, 28), fill=INK_MUTED)
    draw.text((72, 520), "kraftpatrick.dev", font=ImageFont.truetype(str(FONTS / "GeistMono-Variable.woff2"), 22), fill=LAMP)
    og.save(OUT / "og.jpg", "JPEG", quality=88, optimize=True, progressive=True)

    print("wrote", ", ".join(p.name for p in sorted(OUT.iterdir())))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: python scripts/make-images.py <source-photo>")
    main(sys.argv[1])
