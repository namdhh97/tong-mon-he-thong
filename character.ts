import { z } from 'zod';

export const outfits = [0xd28b69, 0xe6b250, 0x769cce, 0xa484b2, 0x4e9d88, 0xe082a2, 0x617ac1, 0xe9e5ce];
export const outfitNames = ['Cam đất', 'Vàng mật', 'Xanh biển', 'Tím', 'Xanh lá', 'Hồng', 'Chàm', 'Kem'];
export const hairstyles = ['Ngắn', 'Mái lệch', 'Búi cao', 'Tóc dài', 'Tóc xoăn', 'Đầu trọc'];
export const genders = ['Không hiển thị', 'Nam', 'Nữ', 'Phi nhị nguyên', 'Khác'];
export const heads = ['Tròn', 'Trái xoan', 'Vuông', 'Má bầu'];
export const faces = ['Tươi cười', 'Điềm tĩnh', 'Mắt cười', 'Tinh nghịch', 'Ngạc nhiên', 'Đeo kính'];
export const builds = ['Cân đối', 'Nhỏ nhắn', 'Cao', 'Đậm người', 'Vai rộng'];
export const skinTones = ['#f3c79e', '#ffe1c5', '#d99b72', '#ac6f51', '#794c38'];
export const skinNames = ['Ấm', 'Sáng', 'Mật ong', 'Nâu', 'Nâu đậm'];
const choice = (options: readonly unknown[]) => z.number().int().min(0).max(options.length - 1);

export const characterSchema = z.object({
  name: z.string().trim().min(2).max(24).regex(/^[\p{L}\p{M}\p{N} _-]+$/u),
  outfit: choice(outfits),
  hair: choice(hairstyles),
  gender: choice(genders).default(0),
  head: choice(heads).default(0),
  face: choice(faces).default(0),
  build: choice(builds).default(0),
  skin: choice(skinTones).default(0)
});
export type Character = z.infer<typeof characterSchema>;
export function newCharacter(name: string): Character {
  return { name, outfit: 0, hair: 0, gender: 0, head: 0, face: 0, build: 0, skin: 0 };
}
