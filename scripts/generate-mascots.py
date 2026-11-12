"""Draws Lingo's own artwork: the mascots, the reward chests, the streak
flame and the app icons.

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

# Collectible mascots
LAVENDER = (190, 170, 248, 255)  # Mimi the cat
LAVENDER_LIGHT = (240, 233, 255, 255)
NAVY = (52, 64, 120, 255)  # Pico the penguin
ORANGE = (255, 159, 28, 255)
FOX = (255, 138, 61, 255)  # Rumi the fox
FOX_DARK = (92, 58, 41, 255)
TEAL = (72, 176, 196, 255)  # Olli the owl
TEAL_DARK = (44, 130, 150, 255)
ROSE = (255, 196, 214, 255)  # Coco the bunny
ROSE_DARK = (255, 150, 180, 255)

# Chests and flame
CHEST_DAILY = ((181, 115, 58, 255), (150, 92, 44, 255))  # body, lid
CHEST_WEEKLY = ((108, 78, 245, 255), (84, 58, 205, 255))
CHEST_INSIDE = (70, 45, 35, 255)
GLOW = (255, 236, 150, 255)
FLAME = (255, 138, 0, 255)


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

    def thick_path(self, points, width, fill):
        # a bent thick line (a tail): all outlines first, then all fills,
        # so the bend has no outline running through it
        pts = [(self._s(x), self._s(y)) for x, y in points]
        for w, col in ((width + 28, OUTLINE), (width, fill)):
            self.d.line(pts, fill=col, width=self._s(w), joint="curve")
            for x, y in points:
                r = w / 2
                self.d.ellipse(
                    [self._s(x - r), self._s(y - r), self._s(x + r), self._s(y + r)],
                    fill=col,
                )

    def line(self, a, b, width=10, fill=OUTLINE):
        # a thin line with round ends (whiskers, teeth)
        self.d.line(
            [(self._s(a[0]), self._s(a[1])), (self._s(b[0]), self._s(b[1]))],
            fill=fill,
            width=self._s(width),
        )
        for x, y in (a, b):
            r = width / 2
            self.d.ellipse(
                [self._s(x - r), self._s(y - r), self._s(x + r), self._s(y + r)],
                fill=fill,
            )

    def rounded_rect(self, x1, y1, x2, y2, radius, fill, line=14):
        self.d.rounded_rectangle(
            [self._s(x1), self._s(y1), self._s(x2), self._s(y2)],
            radius=self._s(radius),
            fill=fill,
            outline=OUTLINE if line else None,
            width=self._s(line),
        )

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


def draw_cat():
    """Mimi: a lavender cat with pointed ears and whiskers."""
    c = Canvas()

    # tail curling up
    c.thick_path([(690, 890), (790, 870), (850, 790), (850, 690), (810, 630)], 56, LAVENDER)

    # ears with pink insides
    c.polygon([(285, 345), (330, 130), (480, 270)], LAVENDER)
    c.polygon([(739, 345), (694, 130), (544, 270)], LAVENDER)
    c.polygon([(328, 300), (346, 195), (425, 262)], PINK, line=0)
    c.polygon([(696, 300), (678, 195), (599, 262)], PINK, line=0)

    # body, belly, feet
    c.ellipse(512, 770, 225, 215, LAVENDER)
    c.ellipse(512, 840, 128, 145, LAVENDER_LIGHT, line=0)
    c.ellipse(415, 965, 78, 44, LAVENDER)
    c.ellipse(609, 965, 78, 44, LAVENDER)

    # head
    c.ellipse(512, 430, 270, 235, LAVENDER)

    # face
    eye(c, 405, 410, 62, 36)
    eye(c, 619, 410, 62, 36)
    c.ellipse(318, 515, 42, 30, PINK, line=0)
    c.ellipse(706, 515, 42, 30, PINK, line=0)
    c.polygon([(488, 480), (536, 480), (512, 510)], PINK, line=9)
    c.arc((460, 492, 514, 550), 10, 170, width=12)
    c.arc((510, 492, 564, 550), 10, 170, width=12)
    for y1, y2 in ((500, 482), (528, 540)):
        c.line((345, y1), (235, y2), width=8)
        c.line((679, y1), (789, y2), width=8)
    return c.result()


def draw_penguin():
    """Pico: a navy penguin with a white front and orange beak."""
    c = Canvas()

    # wings and feet behind the body
    c.ellipse(215, 650, 75, 165, NAVY)
    c.ellipse(809, 650, 75, 165, NAVY)
    c.ellipse(400, 950, 105, 48, ORANGE)
    c.ellipse(624, 950, 105, 48, ORANGE)

    # body with a white front: belly and face
    c.ellipse(512, 590, 305, 370, NAVY)
    c.ellipse(512, 690, 215, 255, WHITE, line=0)
    c.ellipse(420, 445, 128, 122, WHITE, line=0)
    c.ellipse(604, 445, 128, 122, WHITE, line=0)

    # face
    eye(c, 420, 440, 58, 34)
    eye(c, 604, 440, 58, 34)
    c.polygon([(455, 520), (569, 520), (512, 592)], ORANGE)
    c.ellipse(335, 560, 40, 30, PINK, line=0)
    c.ellipse(689, 560, 40, 30, PINK, line=0)
    return c.result()


def draw_fox():
    """Rumi: an orange fox with a bushy tail and white cheeks."""
    c = Canvas()

    # bushy tail with a white tip
    c.ellipse(800, 770, 120, 185, FOX)
    c.ellipse(812, 640, 72, 78, WHITE)

    # ears with dark insides
    c.polygon([(270, 350), (305, 110), (470, 265)], FOX)
    c.polygon([(754, 350), (719, 110), (554, 265)], FOX)
    c.polygon([(318, 292), (333, 185), (412, 255)], FOX_DARK, line=0)
    c.polygon([(706, 292), (691, 185), (612, 255)], FOX_DARK, line=0)

    # body, belly, dark feet
    c.ellipse(512, 775, 215, 205, FOX)
    c.ellipse(512, 845, 120, 135, WHITE, line=0)
    c.ellipse(415, 965, 76, 42, FOX_DARK)
    c.ellipse(609, 965, 76, 42, FOX_DARK)

    # head with white cheeks
    c.ellipse(512, 430, 275, 232, FOX)
    c.ellipse(512, 545, 185, 105, WHITE, line=0)

    # face
    eye(c, 405, 400, 58, 34)
    eye(c, 619, 400, 58, 34)
    c.ellipse(512, 505, 36, 26, NOSE, line=0)
    c.arc((452, 505, 572, 590), 25, 155, width=13)
    c.ellipse(305, 495, 38, 27, PINK, line=0)
    c.ellipse(719, 495, 38, 27, PINK, line=0)
    return c.result()


def draw_owl():
    """Olli: a teal owl with big eyes in yellow rings."""
    c = Canvas()

    # ear tufts, wings and feet behind the body
    c.polygon([(270, 330), (300, 150), (440, 250)], TEAL)
    c.polygon([(754, 330), (724, 150), (584, 250)], TEAL)
    c.ellipse(205, 640, 85, 190, TEAL_DARK)
    c.ellipse(819, 640, 85, 190, TEAL_DARK)
    c.ellipse(420, 955, 80, 40, ORANGE)
    c.ellipse(604, 955, 80, 40, ORANGE)

    # body, belly with little feathers
    c.ellipse(512, 590, 300, 365, TEAL)
    c.ellipse(512, 725, 195, 205, CREAM, line=0)
    for x, y in ((440, 700), (512, 700), (584, 700), (476, 775), (548, 775)):
        c.arc((x - 30, y - 30, x + 30, y + 22), 20, 160, width=10, fill=TEAL_DARK)

    # big eyes and beak
    for x in (400, 624):
        c.ellipse(x, 440, 112, 112, YELLOW)
        eye(c, x, 440, 76, 42, look=(0, 0))
    c.polygon([(474, 525), (550, 525), (512, 592)], ORANGE)
    return c.result()


def draw_bunny():
    """Coco: a pink bunny with long ears and two front teeth."""
    c = Canvas()

    # long ears, fluffy tail
    c.ellipse(400, 215, 70, 180, ROSE)
    c.ellipse(624, 215, 70, 180, ROSE)
    c.ellipse(400, 230, 32, 125, ROSE_DARK, line=0)
    c.ellipse(624, 230, 32, 125, ROSE_DARK, line=0)
    c.ellipse(735, 830, 58, 58, WHITE)

    # body, belly, big feet
    c.ellipse(512, 775, 215, 205, ROSE)
    c.ellipse(512, 845, 122, 138, WHITE, line=0)
    c.ellipse(405, 968, 92, 44, ROSE)
    c.ellipse(619, 968, 92, 44, ROSE)

    # head
    c.ellipse(512, 470, 262, 222, ROSE)

    # face
    eye(c, 410, 450, 56, 34)
    eye(c, 614, 450, 56, 34)
    c.ellipse(315, 545, 42, 30, ROSE_DARK, line=0)
    c.ellipse(709, 545, 42, 30, ROSE_DARK, line=0)
    c.rounded_rect(486, 566, 538, 624, 9, WHITE, line=10)
    c.line((512, 574), (512, 616), width=6)
    c.arc((460, 520, 514, 578), 10, 170, width=12)
    c.arc((510, 520, 564, 578), 10, 170, width=12)
    c.ellipse(512, 518, 27, 19, ROSE_DARK, line=9)
    return c.result()


def star(c, cx, cy, r):
    """A four-pointed sparkle."""
    k = 0.28 * r
    c.polygon(
        [(cx, cy - r), (cx + k, cy - k), (cx + r, cy), (cx + k, cy + k),
         (cx, cy + r), (cx - k, cy + k), (cx - r, cy), (cx - k, cy - k)],
        YELLOW,
        line=9,
    )


def draw_chest(colors, opened):
    """A treasure chest seen from the front, closed or open."""
    body, lid = colors
    c = Canvas()

    if opened:
        # the lid is thrown back: we look at its dark inside
        c.rounded_rect(200, 170, 824, 560, 130, lid)
        c.rounded_rect(245, 215, 779, 560, 95, CHEST_INSIDE, line=0)
        # light and treasure coming out
        c.ellipse(512, 480, 270, 110, GLOW, line=0)
        for x, y in ((395, 478), (512, 452), (628, 478)):
            c.ellipse(x, y, 58, 44, YELLOW, line=10)
        star(c, 320, 120, 46)
        star(c, 512, 78, 60)
        star(c, 712, 126, 40)
    else:
        # closed lid: a big rounded top
        c.rounded_rect(180, 250, 844, 580, 150, lid)

    # body
    c.rounded_rect(180, 500, 844, 880, 46, body)

    # gold straps, rim and lock
    top = 500 if opened else 264
    c.rounded_rect(290, top, 360, 880, 12, YELLOW)
    c.rounded_rect(664, top, 734, 880, 12, YELLOW)
    c.rounded_rect(162, 488, 862, 562, 26, YELLOW)
    c.rounded_rect(458, 500, 566, 645, 26, YELLOW)
    c.ellipse(512, 556, 18, 18, OUTLINE, line=0)
    c.polygon([(503, 560), (521, 560), (528, 608), (496, 608)], OUTLINE, line=0)
    return c.result()


def teardrop(cx, cy, width, height, lean=0.0, steps=72):
    """Points of a flame shape: pointed at the top, round at the bottom."""
    points = []
    for i in range(steps):
        t = 2 * math.pi * i / steps
        x = width * math.sin(t) * math.sin(t / 2) ** 1.4 if t <= math.pi else -width * abs(math.sin(t)) * math.sin(t / 2) ** 1.4
        # the tip leans a little to one side, like a real flame
        x += lean * width * ((math.cos(t) + 1) / 2) ** 2
        points.append((cx + x, cy - height * math.cos(t)))
    return points


def draw_flame():
    """The streak flame: orange outside, yellow inside."""
    c = Canvas()
    c.polygon(teardrop(512, 560, 330, 420, lean=0.22), FLAME)
    c.polygon(teardrop(512, 690, 190, 250, lean=0.15), YELLOW, line=0)
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

    # Collectible mascots (512 px is plenty for how big they are shown)
    fit(draw_cat(), 512).save(out + "mascot-cat.png")
    fit(draw_penguin(), 512).save(out + "mascot-penguin.png")
    fit(draw_fox(), 512).save(out + "mascot-fox.png")
    fit(draw_owl(), 512).save(out + "mascot-owl.png")
    fit(draw_bunny(), 512).save(out + "mascot-bunny.png")

    # Reward chests and the streak flame
    fit(draw_chest(CHEST_DAILY, opened=False), 384).save(out + "chest-daily-closed.png")
    fit(draw_chest(CHEST_DAILY, opened=True), 384).save(out + "chest-daily-open.png")
    fit(draw_chest(CHEST_WEEKLY, opened=False), 384).save(out + "chest-weekly-closed.png")
    fit(draw_chest(CHEST_WEEKLY, opened=True), 384).save(out + "chest-weekly-open.png")
    fit(draw_flame(), 256).save(out + "flame.png")

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
