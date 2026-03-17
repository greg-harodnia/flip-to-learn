import { writable, derived, get } from 'svelte/store';

export interface Card {
  id: string;
  front: string;
  back: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
}

function createId(): string {
  return Math.random().toString(36).substring(2, 11);
}

const STORAGE_KEY_CARDS = 'flipacard_cards';
const STORAGE_KEY_CATEGORIES = 'flipacard_categories';

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

const defaultCategories: Category[] = [
  { id: 'learning', name: 'Learning' },
  { id: 'known', name: 'Known' }
];

const defaultCards: Card[] = [];

export const cards = writable<Card[]>(loadFromStorage(STORAGE_KEY_CARDS, defaultCards));
export const categories = writable<Category[]>(loadFromStorage(STORAGE_KEY_CATEGORIES, defaultCategories));

cards.subscribe(value => saveToStorage(STORAGE_KEY_CARDS, value));
categories.subscribe(value => saveToStorage(STORAGE_KEY_CATEGORIES, value));

export function addCard(front: string, back: string, categoryId: string): void {
  const newCard: Card = {
    id: createId(),
    front,
    back,
    categoryId
  };
  cards.update(c => [...c, newCard]);
}

export function removeCard(id: string): void {
  cards.update(c => c.filter(card => card.id !== id));
}

export function updateCard(id: string, front: string, back: string): void {
  cards.update(c => c.map(card => 
    card.id === id ? { ...card, front, back } : card
  ));
}

export function moveCard(cardId: string, targetCategoryId: string): void {
  cards.update(c => c.map(card => 
    card.id === cardId ? { ...card, categoryId: targetCategoryId } : card
  ));
}

export function addCategory(name: string): void {
  const newCategory: Category = {
    id: createId(),
    name
  };
  categories.update(c => [...c, newCategory]);
}

export function removeCategory(id: string): void {
  categories.update(c => c.filter(cat => cat.id !== id));
  cards.update(c => c.filter(card => card.categoryId !== id));
}

export function getCardsByCategory(categoryId: string): Card[] {
  const allCards = get(cards);
  return allCards.filter(card => card.categoryId === categoryId);
}

export function searchCards(query: string, categoryId: string): Card[] {
  const allCards = get(cards);
  const q = query.toLowerCase();
  return allCards.filter(card => 
    card.categoryId === categoryId && 
    card.front.toLowerCase().includes(q)
  );
}
