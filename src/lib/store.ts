import { writable, get } from 'svelte/store';

export interface Card {
  id: string;
  front: string;
  back: string;
}

export interface Category {
  id: string;
  name: string;
  cards: Card[];
}

function createId(): string {
  return Math.random().toString(36).substring(2, 11);
}

const STORAGE_KEY = 'fliptolearn_data';
const OLD_STORAGE_KEY_CARDS = 'flipacard_cards';
const OLD_STORAGE_KEY_CATEGORIES = 'flipacard_categories';

function migrateFromOldFormat(): Category[] {
  if (typeof window === 'undefined') return defaultCategories;
  
  const oldCards = localStorage.getItem(OLD_STORAGE_KEY_CARDS);
  const oldCategories = localStorage.getItem(OLD_STORAGE_KEY_CATEGORIES);
  
  if (!oldCards && !oldCategories) {
    return defaultCategories;
  }
  
  try {
    interface OldCard {
      id: string;
      front: string;
      back: string;
      categoryId: string;
    }
    const cards: OldCard[] = oldCards ? JSON.parse(oldCards) : [];
    const categories: Category[] = oldCategories ? JSON.parse(oldCategories) : [];
    
    const migrated = categories.map(cat => ({
      ...cat,
      cards: cards.filter(c => c.categoryId === cat.id)
    }));
    
    localStorage.removeItem(OLD_STORAGE_KEY_CARDS);
    localStorage.removeItem(OLD_STORAGE_KEY_CATEGORIES);
    
    return migrated.length > 0 ? migrated : defaultCategories;
  } catch {
    return defaultCategories;
  }
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function initializeCategories(): Category[] {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      return migrateFromOldFormat();
    }
  }
  return migrateFromOldFormat();
}

const defaultCategories: Category[] = [
  { id: 'learning', name: 'Learning', cards: [] },
  { id: 'known', name: 'Known', cards: [] }
];

export const categories = writable<Category[]>(initializeCategories());

categories.subscribe(value => saveToStorage(STORAGE_KEY, value));

export function addCard(front: string, back: string, categoryId: string): void {
  const newCard: Card = {
    id: createId(),
    front,
    back
  };
  categories.update(cats => 
    cats.map(cat => 
      cat.id === categoryId 
        ? { ...cat, cards: [...cat.cards, newCard] }
        : cat
    )
  );
}

export function removeCard(categoryId: string, cardId: string): void {
  categories.update(cats =>
    cats.map(cat =>
      cat.id === categoryId
        ? { ...cat, cards: cat.cards.filter(c => c.id !== cardId) }
        : cat
    )
  );
}

export function updateCard(categoryId: string, cardId: string, front: string, back: string): void {
  categories.update(cats =>
    cats.map(cat =>
      cat.id === categoryId
        ? { ...cat, cards: cat.cards.map(c => c.id === cardId ? { ...c, front, back } : c) }
        : cat
    )
  );
}

export function moveCard(cardId: string, fromCategoryId: string, toCategoryId: string): void {
  categories.update(cats => {
    let movedCard: Card | undefined;
    
    const updated = cats.map(cat => {
      if (cat.id === fromCategoryId) {
        const card = cat.cards.find(c => c.id === cardId);
        if (card) movedCard = card;
        return { ...cat, cards: cat.cards.filter(c => c.id !== cardId) };
      }
      return cat;
    });
    
    if (movedCard) {
      return updated.map(cat =>
        cat.id === toCategoryId
          ? { ...cat, cards: [...cat.cards, movedCard!] }
          : cat
      );
    }
    
    return updated;
  });
}

export function addCategory(name: string): void {
  const newCategory: Category = {
    id: createId(),
    name,
    cards: []
  };
  categories.update(c => [...c, newCategory]);
}

export function removeCategory(id: string): void {
  categories.update(c => c.filter(cat => cat.id !== id));
}

export function getCategoryById(id: string): Category | undefined {
  return get(categories).find(cat => cat.id === id);
}

export function searchCards(query: string, categoryId: string): Card[] {
  const cat = getCategoryById(categoryId);
  if (!cat) return [];
  const q = query.toLowerCase();
  return cat.cards.filter(card => card.front.toLowerCase().includes(q));
}

export interface BackupData {
  version: number;
  exportedAt: string;
  categories: Category[];
}

export function exportData(): BackupData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories: get(categories)
  };
}

export function importData(data: BackupData): boolean {
  if (!data || data.version !== 1 || !Array.isArray(data.categories)) {
    return false;
  }
  categories.set(data.categories);
  return true;
}
