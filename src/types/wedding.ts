export enum WeddingTheme {
  Elegant = 'elegant',
  Traditional = 'traditional',
}
export type Side = 'bride' | 'groom';
export interface Person {
  name: string;
  shortName: string;
  parents: string[];
  portrait: string;
}
export interface Event {
  title: string;
  date: string;
  venue: string;
  address: string;
  mapUrl: string;
  embedUrl: string;
}
export interface Photo {
  src: string;
  alt: string;
  width: number;
  height: number;
}
export interface Gift {
  recipient: string;
  bank: string;
  account: string;
  qr: string;
  isMock: boolean;
}
export interface WeddingConfig {
  theme: WeddingTheme;
  monogram: string;
  couple: Record<Side, Person>;
  events: Record<Side, Event>;
  hero: Photo;
  gallery: Photo[];
  story: { date: string; title: string; text: string }[];
  gifts: Record<Side, Gift>;
  music: { src: string; volume: number };
  seo: { description: string; image: string };
  copy: Record<string, string>;
}
