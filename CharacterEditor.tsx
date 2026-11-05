import { useEffect, useRef, useState, type FormEvent } from 'react';
import { builds, characterSchema, faces, genders, hairstyles, heads, outfitNames, skinNames, type Character } from './character';
import { avatarCanvas } from './avatar';

const choices = [
  ['gender', 'Giới tính', genders], ['head', 'Kiểu đầu', heads], ['face', 'Nét mặt', faces],
  ['build', 'Dáng người', builds], ['hair', 'Kiểu tóc', hairstyles], ['skin', 'Màu da', skinNames],
  ['outfit', 'Màu áo', outfitNames]
] as const;

type StyleKey = 'head' | 'face' | 'build' | 'hair';
const styles: Record<number, Record<StyleKey, number[]>> = {
  1: { head: [2, 0, 1], face: [1, 0, 3, 5], build: [4, 2, 0, 3], hair: [0, 1, 4, 5] },
  2: { head: [1, 3, 0], face: [2, 0, 4, 5], build: [1, 0, 2, 3], hair: [3, 2, 4, 1] },
  3: { head: [3, 1, 2], face: [3, 2, 1, 5], build: [0, 1, 4, 2], hair: [4, 1, 2, 0, 3] }
};

function applyGender(character: Character, gender: number, usePreset = false): Character {
  const next = { ...character, gender };
  const style = styles[gender];
  if (!style) return next;
  for (const key of ['head', 'face', 'build', 'hair'] as const) {
    if (usePreset || !style[key].includes(next[key])) next[key] = style[key][0];
  }
  return next;
}

export function CharacterEditor({ initial, save, cancel }: {
  initial: Character;
  save: (character: Character) => Promise<void>;
  cancel: () => void;
}) {
  const [draft, setDraft] = useState(() => applyGender(initial, initial.gender));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const preview = useRef<HTMLDivElement>(null);
  useEffect(() => { preview.current?.replaceChildren(avatarCanvas(draft, 144)); }, [draft]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = characterSchema.safeParse(draft);
    if (!parsed.success) {
      setError('Tên cần từ 2 đến 24 ký tự. Bạn có thể dùng chữ, số, dấu cách, gạch ngang và gạch dưới.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await save(parsed.data);
    } catch {
      setError('Chưa lưu được nhân vật. Hãy thử lại.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="character-card">
    <span className="eyebrow">✦ GA MÂY</span>
    <h2>Tạo nhân vật</h2>
    <div className="character-preview" ref={preview} aria-hidden="true" />
    <form onSubmit={submit}>
      <label>Tên nhân vật<input required minLength={2} maxLength={24} value={draft.name}
        onChange={event => setDraft({ ...draft, name: event.target.value })}/></label>
      <div className="character-choices">
        {choices.map(([key, label, options]) => {
          const style = styles[draft.gender];
          const ids = style && key in style ? style[key as StyleKey] : options.map((_, index) => index);
          return <label key={key}>{label}
            <select value={draft[key]} onChange={event => {
              const value = Number(event.target.value);
              setDraft(current => key === 'gender'
                ? applyGender(current, value, true)
                : { ...current, [key]: value });
            }}>
              {ids.map(index => <option key={index} value={index}>{options[index]}</option>)}
            </select>
          </label>;
        })}
      </div>
      {error && <p role="alert">{error}</p>}
      <button disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu và vào quảng trường'}</button>
      <button type="button" className="link" disabled={busy} onClick={cancel}>Quay lại</button>
    </form>
  </section>;
}
