"""Self-hosted fonts for the two ad landing pages and their source pages
(/services/industries/ecommerce, /services/shopify-support-automation and their /lp/ copies).

assets/fonts/ holds the latin subset files Google Fonts serves for the stylesheet those
pages used to load, byte for byte:
  Fraunces:opsz,wght,SOFT@9..144,300..900,0..100 / Instrument Sans:wght@400..700 / JetBrains Mono:wght@400;500
One file per family, latin only: the pages use nothing outside Google's latin range (the
arrows and ticks render in a system font, as before), so the latin-ext, cyrillic, greek and
vietnamese files are not hosted. The @font-face rules in the four pages repeat Google's
descriptors and unicode-range, so every character renders exactly as it did.

Fetch them again (for example after a Google Fonts version bump):
  python scripts/subset-fonts.py fetch assets/fonts

Optional, not used: --cut-axes trims each variation axis to what the pages use
(measured on all four pages at 390 and 1280 wide):
  Fraunces        wght 400..500, opsz 16..144, SOFT 0..40   121 KB -> 88 KB
  JetBrains Mono  wght 400..500                              31 KB -> 29 KB
It is smaller, but instancing re-bases the outlines (Fraunces' default weight is 900) and
the rounding shifts anti-aliasing on most glyphs, so the pages are no longer pixel
identical to the Google fonts. If it is ever switched on, change the Fraunces descriptor
to font-weight:400 500 in the four pages.
  pip install fonttools brotli
  python scripts/subset-fonts.py fetch <dir> --cut-axes
"""
import os
import sys
import urllib.request

FILES = {
    'fraunces-latin.woff2': 'https://fonts.gstatic.com/s/fraunces/v38/6NUI8FyLNQOQZAnv9bYEvCeYdG9Ea92uemAO8Uik.woff2',
    'instrument-sans-latin.woff2': 'https://fonts.gstatic.com/s/instrumentsans/v4/pxiTypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr0SZe1Q.woff2',
    'jetbrains-mono-latin.woff2': 'https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwg.woff2',
}
CUT = {
    'fraunces-latin.woff2': {'wght': (400, 500), 'opsz': (16, 144), 'SOFT': (0, 40)},
    'jetbrains-mono-latin.woff2': {'wght': (400, 500)},
}

if len(sys.argv) < 3 or sys.argv[1] != 'fetch':
    sys.exit(__doc__)
out = sys.argv[2]
for name, url in FILES.items():
    path = os.path.join(out, name)
    urllib.request.urlretrieve(url, path)
    if '--cut-axes' in sys.argv and name in CUT:
        from fontTools.ttLib import TTFont
        from fontTools.varLib import instancer
        f = instancer.instantiateVariableFont(TTFont(path), CUT[name], updateFontNames=False)
        f.flavor = 'woff2'
        f.save(path)
    print(name, os.path.getsize(path), 'bytes')
