<script lang="ts">
  import { categories, moveCard, type Card, type Category } from './store';

  interface Props {
    card: Card;
    fromCategoryId: string;
    onmoved?: () => void;
  }

  let { card, fromCategoryId, onmoved }: Props = $props();

  let selectedCategoryId = $state('');
  let otherCategories = $derived($categories.filter(c => c.id !== fromCategoryId));

  function handleMove() {
    if (selectedCategoryId) {
      moveCard(card.id, fromCategoryId, selectedCategoryId);
      selectedCategoryId = '';
      onmoved?.();
    }
  }
</script>

<div class="move-select">
  <select bind:value={selectedCategoryId}>
    <option value="">Move to...</option>
    {#each otherCategories as cat}
      <option value={cat.id}>{cat.name}</option>
    {/each}
  </select>
  <button onclick={handleMove} disabled={!selectedCategoryId}>Move</button>
</div>

<style>
  .move-select {
    display: flex;
    gap: 0.5rem;
  }

  .move-select select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.875rem;
    flex: 1;
  }

  .move-select button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: #667eea;
    color: white;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .move-select button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
</style>
