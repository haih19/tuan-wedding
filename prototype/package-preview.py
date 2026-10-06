"""Build the self-contained HTML design-review artifact."""
from pathlib import Path
import base64
import json
import mimetypes

root = Path(__file__).parent
html = (root / 'index.html').read_text()
original = 'images:[1,2,3,4,5,6,7,8,9].map(n=>({src:`assets/anh${n}.webp`,alt:`Khoảnh khắc ảnh cưới ${n}`}))'
images = [{'src': f'assets/anh{n}.webp', 'alt': f'Khoảnh khắc ảnh cưới {n}'} for n in range(1, 10)]
html = html.replace(original, 'images:' + json.dumps(images, ensure_ascii=False))
for asset in (root / 'assets').iterdir():
    if asset.is_file():
        mime = mimetypes.guess_type(asset.name)[0] or 'application/octet-stream'
        data = base64.b64encode(asset.read_bytes()).decode()
        html = html.replace('assets/' + asset.name, f'data:{mime};base64,{data}')
(root / 'elegant-preview.html').write_text(html)
print('Built self-contained HTML preview.')
