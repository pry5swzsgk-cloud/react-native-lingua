"""Draws Lingo's own mascots (Dax the dino, Bo the dog) and the app icons.

Run from the project root:  python3 scripts/generate-mascots.py
Needs Pillow (pip install pillow). Writes PNGs into assets/images/.
Everything is drawn from simple shapes, so it is easy to tweak colors here.
"""

import math
from PIL import Image, ImageDraw

SIZE = 1024
SS = 3  # supersampling for smooth edges
OUTLINE = (35, 40, 80, 255)
WHITE = (255, 255, 255, 255)
PINK = (255, 157, 177, 255)
PURPLE = (108, 78, 245, 255)  # brand color

# Dax the dino
MINT = (94, 214, 160, 255)
MINT_LIGHT = (217, 247, 230, 255)
YELLOW = (255, 203, 0, 255)

# Bo the dog
GOLD = (232, 165, 91, 255)
BROWN = (181, 115, 58, 255)
CREAM = (255, 241, 214, 255)
NOSE = (45, 35, 40, 255)


class Canvas:
    def __init__(self):
        self.img = Image.new("RGBA", (SIZE * SS, SIZE * SS), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.img)

    def _s(self, v):
        return v * SS

    def ellipse(self, cx, cy, rx, ry, fill, line=14):
        box = [self._s(cx - rx), self._s(cy - ry), self._s(cx + rx), self._s(cy + ry)]
        if line:
            self.d.ellipse(box, fill=fill, outline=OUTLINE, width=self._s(line))
        else:
            self.d.ellipse(box, fill=fill)

    def polygon(self, points, fill, line=14):
        pts = [(self._s(x), self._s(y)) for x, y in points]
        self.d.polygon(pts, fill=fill)
        if line:
            self.d.line(pts + [pts[0]], fill=OUTLINE, width=self._s(line), joint="curve")

    def thick_line(self, a, b, width, fill):
        # outline first, then the colored line on top, both with round ends
        for w, col in ((width + 28, OUTLINE), (width, fill)):
            self.d.line(
                [(self._s(a[0]), self._s(a[1])), (self._s(b[0]), self._s(b[1]))],
                fill=col,
                width=self._s(w),
            )
            for x, y in (a, b):
                r = w / 2
                self.d.ellipse(
                    [self._s(x - r), self._s(y - r), self._s(x + r), self._s(y + r)],
                    fill=col,
                )

    def arc(self, box, start, end, width=14, fill=OUTLINE):
        self.d.arc([self._s(v) for v in box], start, end, fill=fill, width=self._s(width))

    def result(self):
        return self.img.resize((SIZE, SIZE), Image.LANCZOS)


def eye(c, x, y, r, pupil_r, look=(8, 4)):
    c.ellipse(x, y, r, r, WHITE, line=12)
    c.ellipse(x + look[0], y + look[1], pupil_r, pupil_r, OUTLINE, line=0)
    c.ellipse(x + look[0] + pupil_r * 0.35, y + look[1] - pupil_r * 0.4, pupil_r * 0.35, pupil_r * 0.35, WHITE, line=0)


def draw_dax():
    c = Canvas()
    cx, cy, rx, ry = 480, 600, 310, 340

    # tail
    c.polygon([(690, 560), (820, 570), (925, 650), (975, 765), (900, 735), (820, 715), (700, 770)], MINT)

    # back spikes: triangles placed along the upper right of the body
    for deg in (100, 75, 50, 28, 8):
        t = math.radians(deg)
        px, py = cx + rx * math.cos(t), cy - ry * math.sin(t)
        nx, ny = math.cos(t) / rx, -math.sin(t) / ry
        n = math.hypot(nx, ny)
        nx, ny = nx / n, ny / n
        tx, ty = -ny, nx
        base = 62
        tip = (px + nx * 105, py + ny * 105)
        c.polygon([(px + tx * base, py + ty * base), tip, (px - tx * base, py - ty * base)], YELLOW)

    # arms (behind the body so only the hands peek out)
    c.ellipse(205, 690, 75, 52, MINT)
    c.ellipse(755, 690, 75, 52, MINT)

    # body + belly
    c.ellipse(cx, cy, rx, ry, MINT)
    c.ellipse(cx, 715, 205, 215, MINT_LIGHT, line=0)

    # feet
    c.ellipse(350, 935, 115, 55, MINT)
    c.ellipse(610, 935, 115, 55, MINT)

    # face
    eye(c, 385, 470, 72, 38)
    eye(c, 575, 470, 72, 38)
    c.ellipse(290, 575, 44, 34, PINK, line=0)
    c.ellipse(670, 575, 44, 34, PINK, line=0)
    c.ellipse(455, 535, 9, 12, OUTLINE, line=0)
    c.ellipse(505, 535, 9, 12, OUTLINE, line=0)
    c.arc((405, 500, 555, 625), 25, 155, width=15)
    return c.result()


def draw_bo():
    c = Canvas()

    # tail (wagging up)
    c.thick_line((730, 800), (850, 660), 70, GOLD)

    # floppy ears behind the head
    c.ellipse(265, 455, 95, 175, BROWN)
    c.ellipse(759, 455, 95, 175, BROWN)

    # body, chest, legs
    c.ellipse(512, 770, 235, 225, GOLD)
    c.ellipse(512, 840, 135, 150, CREAM, line=0)
    c.ellipse(415, 925, 62, 85, GOLD)
    c.ellipse(609, 925, 62, 85, GOLD)
    c.ellipse(412, 985, 72, 40, CREAM)
    c.ellipse(612, 985, 72, 40, CREAM)

    # head, muzzle
    c.ellipse(512, 420, 270, 240, GOLD)
    c.ellipse(512, 500, 155, 115, CREAM, line=0)

    # face
    eye(c, 410, 395, 38, 38, look=(0, 0))
    eye(c, 614, 395, 38, 38, look=(0, 0))
    c.ellipse(330, 490, 38, 28, PINK, line=0)
    c.ellipse(694, 490, 38, 28, PINK, line=0)
    c.ellipse(512, 555, 38, 46, PINK)  # tongue
    c.arc((432, 470, 592, 575), 20, 160, width=13)
    c.ellipse(512, 460, 55, 38, NOSE, line=0)
    c.ellipse(494, 448, 14, 8, WHITE, line=0)
    return c.result()


def fit(img, size):
    return img.resize((size, size), Image.LANCZOS)


def on_canvas(size, parts):
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    for img, px, py in parts:
        out.alpha_composite(img, (px, py))
    return out


def silhouette(img, color=(0, 0, 0, 255)):
    flat = Image.new("RGBA", img.size, color)
    flat.putalpha(img.getchannel("A"))
    return flat


def main():
    out = "assets/images/"
    dax, bo = draw_dax(), draw_bo()

    dax.save(out + "mascot-dino.png")
    bo.save(out + "mascot-dog.png")

    # Welcome scene: both mascots together (1254 px like the old artwork)
    wide = on_canvas(2000, [(fit(dax, 1000), 0, 600), (fit(bo, 880), 880, 720)])
    wide = wide.crop(wide.getbbox())
    width = 1254
    height = round(wide.height * width / wide.width)
    wide = wide.resize((width, height), Image.LANCZOS)
    scene = on_canvas(1254, [(wide, 0, (1254 - height) // 2)])
    scene.save(out + "mascot-welcome.png")

    # Small logo: Dax only
    dax.save(out + "mascot-logo.png")

    # iOS app icon: no transparency allowed, so Dax sits on the brand color
    icon = Image.new("RGBA", (SIZE, SIZE), PURPLE)
    icon.alpha_composite(fit(dax, 800), (112, 130))
    icon.convert("RGB").save(out + "icon.png")

    # Splash screen (white background is set in app.config.js)
    fit(dax, SIZE).save(out + "splash-icon.png")

    # Android adaptive icon + favicon (iOS is the main target, kept consistent)
    fg = on_canvas(512, [(fit(dax, 330), 91, 100)])
    fg.save(out + "android-icon-foreground.png")
    Image.new("RGBA", (512, 512), PURPLE).save(out + "android-icon-background.png")
    mono = on_canvas(432, [(fit(dax, 280), 76, 84)])
    silhouette(mono).save(out + "android-icon-monochrome.png")
    fit(dax, 48).save(out + "favicon.png")


if __name__ == "__main__":
    main()
