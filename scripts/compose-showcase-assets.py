#!/usr/bin/env python3
import subprocess, io, os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TMP_DIR = '/tmp/zyron-captures'

def get_git_base(file_path):
    cmd = ['git', 'show', f'826c8b5c:{file_path}']
    data = subprocess.check_output(cmd)
    return Image.open(io.BytesIO(data))

def apply_rounded_corners_and_shadow(bg, win, offset_x, offset_y, radius=36, shadow_opacity=180, is_dark=True):
    target_win_size = win.size
    
    # Ensure window is 100% solid with no alpha transparency inside
    solid_color = (16, 16, 18, 255) if is_dark else (251, 251, 251, 255)
    solid_backing = Image.new('RGBA', target_win_size, solid_color)
    win_rgba = Image.alpha_composite(solid_backing, win.convert('RGBA'))

    # 1. Window mask with rounded corners
    mask = Image.new('L', target_win_size, 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.rounded_rectangle([(0, 0), target_win_size], radius=radius, fill=255)

    # 2. Add subtle border inside window
    draw_win = ImageDraw.Draw(win_rgba)
    stroke_color = (255, 255, 255, 30) if is_dark else (0, 0, 0, 30)
    draw_win.rounded_rectangle([(0, 0), (target_win_size[0]-1, target_win_size[1]-1)], radius=radius, outline=stroke_color, width=1)

    # 3. Create dual-layer drop shadow
    shadow = Image.new('RGBA', bg.size, (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    
    # Ambient shadow (large blur)
    sdraw.rounded_rectangle(
        [(offset_x, offset_y + 20), (offset_x + target_win_size[0], offset_y + target_win_size[1] + 20)],
        radius=radius,
        fill=(0, 0, 0, shadow_opacity)
    )
    ambient_shadow = shadow.filter(ImageFilter.GaussianBlur(40))

    # Direct shadow (tighter elevation)
    shadow2 = Image.new('RGBA', bg.size, (0, 0, 0, 0))
    sdraw2 = ImageDraw.Draw(shadow2)
    sdraw2.rounded_rectangle(
        [(offset_x, offset_y + 8), (offset_x + target_win_size[0], offset_y + target_win_size[1] + 8)],
        radius=radius,
        fill=(0, 0, 0, int(shadow_opacity * 0.7))
    )
    direct_shadow = shadow2.filter(ImageFilter.GaussianBlur(15))

    # Combine background and shadows
    result = Image.alpha_composite(bg.convert('RGBA'), ambient_shadow)
    result = Image.alpha_composite(result, direct_shadow)

    # Paste window with rounded mask
    result.paste(win_rgba, (offset_x, offset_y), mask)
    return result

def generate_og_image(dark_stage):
    print("Generating pure Zyron og.png (1200x600)...")
    im = Image.new('RGB', (1200, 600), (11, 12, 16))

    # Paste Zyron Icon (84x84)
    icon_path = os.path.join(ROOT, 'apps/marketing/public/zyron-icon.png')
    tight_icon_path = f'{TMP_DIR}/zyron-icon-tight.png'
    eff_icon_path = tight_icon_path if os.path.exists(tight_icon_path) else icon_path
    if os.path.exists(eff_icon_path):
        icon = Image.open(eff_icon_path).convert('RGBA')
        icon_resized = icon.resize((84, 84), Image.Resampling.LANCZOS)
        im.paste(icon_resized, (64, 60), icon_resized)

    # Fonts
    font_bold = ImageFont.truetype('/usr/share/fonts/TTF/DejaVuSans-Bold.ttf', 48)
    font_subtitle = ImageFont.truetype('/usr/share/fonts/TTF/DejaVuSans-Bold.ttf', 19)
    font_body = ImageFont.truetype('/usr/share/fonts/Adwaita/AdwaitaSans-Regular.ttf', 15)
    font_badge = ImageFont.truetype('/usr/share/fonts/TTF/DejaVuSans-Bold.ttf', 12)

    draw = ImageDraw.Draw(im)
    draw.text((168, 76), "Zyron", font=font_bold, fill=(245, 247, 252))

    # Product category / Tagline
    draw.text((64, 180), "The local-first workspace and\ncontrol plane for coding agents.", font=font_subtitle, fill=(235, 238, 245), spacing=7)

    draw.text((64, 252), "Run Claude Code, Codex, Cursor, and Antigravity\nin parallel across Git worktrees, browser, and diffs.", font=font_body, fill=(150, 158, 175), spacing=5)

    # Badges
    badges = ["Claude Code", "Codex", "Cursor", "Antigravity", "Worktrees", "Multi-Agent"]
    bx = 64
    by = 330
    for badge in badges:
        bbox = draw.textbbox((0, 0), badge, font=font_badge)
        bw = bbox[2] - bbox[0] + 20
        bh = 28
        draw.rounded_rectangle([(bx, by), (bx + bw, by + bh)], radius=6, fill=(22, 25, 34), outline=(45, 52, 68), width=1)
        draw.text((bx + 10, by + 6), badge, font=font_badge, fill=(190, 205, 225))
        bx += bw + 8
        if bx > 450:
            bx = 64
            by += 36

    # Open Source & Creator metadata
    draw.text((64, 520), "Open Source · Free · Local-First · https://ai.zyron.site", font=font_body, fill=(110, 118, 135))

    # Right side: floating sleek screenshot card of Zyron UI
    card_w = 660
    card_h = 440
    card = dark_stage.resize((card_w, card_h), Image.Resampling.LANCZOS)
    
    card_mask = Image.new('L', (card_w, card_h), 0)
    ImageDraw.Draw(card_mask).rounded_rectangle([(0, 0), (card_w, card_h)], radius=18, fill=255)
    
    card_shadow = Image.new('RGBA', (1200, 600), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(card_shadow)
    sdraw.rounded_rectangle([(500, 70 + 16), (500 + card_w, 70 + card_h + 16)], radius=18, fill=(0, 0, 0, 210))
    card_shadow = card_shadow.filter(ImageFilter.GaussianBlur(30))
    
    im_rgba = Image.alpha_composite(im.convert('RGBA'), card_shadow)
    
    card_rgba = card.convert('RGBA')
    ImageDraw.Draw(card_rgba).rounded_rectangle([(0, 0), (card_w - 1, card_h - 1)], radius=18, outline=(255, 255, 255, 35), width=1)
    im_rgba.paste(card_rgba, (500, 70), card_mask)

    out_og_path = os.path.join(ROOT, 'apps/marketing/public/og.png')
    im_rgba.convert('RGB').save(out_og_path, optimize=True)
    print("og.png written successfully with pure Zyron branding!")

def main():
    print("Starting showcase asset composition with 100% authentic Zyron UI...")

    # Load captures
    dark_stage = Image.open(f'{TMP_DIR}/dark-stage.png')
    light_stage = Image.open(f'{TMP_DIR}/light-stage.png')
    light_stage_wide = Image.open(f'{TMP_DIR}/light-stage-wide.png')
    split_view = Image.open(f'{TMP_DIR}/split-view.png')
    browser_dock = Image.open(f'{TMP_DIR}/browser-dock.png')
    appearance = Image.open(f'{TMP_DIR}/appearance.png')
    split_small = Image.open(f'{TMP_DIR}/split-view-small.png')

    # [1] apps/marketing/public/zyron-ui-dark.png (3228 x 2102)
    print("1. Generating zyron-ui-dark.png...")
    bg_dark = get_git_base('apps/marketing/public/zyron-ui-dark.png')
    composed_dark = apply_rounded_corners_and_shadow(
        bg_dark, dark_stage,
        offset_x=102, offset_y=102,
        radius=36, shadow_opacity=200, is_dark=True
    )
    out_dark_path = os.path.join(ROOT, 'apps/marketing/public/zyron-ui-dark.png')
    composed_dark.convert('RGB').save(out_dark_path, optimize=True)

    # [2] apps/marketing/public/zyron-ui-light.png (3216 x 2090)
    print("2. Generating zyron-ui-light.png...")
    bg_light = get_git_base('apps/marketing/public/zyron-ui-light.png')
    composed_light = apply_rounded_corners_and_shadow(
        bg_light, light_stage,
        offset_x=96, offset_y=96,
        radius=36, shadow_opacity=140, is_dark=False
    )
    out_light_path = os.path.join(ROOT, 'apps/marketing/public/zyron-ui-light.png')
    composed_light.convert('RGB').save(out_light_path, optimize=True)

    # [3] assets/prod/readme-workspace-light.png (3984 x 2696)
    print("3. Generating readme-workspace-light.png (authentic live app window composited on Mediterranean canvas)...")
    base_readme = get_git_base('assets/prod/readme-workspace-light.png').convert('RGBA')

    light_wide_path = f'{TMP_DIR}/light-stage-wide.png'
    if os.path.exists(light_wide_path):
        win = Image.open(light_wide_path)
    else:
        raise FileNotFoundError(f"Missing {light_wide_path}")

    composed_readme = apply_rounded_corners_and_shadow(
        base_readme, win, offset_x=264, offset_y=264, radius=36, shadow_opacity=180, is_dark=False
    )

    out_readme_path = os.path.join(ROOT, 'assets/prod/readme-workspace-light.png')
    composed_readme.convert('RGB').save(out_readme_path, optimize=True)

    # [4] apps/marketing/public/split-zyron.png (3024 x 1898)
    print("4. Saving split-zyron.png...")
    out_split_path = os.path.join(ROOT, 'apps/marketing/public/split-zyron.png')
    split_view.convert('RGB').save(out_split_path, optimize=True)

    # [5] apps/marketing/public/browser-zyron.png (3024 x 1898)
    print("5. Saving browser-zyron.png...")
    out_browser_path = os.path.join(ROOT, 'apps/marketing/public/browser-zyron.png')
    browser_dock.convert('RGB').save(out_browser_path, optimize=True)

    # [6] assets/prod/readme-split-view-dark.png (1280 x 803)
    print("6. Saving readme-split-view-dark.png (1280x803)...")
    split_1280 = split_small.resize((1280, 803), Image.Resampling.LANCZOS)
    out_split_small_path = os.path.join(ROOT, 'assets/prod/readme-split-view-dark.png')
    split_1280.convert('RGB').save(out_split_small_path, optimize=True)

    # [7] assets/prod/readme-appearance-dark.png (1280 x 803)
    print("7. Saving readme-appearance-dark.png (1280x803)...")
    app_1280 = appearance.resize((1280, 803), Image.Resampling.LANCZOS)
    out_app_path = os.path.join(ROOT, 'assets/prod/readme-appearance-dark.png')
    app_1280.convert('RGB').save(out_app_path, optimize=True)

    # [8] apps/marketing/public/projects-zyron.png (516 x 480)
    print("8. Generating projects-zyron.png (516x480)...")
    # Crop the expanded sidebar from dark_stage
    # Top bar is 80px, sidebar width is 580px
    projects_crop = dark_stage.crop((0, 80, 580, 80 + 540)).resize((516, 480), Image.Resampling.LANCZOS)
    out_proj_path = os.path.join(ROOT, 'apps/marketing/public/projects-zyron.png')
    projects_crop.convert('RGB').save(out_proj_path, optimize=True)

    # [9] apps/marketing/public/screenshot.jpeg (1800 x 1100)
    print("9. Generating screenshot.jpeg (1800x1100)...")
    landing_shot_path = f'{TMP_DIR}/screenshot-landing.png'
    if os.path.exists(landing_shot_path):
        landing_img = Image.open(landing_shot_path)
        hero_shot = landing_img.resize((1800, 1100), Image.Resampling.LANCZOS)
    else:
        hero_shot = composed_dark.resize((1800, 1172), Image.Resampling.LANCZOS)
        hero_shot = hero_shot.crop((0, 36, 1800, 36 + 1100))
    out_screen_path = os.path.join(ROOT, 'apps/marketing/public/screenshot.jpeg')
    hero_shot.convert('RGB').save(out_screen_path, 'JPEG', quality=98, optimize=True)

    # [10] assets/prod/zyron-hero.jpeg (1920 x 1080)
    print("10. Generating zyron-hero.jpeg (1920x1080 full desktop showcase)...")
    hero_full_path = f'{TMP_DIR}/hero-fullscreen.png'
    if os.path.exists(hero_full_path):
        hero_raw = Image.open(hero_full_path)
    else:
        hero_raw = dark_stage
    hero_1080 = hero_raw.resize((1920, 1080), Image.Resampling.LANCZOS)
    out_hero_path = os.path.join(ROOT, 'assets/prod/zyron-hero.jpeg')
    hero_1080.convert('RGB').save(out_hero_path, 'JPEG', quality=98, optimize=True)

    # [11] apps/marketing/public/og.png (1200 x 600)
    print("11. Generating og.png via Playwright HTML/CSS...")
    try:
        subprocess.check_call(['node', os.path.join(ROOT, 'scripts/generate-og.mjs')])
    except Exception as e:
        print(f"Warning: generate-og.mjs failed ({e}), falling back to PIL generator")
        generate_og_image(dark_stage)

    print("All showcase assets composed successfully with pure Zyron branding!")

if __name__ == '__main__':
    main()
