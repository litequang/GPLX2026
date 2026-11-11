"""Unpack only data assets and native Dart library; APKs stay outside Git.
Usage: py -3 scripts/unpack-apk.py <apk-directory> <output-directory>
"""
from pathlib import Path
import sys
import zipfile
import json
import hashlib

apk_dir = Path(sys.argv[1]).resolve()
output = Path(sys.argv[2]).resolve()
output.mkdir(parents=True, exist_ok=True)
inventory = []
for apk in sorted(apk_dir.glob('*.apk')):
    with zipfile.ZipFile(apk) as archive:
        for entry in archive.infolist():
            if entry.is_dir():
                continue
            if not (entry.filename.startswith('assets/flutter_assets/assets/') or entry.filename.endswith('/libapp.so')):
                continue
            target = (output / entry.filename).resolve()
            if not target.is_relative_to(output):
                raise RuntimeError('Unsafe ZIP member')
            target.parent.mkdir(parents=True, exist_ok=True)
            content = archive.read(entry)
            target.write_bytes(content)
            inventory.append({'path': entry.filename, 'size': len(content), 'sha256': hashlib.sha256(content).hexdigest(), 'apk': apk.name})
(output / 'inventory.json').write_text(json.dumps(inventory, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'files': len(inventory), 'output': str(output)}))
