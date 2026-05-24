"""
Render a static preview of how the symbol assets will look composited into the
in-game reel cells.  Mirrors the renderer's cell sizing (110x100, deep brown
background) so the output is a faithful approximation of the live game.

Outputs: tools/preview_reel.png
"""
from __future__ import annotations
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SYM_DIR = os.path.join(HERE, "assets", "symbols")
OUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preview_reel.png")

CELL_W, CELL_H = 220, 200
COLS, ROWS = 4, 2  # 8 symbols
PAD = 8
BG_DEEP_BROWN = (59, 30, 8, 255)
BG_WARM_TAN = (210, 166, 121, 255)
BORDER_DARK = (42, 20, 0, 255)
LABEL_COLOR = (245, 236, 215, 255)

ENTRIES = [
    ("Miner",     "wild_miner.png"),
    ("Dynamite",  "scatter_dynamite.png"),
    ("Jackpot",   "jackpot_cart.png"),
    ("Nugget",    "gold_nugget.png"),
    ("Pickaxe",   "pickaxe.png"),
    ("Mine Cart", "mine_cart.png"),
    ("King",      "card_k.png"),
    ("Ace",       "card_a.png"),
]


def find_font(size: int) -> ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\RobotoSlab-Bold.ttf",
        r"C:\Windows\Fonts\BebasNeue-Regular.ttf",
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def main() -> None:
    grid_w = COLS * CELL_W
    grid_h = ROWS * CELL_H
    img = Image.new("RGBA", (grid_w, grid_h), BG_WARM_TAN)
    draw = ImageDraw.Draw(img)
    font = find_font(16)

    for i, (label, filename) in enumerate(ENTRIES):
        col = i % COLS
        row = i // COLS
        x = col * CELL_W
        y = row * CELL_H

        # Cell background
        draw.rectangle([x + 1, y + 1, x + CELL_W - 2, y + CELL_H - 2], fill=BG_DEEP_BROWN, outline=BORDER_DARK)

        # Symbol image, fit with label space at the bottom
        sym_path = os.path.join(SYM_DIR, filename)
        if os.path.exists(sym_path):
            sym = Image.open(sym_path).convert("RGBA")
            pad_top, pad_bottom = 6, 28
            max_w = CELL_W - 16
            max_h = CELL_H - pad_top - pad_bottom
            fit = min(max_w / sym.width, max_h / sym.height)
            new_size = (int(sym.width * fit), int(sym.height * fit))
            sym = sym.resize(new_size, Image.LANCZOS)
            sx = x + (CELL_W - new_size[0]) // 2
            sy = y + pad_top + (max_h - new_size[1]) // 2
            img.paste(sym, (sx, sy), sym)

        # Label
        tw = draw.textlength(label.upper(), font=font)
        draw.text((x + (CELL_W - tw) / 2, y + CELL_H - 22), label.upper(), font=font, fill=LABEL_COLOR)

    img.save(OUT_PATH)
    print(f"Wrote {OUT_PATH}  ({grid_w}x{grid_h})")


if __name__ == "__main__":
    main()
