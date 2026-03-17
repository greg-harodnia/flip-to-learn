<script lang="ts">
  import type { Card } from './store';
  
  interface Props {
    card: Card;
    flipped?: boolean;
    onflip?: (flipped: boolean) => void;
  }
  
  let { card, flipped = false, onflip }: Props = $props();
  
  let isFlipped = $state(flipped);
  let showCopied = $state(false);
  let showModal = $state(false);
  
  $effect(() => {
    isFlipped = flipped;
  });
  
  function toggleFlip() {
    isFlipped = !isFlipped;
    onflip?.(isFlipped);
  }

  function copyContent(e: Event) {
    e.stopPropagation();
    const content = isFlipped ? card.back : card.front;
    navigator.clipboard.writeText(content);
    showCopied = true;
    setTimeout(() => showCopied = false, 1500);
  }

  function openModal(e: Event) {
    e.stopPropagation();
    showModal = true;
  }

  function closeModal(e: Event) {
    e.stopPropagation();
    showModal = false;
  }
</script>

<div class="flip-card" onclick={toggleFlip} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && toggleFlip()}>
  <div class="flip-card-inner" class:flipped={isFlipped}>
    <div class="flip-card-front">
      <span>{card.front}</span>
    </div>
    <div class="flip-card-back">
      <span>{card.back}</span>
      {#if isFlipped}
        <div class="card-actions">
          <button class="action-btn" onclick={copyContent} title="Copy">
            {#if showCopied}✓{:else}🗐{/if}
          </button>
          <button class="action-btn" onclick={openModal} title="Expand">⤢</button>
        </div>
      {/if}
    </div>
  </div>
</div>

{#if showModal}
  <div class="modal-overlay" onclick={closeModal} role="button" tabindex="0" onkeydown={(e) => e.key === 'Escape' && (showModal = false)}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <div class="modal-text">{card.back}</div>
      <button class="modal-close" onclick={() => showModal = false}>Close</button>
    </div>
  </div>
{/if}

<style>
  .flip-card {
    width: 100%;
    height: 200px;
    perspective: 1000px;
    cursor: pointer;
  }
  
  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.6s;
    transform-style: preserve-3d;
  }
  
  .flip-card-inner.flipped {
    transform: rotateY(180deg);
  }
  
  .flip-card-front,
  .flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    border-radius: 12px;
    font-size: 1.25rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .flip-card-front :global(span),
  .flip-card-back :global(span) {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: 100%;
  }
  
  .flip-card-front {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  .flip-card-back {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    transform: rotateY(180deg);
  }

  .card-actions {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    display: flex;
    gap: 0.25rem;
  }

  .action-btn {
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 32px;
    height: 32px;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    padding: 0;
    line-height: 1;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 1);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 80%;
    max-height: 80%;
    overflow-y: auto;
    color: #333;
  }

  .modal-text {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    white-space: pre-wrap;
  }

  .modal-close {
    padding: 0.5rem 1rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  @media (min-width: 1200px) {
    .flip-card {
      height: 220px;
    }

    .flip-card-front,
    .flip-card-back {
      font-size: 1.5rem;
      padding: 1.5rem;
    }
  }
</style>
