"""
PingClose logo renderer — "Velocity Signal" design philosophy
Outputs: pingclose-logo.png (800x240) and pingclose-icon.png (200x200)
"""

from PIL import Image, ImageDraw, ImageFont
import math, os, sys

# ─── PALETTE ────────────────────────────────────────────────────
BG    = (11, 14, 22)
TEAL  = (16, 217, 160)
WHITE = (241, 245, 249)

# ─── FONT ───────────────────────────────────────────────────────
SKILL_FONTS = (
    r"C:\Users\Jim Fogal\AppData\Roaming\Claude\local-agent-mode-sessions"
    r"\skills-plugin\265bcaa2-c567-4ab0-b5aa-e76e8f69da32"
    r"\0021617e-4a06-41b4-9bac-ae8854f8af0f\skills\canvas-design\canvas-fonts"
)
FONT_BOLD = os.path.join(SKILL_FONTS, "BricolageGrotesque-Bold.ttf")
OUT_DIR   = os.path.dirname(os.path.abspath(__file__))

# ─── HELPERS ────────────────────────────────────────────────────
def make_canvas(w, h, scale=3):
    return Image.new("RGB", (w * scale, h * scale), BG), scale

def draw_radar(draw, ox, oy, scale, radii, widths, alphas, sweep=(270, 360)):
    """Draw concentric arcs from origin (ox, oy) at given scale."""
    for r, width, alpha in zip(radii, widths, alphas):
        rs = r * scale
        ws = max(2, int(width * scale))
        bbox = [ox - rs, oy - rs, ox + rs, oy + rs]
        draw.arc(bbox, start=sweep[0], end=sweep[1],
                 fill=(*TEAL, alpha), width=ws)

def draw_origin_dot(draw, ox, oy, scale, radius=5.5):
    r = radius * scale
    # Subtle glow ring
    draw.ellipse([ox - r*1.8, oy - r*1.8, ox + r*1.8, oy + r*1.8],
                 fill=(*TEAL, 30))
    draw.ellipse([ox - r*1.3, oy - r*1.3, ox + r*1.3, oy + r*1.3],
                 fill=(*TEAL, 60))
    draw.ellipse([ox - r, oy - r, ox + r, oy + r], fill=TEAL)

def draw_tick_marks(draw, ox, oy, scale, radii):
    """Tiny tick marks at arc endpoints (0°/right and 270°/top) for precision feel."""
    tick = 7 * scale
    lw   = max(1, int(1.5 * scale))
    for r in radii:
        rs = r * scale
        # Right-side tick (end of arc at 0°)
        x = ox + rs
        draw.line([(x, oy - tick // 2), (x, oy + tick // 2)],
                  fill=(*TEAL, 120), width=lw)
        # Top-side tick (start of arc at 270°)
        y = oy - rs
        draw.line([(ox - tick // 2, y), (ox + tick // 2, y)],
                  fill=(*TEAL, 120), width=lw)

# ─── FULL LOGO  800 × 240 ───────────────────────────────────────
def render_logo():
    SCALE = 4          # render at 4× for pristine AA
    FINAL_W, FINAL_H = 800, 240
    W, H = FINAL_W * SCALE, FINAL_H * SCALE

    img  = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img, "RGBA")

    # Icon origin: lower-left of icon zone (icon zone is left 220px)
    ICON_ZONE_W = 220
    PAD = 34
    ox = int(PAD * SCALE)
    oy = int((FINAL_H - PAD) * SCALE)

    # Radar arcs (final-pixel radii)
    radii  = [38, 72, 106, 140]
    widths = [3.2, 2.6, 2.0, 1.5]
    alphas = [255, 200, 140, 75]

    draw_radar(draw, ox, oy, SCALE, radii, widths, alphas)
    draw_tick_marks(draw, ox, oy, SCALE, radii)
    draw_origin_dot(draw, ox, oy, SCALE, radius=5.5)

    # Wordmark
    try:
        font = ImageFont.truetype(FONT_BOLD, int(82 * SCALE))
    except Exception as e:
        print(f"Font error: {e}")
        sys.exit(1)

    # Measure "Ping" so "Close" continues flush
    tx = int((ICON_ZONE_W + 8) * SCALE)
    ty = int((FINAL_H // 2) * SCALE)

    ping_box  = draw.textbbox((tx, ty), "Ping",  font=font, anchor="lm")
    ping_w    = ping_box[2] - ping_box[0]

    draw.text((tx, ty),          "Ping",  font=font, fill=TEAL,  anchor="lm")
    draw.text((tx + ping_w, ty), "Close", font=font, fill=WHITE, anchor="lm")

    # Subtle separator line between icon and wordmark
    sep_x = int((ICON_ZONE_W - 10) * SCALE)
    sep_y0 = int(30 * SCALE)
    sep_y1 = int((FINAL_H - 30) * SCALE)
    draw.line([(sep_x, sep_y0), (sep_x, sep_y1)], fill=(*TEAL, 35), width=2)

    # Tagline
    try:
        font_sm = ImageFont.truetype(
            os.path.join(SKILL_FONTS, "WorkSans-Regular.ttf"),
            int(14 * SCALE)
        )
        # Position just below wordmark
        tag_x = tx
        tag_y = int((FINAL_H // 2 + 52) * SCALE)
        draw.text((tag_x, tag_y),
                  "free website speed test for local businesses",
                  font=font_sm, fill=(*TEAL, 160), anchor="lm")
    except Exception:
        pass

    # Downsample
    final = img.resize((FINAL_W, FINAL_H), Image.LANCZOS)
    out = os.path.join(OUT_DIR, "pingclose-logo.png")
    final.save(out, optimize=True)
    print(f"Logo saved: {out}")

# ─── STANDALONE ICON  200 × 200 ─────────────────────────────────
def render_icon():
    SCALE = 4
    SZ    = 200
    W = SZ * SCALE

    img  = Image.new("RGB", (W, W), BG)
    draw = ImageDraw.Draw(img, "RGBA")

    # Rounded background pill
    pill_pad = int(12 * SCALE)
    draw.rounded_rectangle(
        [pill_pad, pill_pad, W - pill_pad, W - pill_pad],
        radius=int(24 * SCALE),
        fill=(16, 217, 160, 12)
    )

    # Origin: lower-left quadrant
    ox = int(48 * SCALE)
    oy = int(152 * SCALE)

    radii  = [28, 55, 82, 109]
    widths = [4.0, 3.4, 2.8, 2.2]
    alphas = [255, 210, 155, 85]

    draw_radar(draw, ox, oy, SCALE, radii, widths, alphas)
    draw_tick_marks(draw, ox, oy, SCALE, radii)
    draw_origin_dot(draw, ox, oy, SCALE, radius=6.5)

    # Subtle "PC" micro-label in corner
    try:
        font_lbl = ImageFont.truetype(
            os.path.join(SKILL_FONTS, "GeistMono-Regular.ttf"),
            int(13 * SCALE)
        )
        draw.text(
            (int(158 * SCALE), int(168 * SCALE)),
            "PC", font=font_lbl, fill=(*TEAL, 70), anchor="rm"
        )
    except Exception:
        pass

    final = img.resize((SZ, SZ), Image.LANCZOS)
    out = os.path.join(OUT_DIR, "pingclose-icon.png")
    final.save(out, optimize=True)
    print(f"Icon saved: {out}")

# ─── FAVICON  32 × 32 ───────────────────────────────────────────
def render_favicon():
    SCALE = 8     # render at 8× → 256px, then crush to 32px
    SZ    = 32
    W     = SZ * SCALE

    img  = Image.new("RGB", (W, W), BG)
    draw = ImageDraw.Draw(img, "RGBA")

    ox = int(10 * SCALE)
    oy = int(22 * SCALE)

    radii  = [8, 14, 20]
    widths = [2.2, 1.8, 1.4]
    alphas = [255, 190, 110]

    draw_radar(draw, ox, oy, SCALE, radii, widths, alphas)
    draw_origin_dot(draw, ox, oy, SCALE, radius=2.2)

    final = img.resize((SZ, SZ), Image.LANCZOS)
    out = os.path.join(OUT_DIR, "pingclose-favicon.png")
    final.save(out, optimize=True)
    print(f"Favicon saved: {out}")

if __name__ == "__main__":
    render_logo()
    render_icon()
    render_favicon()
    print("All done.")
