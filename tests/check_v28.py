"""Kiểm tra tĩnh và cú pháp V2.8. Chạy: python3 tests/check_v28.py"""
from pathlib import Path
import re, subprocess, tempfile
p=Path(__file__).resolve().parents[1]/'public/nhiem-vu.html'
s=p.read_text(encoding='utf-8')
assert 'missionMetadata=missions.map' in s
assert "id:'TM-'" in s
assert 'SAVE_SCHEMA_VERSION=3' in s
assert 'm.legacyUnclassified=' in s
assert 'showAwardNotice(newAwards)' in s
assert 'm.rewardHistory.push' in s
assert 'recordEvent(\'complete\'' in s
assert 'recordEvent(\'skip\'' in s
assert 'secret-balanced' in s
assert 'missionKinds.filter' in s and '7500' in s and '2500' in s
assert 'HELP_COOLDOWN_MS = 30000' in s
assert 'banRemaining()' in s
scripts=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S)
assert scripts
with tempfile.TemporaryDirectory() as d:
    js=Path(d)/'check.js';js.write_text('\n'.join(scripts))
    subprocess.run(['node','--check',str(js)],check=True)
print('PASS: syntax, migration, metadata, achievements, officer events, existing safeguards')
