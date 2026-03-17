<script lang="ts">
  import type { Card, Category } from './store';
  import { removeCard, moveCard, updateCard } from './store';
  import FlipCard from './FlipCard.svelte';
  
  interface Props {
    card: Card;
    categoryId: string;
    onclose: () => void;
    ondelete?: () => void;
    categories?: Category[];
    startFlipped?: boolean;
  }
  
  let { card, categoryId, onclose, ondelete, categories: allCategories = [], startFlipped = false }: Props = $props();
  
  let showMoveMenu = $state(false);
  let isEditing = $state(false);
  let editFront = $state(card.front);
  let editBack = $state(card.back);
  
  function handleDelete() {
    if (confirm('Delete this card?')) {
      removeCard(categoryId, card.id);
      ondelete?.();
    }
  }
  
  function moveTo(targetCategoryId: string) {
    moveCard(card.id, categoryId, targetCategoryId);
    onclose();
  }
  
  function saveEdit() {
    if (editFront.trim() && editBack.trim()) {
      updateCard(categoryId, card.id, editFront.trim(), editBack.trim());
      isEditing = false;
      onclose();
    }
  }
  
  function cancelEdit() {
    editFront = card.front;
    editBack = card.back;
    isEditing = false;
  }
  
  function getOtherCategories() {
    return allCategories.filter(c => c.id !== categoryId);
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (isEditing) {
        cancelEdit();
      } else {
        onclose();
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="modal-overlay" onclick={onclose} role="presentation">
  <div class="modal-content" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
    <button class="close-btn" onclick={onclose}>✕</button>
    
    {#if isEditing}
      <div class="edit-form">
        <h3>Edit Card</h3>
        <input 
          type="text" 
          placeholder="Front (question/term)" 
          bind:value={editFront}
        />
        <input 
          type="text" 
          placeholder="Back (answer/definition)" 
          bind:value={editBack}
        />
        <div class="edit-controls">
          <button class="btn-cancel" onclick={cancelEdit}>Cancel</button>
          <button class="btn-save" onclick={saveEdit}>Save</button>
        </div>
      </div>
    {:else}
    <div class="card-container">
      <FlipCard {card} flipped={startFlipped} />
    </div>
      
      <div class="controls">
        <button class="btn-edit" onclick={() => isEditing = true}>
          Edit
        </button>
        <button class="btn-move" onclick={() => showMoveMenu = !showMoveMenu}>
          Move to...
        </button>
        <button class="btn-delete" onclick={handleDelete}>
          Delete
        </button>
      </div>
      
      {#if showMoveMenu}
        <div class="move-menu">
          {#each getOtherCategories() as cat}
            <button onclick={() => moveTo(cat.id)}>{cat.name}</button>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    width: 100%;
    max-width: 400px;
    position: relative;
  }
  
  .close-btn {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    width: 32px;
    height: 32px;
    border: none;
    background: #f0f0f0;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .close-btn:hover {
    background: #e0e0e0;
  }
  
  .card-container {
    margin: 1rem 0;
  }
  
  .controls {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .btn-edit, .btn-move, .btn-delete {
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .btn-edit {
    background: #f59e0b;
    color: white;
  }
  
  .btn-move {
    background: #667eea;
    color: white;
  }
  
  .btn-delete {
    background: #ef4444;
    color: white;
  }
  
  .move-menu {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
    justify-content: center;
  }
  
  .move-menu button {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    background: white;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .edit-form h3 {
    margin: 0;
    text-align: center;
  }
  
  .edit-form input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
  }
  
  .edit-controls {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }
  
  .btn-cancel, .btn-save {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .btn-cancel {
    background: #e5e5e5;
  }
  
  .btn-save {
    background: #10b981;
    color: white;
  }
</style>
