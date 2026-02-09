#!/bin/bash
# Generate visual mockups with Paris France sample data

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

# Screen 3: Map View (Paris France)
convert -size ${WIDTH}x${HEIGHT} \
  -define gradient:angle=180 \
  gradient:"#1a3a4a-${BG_SECONDARY}" \
  \( -size $((WIDTH-32))x100 xc:"${SURFACE}" -alpha set -channel A -evaluate multiply 0.95 +channel -blur 0x4 -fill "${TEXT_PRIMARY}" -pointsize 24 -font "DejaVu-Sans-Bold" -gravity northwest -annotate +20+20 "Places" -fill "${TEXT_SECONDARY}" -pointsize 14 -annotate +20+52 "Paris Trip • May 2026" \) -geometry +16+60 -composite \
  \( -size 48x48 -define gradient:angle=135 gradient:"${ELECTRIC_BLUE}-#0369a1" -blur 0x1 -fill white -pointsize 24 -gravity center -annotate +0+0 "📍" \) -geometry +80+320 -composite \
  \( -size 48x48 -define gradient:angle=135 gradient:"${EMERALD}-#059669" -blur 0x1 -fill white -pointsize 24 -gravity center -annotate +0+0 "🥐" \) -geometry +200+400 -composite \
  \( -size 48x48 -define gradient:angle=135 gradient:"${ELECTRIC_BLUE}-#0369a1" -blur 0x1 -fill white -pointsize 24 -gravity center -annotate +0+0 "🏠" \) -geometry +260+280 -composite \
  \( -size $((WIDTH-32))x80 xc:"${SURFACE}" -alpha set -channel A -evaluate multiply 0.9 +channel -blur 0x4 -fill "${TEXT_PRIMARY}" -pointsize 18 -font "DejaVu-Sans" -gravity northwest -annotate +16+16 "Eiffel Tower" -fill "${TEXT_SECONDARY}" -pointsize 14 -annotate +16+42 "Tourist attraction • 3.2 km" \) -geometry +16+700 -composite \
  map-view.png

# Screen 4: Design System Overview (no location-specific data)
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

echo "✅ Updated mockups with Paris France sample data"
ls -lh map-view.png design-system.png
