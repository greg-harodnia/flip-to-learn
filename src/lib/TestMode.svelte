<script lang="ts">
  import { cards, categories, type Card, type Category } from './store';
  import FlipCard from './FlipCard.svelte';
  import CardMoveSelect from './CardMoveSelect.svelte';
  
  interface Props {
    category: Category;
    onback: () => void;
  }
  
  let { category, onback }: Props = $props();
  
  let categoryCards = $derived($cards.filter(c => c.categoryId === category.id));
  let shuffledCards = $state<Card[]>([]);
  let currentIndex = $state(0);
  let initialized = $state(false);
  let lastCategoryId = $state(category.id);
  
  $effect(() => {
    if (category.id !== lastCategoryId) {
      lastCategoryId = category.id;
      initialized = false;
      currentIndex = 0;
    }
  });
  
  $effect(() => {
    if (!initialized) {
      const arr = [...categoryCards];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      shuffledCards = arr;
      initialized = true;
    }
  });
  
  let currentCard = $derived(shuffledCards[currentIndex]);
  let otherCategories = $derived($categories.filter(c => c.id !== category.id));
  
  function nextCard() {
    if (currentIndex < shuffledCards.length - 1) {
      currentIndex++;
    }
  }
  
  function prevCard() {
    if (currentIndex > 0) {
      currentIndex--;
    }
  }
  
  function handleMoved() {
    const movedCardId = currentCard?.id;
    if (movedCardId) {
      shuffledCards = shuffledCards.filter(c => c.id !== movedCardId);
      if (currentIndex >= shuffledCards.length) {
        currentIndex = Math.max(0, shuffledCards.length - 1);
      }
    }
  }
</script>

<div class="test-view">
  <header class="header">
    <button class="btn-back" onclick={onback}>← Exit Test</button>
    <h2>Test: {category.name}</h2>
    <span class="counter">{currentIndex + 1} / {shuffledCards.length}</span>
  </header>
  
  {#if shuffledCards.length === 0}
    <p class="empty">No cards in this category to test.</p>
  {:else if currentCard}
    <div class="test-card">
      {#key currentIndex}
        <FlipCard card={currentCard} flipped={false} />
      {/key}
    </div>
    
    <div class="navigation">
      <button onclick={prevCard} disabled={currentIndex === 0}>← Prev</button>
      <button onclick={nextCard} disabled={currentIndex === shuffledCards.length - 1}>Next →</button>
    </div>

    {#if currentCard && otherCategories.length > 0}
      <div class="move-controls">
        <CardMoveSelect card={currentCard} onmoved={handleMoved} />
      </div>
    {/if}
  {/if}
</div>

<style>
  .test-view {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .header h2 {
    margin: 0;
    font-size: 1.25rem;
  }
  
  .counter {
    font-size: 0.875rem;
    color: grey;
  }
  
  .btn-back {
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 8px;
    background: #f0f0f0;
    cursor: pointer;
  }
  
  .test-card {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  
  .navigation {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 1rem 0;
  }
  
  .navigation button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    background: #667eea;
    color: white;
    cursor: pointer;
  }
  
  .navigation button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .empty {
    text-align: center;
    color: grey;
    margin-top: 2rem;
  }

  .move-controls {
    display: flex;
    justify-content: center;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 8px;
    margin-top: 1rem;
  }
</style>
