import type { Character } from './character';
export const WIDTH = 900;
export const HEIGHT = 500;
export const ROOM = 'plaza';
export type Player = Character & { id: string; x: number; y: number };
export type Speech = { id: string; text: string };
