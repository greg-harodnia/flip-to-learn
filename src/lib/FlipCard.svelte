<script lang="ts">
  import type { Card } from './store';
  
  interface Props {
    card: Card;
    flipped?: boolean;
    onflip?: (flipped: boolean) => void;
  }
  
  let { card, flipped = false, onflip }: Props = $props();
  
  let isFlipped = $state(flipped);
  
  $effect(() => {
    isFlipped = flipped;
  });
  
  function toggleFlip() {
    isFlipped = !isFlipped;
    onflip?.(isFlipped);
  }
</script>

<div class="flip-card" onclick={toggleFlip} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && toggleFlip()}>
  <div class="flip-card-inner" class:flipped={isFlipped}>
    <div class="flip-card-front">
      {card.front}
    </div>
    <div class="flip-card-back">
      {card.back}
    </div>
  </div>
</div>

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
