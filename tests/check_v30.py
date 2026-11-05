from pathlib import Path
import re, subprocess
p=Path(__file__).resolve().parents[1]/'public'/'nhiem-vu.html'
s=p.read_text()
for marker in ('missionNarratives.set(id','missionBriefing(mission.index','GIỚI THIỆU','BỐI CẢNH','ĐIỀU KIỆN HOÀN THÀNH','officerByAction','domainLore'):
    assert marker in s, marker
scripts=re.findall(r'<script[^>]*>(.*?)</script>',s,re.S)
assert scripts
subprocess.run(['node','--check','-'],input='\n'.join(scripts),text=True,check=True)
print('PASS: V3.0 structured briefing and JavaScript syntax')
