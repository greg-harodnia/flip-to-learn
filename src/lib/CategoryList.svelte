<script lang="ts">
  import { cards, categories, removeCard, moveCard, searchCards, addCard, updateCard, type Card, type Category } from './store';
  import FlipCard from './FlipCard.svelte';
  
  interface Props {
    category: Category;
    onback: () => void;
    ontest: () => void;
  }
  
  let { category, onback, ontest }: Props = $props();
  
  let searchQuery = $state('');
  let selectedCards = $state<Set<string>>(new Set());
  let showCreateForm = $state(false);
  let newFront = $state('');
  let newBack = $state('');
  let flippedCardId = $state<string | null>(null);
  let editingCard = $state<Card | null>(null);
  let movingCard = $state<Card | null>(null);
  let editFront = $state('');
  let editBack = $state('');
  let mobileMenuOpen = $state<string | null>(null);
  
  let filteredCards = $derived(
    (searchQuery ? searchCards(searchQuery, category.id) 
      : $cards.filter(c => c.categoryId === category.id)).reverse()
  );
  
  function clearSearch() {
    searchQuery = '';
  }
  
  function toggleSelect(cardId: string) {
    const newSet = new Set(selectedCards);
    if (newSet.has(cardId)) {
      newSet.delete(cardId);
    } else {
      newSet.add(cardId);
    }
    selectedCards = newSet;
  }
  
  function deleteSelected() {
    selectedCards.forEach(id => removeCard(id));
    selectedCards = new Set();
  }
  
  function createCard() {
    if (newFront.trim() && newBack.trim()) {
      addCard(newFront.trim(), newBack.trim(), category.id);
      newFront = '';
      newBack = '';
      showCreateForm = false;
    }
  }
  
  function moveSelected(targetCategoryId: string) {
    selectedCards.forEach(id => moveCard(id, targetCategoryId));
    selectedCards = new Set();
  }
  
  function getOtherCategories() {
    return $categories.filter(c => c.id !== category.id);
  }
  
  function toggleFlip(cardId: string) {
    if (!movingCard) {
      if (mobileMenuOpen === cardId) {
        mobileMenuOpen = null;
      }
      flippedCardId = flippedCardId === cardId ? null : cardId;
    }
  }

  function toggleMobileMenu(cardId: string) {
    mobileMenuOpen = mobileMenuOpen === cardId ? null : cardId;
  }
  
  function startEdit(card: Card) {
    movingCard = null;
    editingCard = card;
    editFront = card.front;
    editBack = card.back;
  }
  
  function startMove(card: Card) {
    editingCard = null;
    if (movingCard?.id === card.id) {
      movingCard = null;
    } else {
      movingCard = card;
      flippedCardId = null;
    }
  }
  
  function cancelEdit() {
    editingCard = null;
    editFront = '';
    editBack = '';
  }
  
  function handleMoveTo(targetCategoryId: string) {
    if (movingCard) {
      moveCard(movingCard.id, targetCategoryId);
      movingCard = null;
    }
  }
  
  function saveEdit() {
    if (editingCard && editFront.trim() && editBack.trim()) {
      updateCard(editingCard.id, editFront.trim(), editBack.trim());
      cancelEdit();
    }
  }
  
  function deleteCard(cardId: string) {
    if (confirm('Delete this card?')) {
      removeCard(cardId);
      if (flippedCardId === cardId) {
        flippedCardId = null;
      }
    }
  }
</script>

<div class="category-view">
  <header class="header">
    <button class="btn-back" onclick={onback}>← Back</button>
    <h2>{category.name}</h2>
    <button class="btn-test" onclick={ontest}>Test</button>
  </header>
  
  <div class="toolbar">
    <div class="search-wrapper">
      <input 
        type="text" 
        placeholder="Search cards..." 
        bind:value={searchQuery}
        class="search-input"
      />
      {#if searchQuery}
        <button class="btn-clear" onclick={clearSearch}>✕</button>
      {/if}
    </div>
    <button class="btn-add" onclick={() => showCreateForm = !showCreateForm}>
      {showCreateForm ? '✕' : '+'}
    </button>
  </div>
  
  {#if showCreateForm}
    <div class="create-form">
      <input 
        type="text" 
        placeholder="Front (question/term)" 
        bind:value={newFront}
      />
      <input 
        type="text" 
        placeholder="Back (answer/definition)" 
        bind:value={newBack}
      />
      <button class="btn-save" onclick={createCard}>Add Card</button>
    </div>
  {/if}
  
  <div class="cards-grid">
    {#each filteredCards as card (card.id)}
      <div 
        class="card-wrapper" 
        class:selected={selectedCards.has(card.id)}
        class:mobile-open={mobileMenuOpen === card.id}
      >
        <button 
          class="mobile-menu-btn" 
          onclick={(e) => { e.stopPropagation(); toggleMobileMenu(card.id); }}
        >
          ⋮
        </button>
        {#if editingCard?.id === card.id}
          <div class="edit-form">
            <input 
              type="text" 
              placeholder="Front" 
              bind:value={editFront}
            />
            <input 
              type="text" 
              placeholder="Back" 
              bind:value={editBack}
            />
            <div class="edit-controls">
              <button class="btn-cancel" onclick={cancelEdit}>Cancel</button>
              <button class="btn-save" onclick={saveEdit}>Save</button>
            </div>
          </div>
        {:else if movingCard?.id === card.id}
          <div class="move-form">
            <span class="move-label">Move to:</span>
            <div class="move-buttons">
              {#each getOtherCategories() as cat}
                <button class="move-btn" onclick={() => handleMoveTo(cat.id)}>{cat.name}</button>
              {/each}
            </div>
            <button class="move-cancel" onclick={() => movingCard = null}>Cancel</button>
          </div>
        {:else}
          <div 
            class="flip-card-container"
            onclick={(e) => { e.stopPropagation(); toggleFlip(card.id); }}
            onkeydown={(e) => e.key === 'Enter' && toggleFlip(card.id)}
            role="button"
            tabindex="0"
          >
            <FlipCard {card} flipped={flippedCardId === card.id} />
          </div>
          <div class="card-controls">
            <button class="btn-edit" onclick={(e) => { e.stopPropagation(); startEdit(card); }}>Edit</button>
            <button class="btn-move" onclick={(e) => { e.stopPropagation(); startMove(card); }}>Move</button>
            <button class="btn-delete" onclick={(e) => { e.stopPropagation(); deleteCard(card.id); }}>Delete</button>
          </div>
        {/if}
      </div>
    {/each}
  </div>
  
  {#if filteredCards.length === 0}
    <p class="empty">No cards yet. Click + to add one.</p>
  {/if}
</div>

<style>
  .category-view {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
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
  
  .toolbar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .search-input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
  }
  
  .search-wrapper {
    position: relative;
    flex: 1;
  }
  
  .search-wrapper .search-input {
    width: 100%;
    padding-right: 2.5rem;
  }
  
  .btn-clear {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    border: none;
    background: #ddd;
    border-radius: 50%;
    cursor: pointer;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .btn-add, .btn-back, .btn-test {
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
  }
  
  .btn-add {
    background: #667eea;
    color: white;
    font-size: 1.25rem;
    width: 48px;
  }
  
  .btn-back {
    background: #f0f0f0;
  }
  
  .btn-test {
    background: #10b981;
    color: white;
  }
  
  .create-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  
  .create-form input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
  }
  
  .btn-save {
    padding: 0.75rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
  
  .cards-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
    overflow-y: auto;
    padding-bottom: 1rem;
    align-content: start;
  }

  @media (min-width: 600px) {
    .cards-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 900px) {
    .cards-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (min-width: 1200px) {
    .cards-grid {
      grid-template-columns: repeat(4, 1fr);
    }

    .header h2 {
      font-size: 1.75rem;
    }

    .toolbar {
      margin-bottom: 1.5rem;
    }

    .search-input {
      padding: 1rem;
      font-size: 1.125rem;
    }

    .btn-add {
      width: 56px;
      height: 56px;
      font-size: 1.5rem;
    }
  }

  .card-wrapper {
    cursor: pointer;
    position: relative;
  }

  .flip-card-container {
    width: 100%;
  }

  .card-controls {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    right: 0.5rem;
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .card-wrapper.selected .card-controls,
  .card-wrapper.mobile-open .card-controls {
    opacity: 1;
  }

  @media (hover: hover) and (pointer: fine) {
    .card-wrapper:hover .card-controls {
      opacity: 1;
    }
  }

  .card-controls button {
    padding: 0.375rem 0.75rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    background: rgba(0, 0, 0, 0.6);
    color: white;
  }

  .btn-edit:hover {
    background: #f59e0b;
  }

  .btn-move:hover {
    background: #667eea;
  }

  .btn-delete:hover {
    background: #ef4444;
  }

  .mobile-menu-btn {
    display: none;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.25rem;
    line-height: 1;
    z-index: 20;
    padding: 0;
  }

  @media (max-width: 899px) {
    .mobile-menu-btn {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  @media (min-width: 900px) {
    .mobile-menu-btn {
      display: none;
    }
  }

  @media (min-width: 1200px) {
    .move-form,
    .edit-form {
      min-height: 220px;
      padding: 1.25rem;
    }

    .move-label,
    .edit-form input {
      font-size: 1.125rem;
    }

    .move-btn,
    .move-cancel {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    }

    .edit-controls button {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .card-controls button {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
  }

  .move-form {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    height: 100%;
    min-height: 200px;
  }

  .move-label {
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
  }

  .move-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }

  .move-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #667eea;
    background: white;
    color: #667eea;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .move-btn:hover {
    background: #667eea;
    color: white;
  }

  .move-cancel {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    background: white;
    color: grey;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .move-cancel:hover {
    background: #f0f0f0;
  }

  .edit-form {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    height: 100%;
    min-height: 200px;
  }

  .edit-form input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .edit-controls {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }

  .edit-controls button {
    padding: 0.375rem 0.75rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
  }

  .btn-cancel {
    background: #e5e5e5;
  }

  .btn-save {
    background: #10b981;
    color: white;
  }
   
  .card-wrapper.selected {
    outline: 3px solid #667eea;
    border-radius: 12px;
  }
  
  .empty {
    text-align: center;
    color: grey;
    margin-top: 2rem;
  }
</style>
