"""Builds favicon.ico (16/32/48) and apple-touch-icon.png (180) in public/.

The design system has no logo, so the icon is the initial: a Newsreader "P" in ink on the
night background, with the lamp dot the site uses to mark the current page.
Usage: python scripts/make-favicons.py   (needs Pillow and the fonts in public/fonts)
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
FONT = PUBLIC / "fonts" / "Newsreader-Variable.woff2"

# Night tokens from the design system.
BG = (0x13, 0x12, 0x11, 255)
INK = (0xEC, 0xE6, 0xDB, 255)
LAMP = (0xE5, 0x95, 0x72, 255)

SIZE = 512


def letter_font(size: int) -> ImageFont.FreeTypeFont:
    font = ImageFont.truetype(str(FONT), size)
    try:
        # Medium weight (the design system's upper limit for Newsreader) and the smallest optical
        # size, whose sturdier hairlines survive being shrunk to 16 px.
        values = []
        for axis in font.get_variation_axes():
            name = axis["name"].decode() if isinstance(axis["name"], bytes) else axis["name"]
            values.append(500 if name == "Weight" else axis["minimum"] if name == "Optical Size" else axis["default"])
        font.set_variation_by_axes(values)
    except OSError:
        pass  # A Pillow/FreeType build without variable-font support keeps the default instance.
    return font


def draw_icon(rounded: bool) -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    if rounded:
        draw.rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=112, fill=BG)
    else:
        draw.rectangle([0, 0, SIZE - 1, SIZE - 1], fill=BG)

    font = letter_font(400)
    left, top, right, bottom = draw.textbbox((0, 0), "P", font=font)
    width, height = right - left, bottom - top
    dot = 40
    # Centre the letter plus its dot as one group.
    x = (SIZE - (width + dot * 1.6)) / 2 - left
    y = (SIZE - height) / 2 - top
    draw.text((x, y), "P", font=font, fill=INK)

    cx = x + left + width + dot * 0.9
    cy = y + top + height - dot
    draw.ellipse([cx - dot, cy - dot, cx + dot, cy + dot], fill=LAMP)
    return img


def main() -> None:
    draw_icon(rounded=True).save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    # iOS rounds the corners itself and shows transparency as black, so this one is full-bleed.
    draw_icon(rounded=False).convert("RGB").resize((180, 180), Image.LANCZOS).save(PUBLIC / "apple-touch-icon.png", optimize=True)
    print("wrote favicon.ico, apple-touch-icon.png")


if __name__ == "__main__":
    main()
