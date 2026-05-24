"""
Build slot game assets from the Gold Rush Bonanza source assets.

Resizes 1024x1024 source PNGs into web-optimized 256x256 RGBA PNGs for the slot
reel symbols, and produces sized UI assets (background, frame, title, spin
button) for the game shell.

Source : C:/Users/eetienne/.paperclip/instances/default/projects/Gold Rush Bonanza-assets
Target : ./assets/symbols/*.png  and  ./assets/ui/*.png

Idempotent: re-running overwrites the output files.
"""
from __future__ import annotations

import os
import sys
from PIL import Image

SRC = r"C:\Users\eetienne\.paperclip\instances\default\projects\Gold Rush Bonanza-assets"
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_SYM = os.path.join(HERE, "assets", "symbols")
OUT_UI = os.path.join(HERE, "assets", "ui")
os.makedirs(OUT_SYM, exist_ok=True)
os.makedirs(OUT_UI, exist_ok=True)

# Symbol mapping: target_name -> source_relative_path
# Prefer transparent foreground variants for reel cells so the symbol can be
# composited cleanly on top of the cell background.
SYMBOL_MAP: dict[str, str] = {
    "wild_miner.png":        r"character_symbol\Miner_Mascot_Miner_foreground.png",
    "scatter_dynamite.png":  r"symbol\Thematic_Symbols_Dynamite_foreground.png",
    "jackpot_cart.png":      r"symbol\Jackpot_Cart_Jackpot_Cart_foreground.png",
    "gold_nugget.png":       r"symbol\High_Value_Gold_Symbols_Gold_Nugget_500_foreground.png",
    "pickaxe.png":           r"symbol\Thematic_Symbols_Pickaxe_foreground.png",
    "gold_cart.png":         r"symbol\Gold_Cart_Values_Gold_Cart_$50_foreground.png",
    "mine_cart.png":         r"symbol\Thematic_Symbols_Non-Value_Gold_Cart_foreground.png",
    # Card symbols (no foreground variant exists for J/K/Q; use composited)
    "card_a.png":            r"symbol\Standard_Reel_Symbols_A_foreground.png",
    "card_k.png":            r"symbol\Standard_Reel_Symbols_K.png",
    "card_q.png":            r"symbol\Standard_Reel_Symbols_Q.png",
    "card_j.png":            r"symbol\Standard_Reel_Symbols_J.png",
}

SYMBOL_SIZE = 256


def build_symbols() -> None:
    for out_name, rel in SYMBOL_MAP.items():
        src_path = os.path.join(SRC, rel)
        out_path = os.path.join(OUT_SYM, out_name)
        if not os.path.exists(src_path):
            print(f"  MISSING: {src_path}", file=sys.stderr)
            continue
        im = Image.open(src_path).convert("RGBA")
        im = im.resize((SYMBOL_SIZE, SYMBOL_SIZE), Image.LANCZOS)
        im.save(out_path, optimize=True)
        print(f"  symbol {out_name:24s}  <- {rel}")


# UI elements (background, frame, title, button) — keep aspect ratio, fit into
# a sensible web bound so the deploy doesn't ship 5MB PNGs.
UI_MAP: list[tuple[str, str, tuple[int, int]]] = [
    ("background.jpg", r"background\Game_Background_background_1777595836135.png", (1600, 900)),
    ("frame.png",      r"frame\Game_Frame_frame_1777595836135_transparent.png",     (900, 588)),
    ("title.png",      r"game_title\Game_Title_title_1777595835481_transparent.png",(960, 200)),
    ("spin_btn.png",       r"button\Spin_Button_SPIN_Button_button.png",             (320, 320)),
    ("spin_btn_hover.png", r"button\Spin_Button_SPIN_Button_button_hover.png",       (320, 320)),
]


def build_ui() -> None:
    for out_name, rel, size in UI_MAP:
        src_path = os.path.join(SRC, rel)
        out_path = os.path.join(OUT_UI, out_name)
        if not os.path.exists(src_path):
            print(f"  MISSING: {src_path}", file=sys.stderr)
            continue
        im = Image.open(src_path)
        if out_name.endswith(".jpg"):
            im = im.convert("RGB")
        else:
            im = im.convert("RGBA")
        im.thumbnail(size, Image.LANCZOS)
        if out_name.endswith(".jpg"):
            im.save(out_path, format="JPEG", quality=86, optimize=True)
        else:
            im.save(out_path, format="PNG", optimize=True)
        print(f"  ui     {out_name:20s}  <- {rel}  -> {im.size}")


if __name__ == "__main__":
    print("Building symbol assets...")
    build_symbols()
    print("\nBuilding UI assets...")
    build_ui()
    print("\nDone.")
