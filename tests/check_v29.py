from pathlib import Path
import re
p=Path(__file__).resolve().parents[1]/'public'/'nhiem-vu.html'
s=p.read_text(encoding='utf-8')
checks={
  '3 chỉ tiêu': all(f'<option value="{n}">' in s for n in (5,10,20)),
  'mục tiêu mặc định 10': ' : 10; }' in s,
  'bảo lưu 24h': 'CARRYOVER_MS = 24 * 60 * 60 * 1000' in s,
  'không phạt khi hết hạn': "phase:'expired'" in s and 'run.next++;' in s,
  'không phạt khi chưa nhận': 'Nhiệm vụ chưa nhận không bị phạt.' in s,
  'không đổi khóa lưu': "const key = 'system-missions-v1'" in s,
  'giữ nút báo cáo': 'id="submit-mission"' in s,
  'đủ 10.000 nhiệm vụ': 'size!==10000' in s,
}
for k,v in checks.items(): print(('PASS' if v else 'FAIL')+' '+k)
assert all(checks.values())
