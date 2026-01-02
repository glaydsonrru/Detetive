
export enum MarkType {
  EMPTY = 'EMPTY',
  NO = 'NO',
  YES = 'YES',
  MAYBE = 'MAYBE',
  STRONG = 'STRONG',
  REVEALED = 'REVEALED'
}

export interface Player {
  id: string;
  name: string;
  color: string;
  isUser: boolean;
}

export interface ClueItem {
  id: string;
  name: string;
  category: 'Suspect' | 'Weapon' | 'Location';
}

export type GridState = Record<string, Record<string, MarkType>>;

export interface DeductionResult {
  suspects: string[];
  weapons: string[];
  locations: string[];
}

export enum Screen {
  HOME = 'HOME',
  SETUP = 'SETUP',
  GAME = 'GAME'
}
