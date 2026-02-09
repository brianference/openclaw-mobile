#!/bin/bash
# Generate visual mockups from Morpheus design specs

# Colors from design-spec.md
ELECTRIC_BLUE="#0ea5e9"
EMERALD="#10b981"
BG_PRIMARY="#0a0a0a"
BG_SECONDARY="#1a1a1a"
SURFACE="#2d2d2d"
TEXT_PRIMARY="#f5f5f5"
TEXT_SECONDARY="#a3a3a3"

# Mobile viewport (iPhone 14 Pro)
WIDTH=393
HEIGHT=852

cd /root/.openclaw/workspace/projects/mobileclaw/design-mockups

# Screen 1: Task Board
convert -size ${WIDTH}x${HEIGHT} \
  -define gradient:angle=135 \
  gradient:"${BG_PRIMARY}-${BG_SECONDARY}" \
  \( -size $((WIDTH-32))x120 xc:"${SURFACE}" -alpha set -channel A -evaluate multiply 0.9 +channel -blur 0x4 -fill "${TEXT_PRIMARY}" -pointsize 28 -font "DejaVu-Sans-Bold" -gravity northwest -annotate +24+24 "Tasks" \) -geometry +16+60 -composite \
  \( -size $((WIDTH-32))x80 xc:"${SURFACE}" -alpha set -channel A -evaluate multiply 0.8 +channel -blur 0x4 -fill "${TEXT_PRIMARY}" -pointsize 18 -font "DejaVu-Sans" -gravity northwest -annotate +16+16 "Build vault encryption" -fill "${TEXT_SECONDARY}" -pointsize 14 -annotate +16+44 "In Progress • High Priority" \) -geometry +16+200 -composite \
  \( -size $((WIDTH-32))x80 xc:"${SURFACE}" -alpha set -channel A -evaluate multiply 0.8 +channel -blur 0x4 -fill "${TEXT_PRIMARY}" -pointsize 18 -font "DejaVu-Sans" -gravity northwest -annotate +16+16 "Design MobileClaw UI" -fill "${EMERALD}" -pointsize 14 -annotate +16+44 "Done • 25 screens" \) -geometry +16+300 -composite \
  \( -size $((WIDTH-32))x80 xc:"${SURFACE}" -alpha set -channel A -evaluate multiply 0.8 +channel -blur 0x4 -fill "${TEXT_PRIMARY}" -pointsize 18 -font "DejaVu-Sans" -gravity northwest -annotate +16+16 "Test suite writing" -fill "${TEXT_SECONDARY}" -pointsize 14 -annotate +16+44 "Next Up • 42 tests" \) -geometry +16+400 -composite \
  \( -size 60x60 -define gradient:angle=135 gradient:"${ELECTRIC_BLUE}-#0369a1" -blur 0x2 \) -geometry +$((WIDTH-76))+$((HEIGHT-76)) -composite \
  task-board.png

# Screen 2: Vault Unlock
convert -size ${WIDTH}x${HEIGHT} \
  -define gradient:angle=135 \
  gradient:"${BG_PRIMARY}-${BG_SECONDARY}" \
  \( -size $((WIDTH-64))x240 xc:"${SURFACE}" -alpha set -channel A -evaluate multiply 0.9 +channel -blur 0x4 \
     -fill "${TEXT_PRIMARY}" -pointsize 32 -font "DejaVu-Sans-Bold" -gravity center -annotate +0-60 "🔐" \
     -fill "${TEXT_PRIMARY}" -pointsize 24 -annotate +0-10 "Unlock Vault" \
     -fill "${TEXT_SECONDARY}" -pointsize 16 -annotate +0+20 "Enter your password" \) -geometry +32+240 -composite \
  \( -size $((WIDTH-64))x56 xc:"${SURFACE}" -alpha set -channel A -evaluate multiply 0.8 +channel -blur 0x2 -fill "${TEXT_SECONDARY}" -pointsize 16 -gravity west -annotate +16+0 "••••••••" \) -geometry +32+520 -composite \
  \( -size $((WIDTH-64))x56 -define gradient:angle=135 gradient:"${ELECTRIC_BLUE}-#0369a1" -blur 0x2 -fill white -pointsize 18 -font "DejaVu-Sans-Bold" -gravity center -annotate +0+0 "Unlock" \) -geometry +32+600 -composite \
  vault-unlock.png

# Screen 3: Map View  
convert -size ${WIDTH}x${HEIGHT} \
  -define gradient:angle=180 \
  gradient:"#1a3a4a-${BG_SECONDARY}" \
  \( -size $((WIDTH-32))x100 xc:"${SURFACE}" -alpha set -channel A -evaluate multiply 0.95 +channel -blur 0x4 -fill "${TEXT_PRIMARY}" -pointsize 24 -font "DejaVu-Sans-Bold" -gravity northwest -annotate +20+20 "Places" -fill "${TEXT_SECONDARY}" -pointsize 14 -annotate +20+52 "Tokyo • Osaka Trip 2026" \) -geometry +16+60 -composite \
  \( -size 48x48 -define gradient:angle=135 gradient:"${ELECTRIC_BLUE}-#0369a1" -blur 0x1 -fill white -pointsize 24 -gravity center -annotate +0+0 "📍" \) -geometry +80+320 -composite \
  \( -size 48x48 -define gradient:angle=135 gradient:"${EMERALD}-#059669" -blur 0x1 -fill white -pointsize 24 -gravity center -annotate +0+0 "🍜" \) -geometry +200+400 -composite \
  \( -size 48x48 -define gradient:angle=135 gradient:"${ELECTRIC_BLUE}-#0369a1" -blur 0x1 -fill white -pointsize 24 -gravity center -annotate +0+0 "🏠" \) -geometry +260+280 -composite \
  \( -size $((WIDTH-32))x80 xc:"${SURFACE}" -alpha set -channel A -evaluate multiply 0.9 +channel -blur 0x4 -fill "${TEXT_PRIMARY}" -pointsize 18 -font "DejaVu-Sans" -gravity northwest -annotate +16+16 "Shibuya Crossing" -fill "${TEXT_SECONDARY}" -pointsize 14 -annotate +16+42 "Tourist attraction • 2.4 km" \) -geometry +16+700 -composite \
  map-view.png

# Screen 4: Design System Overview
convert -size ${WIDTH}x${HEIGHT} \
  -define gradient:angle=135 \
  gradient:"${BG_PRIMARY}-${BG_SECONDARY}" \
  -fill "${TEXT_PRIMARY}" -pointsize 28 -font "DejaVu-Sans-Bold" -gravity north -annotate +0+40 "MobileClaw Design" \
  -fill "${TEXT_SECONDARY}" -pointsize 14 -gravity north -annotate +0+80 "Electric Blue + Emerald • Dark Mode • 25 Screens" \
  \( -size 100x100 -define gradient:angle=135 gradient:"${ELECTRIC_BLUE}-#0369a1" -blur 0x2 \) -geometry +40+140 -composite \
  -fill "${TEXT_PRIMARY}" -pointsize 12 -gravity northwest -annotate +40+250 "Electric Blue" \
  \( -size 100x100 -define gradient:angle=135 gradient:"${EMERALD}-#059669" -blur 0x2 \) -geometry +160+140 -composite \
  -fill "${TEXT_PRIMARY}" -pointsize 12 -gravity northwest -annotate +160+250 "Emerald" \
  \( -size 100x100 xc:"${SURFACE}" \) -geometry +280+140 -composite \
  -fill "${TEXT_PRIMARY}" -pointsize 12 -gravity northwest -annotate +280+250 "Surface" \
  \( -size $((WIDTH-64))x60 xc:"${SURFACE}" -alpha set -channel A -evaluate multiply 0.8 +channel -blur 0x4 -fill "${TEXT_PRIMARY}" -pointsize 16 -gravity center -annotate +0+0 "Glass Card Component" \) -geometry +32+320 -composite \
  \( -size $((WIDTH-64))x56 -define gradient:angle=135 gradient:"${ELECTRIC_BLUE}-#0369a1" -blur 0x2 -fill white -pointsize 18 -font "DejaVu-Sans-Bold" -gravity center -annotate +0+0 "Primary Button" \) -geometry +32+420 -composite \
  \( -size $((WIDTH-64))x56 xc:"${SURFACE}" -alpha set -channel A -evaluate multiply 0.6 +channel -blur 0x2 -fill "${TEXT_PRIMARY}" -pointsize 18 -font "DejaVu-Sans" -gravity center -annotate +0+0 "Secondary Button" \) -geometry +32+500 -composite \
  -fill "${TEXT_SECONDARY}" -pointsize 14 -gravity south -annotate +0+100 "WCAG 2.2 AA Compliant" \
  -fill "${TEXT_SECONDARY}" -pointsize 14 -gravity south -annotate +0+70 "44px Touch Targets • Reduced Motion" \
  -fill "${TEXT_SECONDARY}" -pointsize 14 -gravity south -annotate +0+40 "210KB Design Docs • 25 UX Tests" \
  design-system.png

echo "✅ Generated 4 mockups"
ls -lh *.png
