# PWA Icons

The manifest at `app/manifest.ts` references three PNG files in this folder:

- `icon-192.png` — 192×192 (Android home-screen, Apple touch icon)
- `icon-512.png` — 512×512 (splash screens, large surfaces)
- `icon-maskable-512.png` — 512×512 with safe-zone padding (Android adaptive icons)

The placeholder SVG sources live alongside this README and can be exported with
any image tool (Figma, Inkscape, ImageMagick, etc):

```sh
# Example with ImageMagick
magick convert -background none -resize 192x192 icon-source.svg icon-192.png
magick convert -background none -resize 512x512 icon-source.svg icon-512.png
magick convert -background none -resize 512x512 icon-maskable-source.svg icon-maskable-512.png
```

Until real PNGs ship, browsers will fall back to `/favicon.ico` and the PWA
install banner won't appear, but everything else (offline mode, manifest
parsing, navigation cache) keeps working.
