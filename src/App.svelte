<script lang="ts">
  import { categories, addCategory, removeCategory, exportData, importData, type Category, type BackupData } from './lib/store';
  import CategoryList from './lib/CategoryList.svelte';
  import TestMode from './lib/TestMode.svelte';
  
  type View = 'home' | 'category' | 'test';
  
  let currentView = $state<View>('home');
  let selectedCategory = $state<Category | null>(null);
  let showAddCategory = $state(false);
  let newCategoryName = $state('');
  let reversedTest = $state(false);
  
  function openCategory(category: Category) {
    selectedCategory = category;
    currentView = 'category';
  }
  
  function goHome() {
    currentView = 'home';
    selectedCategory = null;
  }
  
  function startTest() {
    if (selectedCategory) {
      reversedTest = false;
      currentView = 'test';
    }
  }
  
  function startReversedTest() {
    if (selectedCategory) {
      reversedTest = true;
      currentView = 'test';
    }
  }
  
  function exitTest() {
    currentView = 'category';
  }
  
  function createCategory() {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      newCategoryName = '';
      showAddCategory = false;
    }
  }
  
  function deleteCategory(id: string) {
    if (confirm('Delete this category and all its cards?')) {
      removeCategory(id);
    }
  }
  
  function getCardCount(categoryId: string): number {
    const cat = $categories.find(c => c.id === categoryId);
    return cat?.cards.length ?? 0;
  }
  
  let showSettings = $state(false);
  let fileInput: HTMLInputElement;
  
  function handleBackup() {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fliptolearn-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  function handleRestore(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as BackupData;
        if (importData(data)) {
          alert('Data restored successfully!');
        } else {
          alert('Invalid backup file.');
        }
      } catch {
        alert('Error reading backup file.');
      }
    };
    reader.readAsText(file);
    input.value = '';
  }
</script>

<main>
  {#if currentView === 'home'}
    <header class="app-header">
      <h1>Flip to Learn</h1>
      <div class="header-actions">
        <button class="btn-settings" onclick={() => showSettings = !showSettings}>
          ⚙️
        </button>
        <button class="btn-add-cat" onclick={() => showAddCategory = !showAddCategory}>
          {showAddCategory ? '✕' : '+ Category'}
        </button>
      </div>
    </header>
    
    {#if showSettings}
      <div class="settings-panel">
        <h3>Backup & Restore</h3>
        <div class="settings-buttons">
          <button class="btn-backup" onclick={handleBackup}>📥 Download Backup</button>
          <button class="btn-restore" onclick={() => fileInput.click()}>📤 Restore Backup</button>
          <input 
            type="file" 
            accept=".json" 
            bind:this={fileInput} 
            onchange={handleRestore} 
            style="display: none;"
          />
        </div>
      </div>
    {/if}
    
    {#if showAddCategory}
      <div class="add-category-form">
        <input 
          type="text" 
          placeholder="Category name" 
          bind:value={newCategoryName}
          onkeydown={(e) => e.key === 'Enter' && createCategory()}
        />
        <button onclick={createCategory}>Add</button>
      </div>
    {/if}
    
    <div class="categories-grid">
      {#each $categories as category (category.id)}
        <div class="category-card" onclick={() => openCategory(category)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && openCategory(category)}>
          <div class="cat-info">
            <h3>{category.name}</h3>
            <span class="card-count">{getCardCount(category.id)} cards</span>
          </div>
          <button 
            class="btn-delete-cat" 
            onclick={(e) => { e.stopPropagation(); deleteCategory(category.id); }}
          >
            ✕
          </button>
        </div>
      {/each}
    </div>
    
    {#if $categories.length === 0}
      <p class="empty">No categories yet. Click "+ Category" to create one.</p>
    {/if}
    
  {:else if currentView === 'category' && selectedCategory}
    <CategoryList 
      category={selectedCategory} 
      onback={goHome}
      ontest={startTest}
      ontestreversed={startReversedTest}
    />
  {:else if currentView === 'test' && selectedCategory}
    <TestMode 
      category={selectedCategory}
      reversed={reversedTest}
      onback={exitTest}
    />
  {/if}
</main>

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: #f5f5f5;
    min-height: 100vh;
  }
  
  main {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  @media (min-width: 800px) {
    main {
      max-width: 1000px;
    }

    .categories-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1200px) {
    main {
      max-width: 1400px;
    }

    .categories-grid {
      grid-template-columns: repeat(4, 1fr);
    }

    .category-card {
      padding: 2rem;
    }

    .app-header h1 {
      font-size: 2rem;
    }

    .btn-add-cat {
      padding: 1rem 1.5rem;
      font-size: 1rem;
    }
  }

  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .app-header h1 {
    font-size: 1.5rem;
    color: #333;
  }
  
  .btn-add-cat {
    padding: 0.75rem 1rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .add-category-form {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .add-category-form input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
  }
  
  .add-category-form button {
    padding: 0.75rem 1.5rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
  
  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }
  
  .category-card {
    background: white;
    padding: 1.25rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .category-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
  
  .cat-info h3 {
    font-size: 1.125rem;
    margin-bottom: 0.25rem;
  }
  
  .card-count {
    font-size: 0.875rem;
    color: #666;
  }
  
  .btn-delete-cat {
    padding: 0.5rem;
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .btn-delete-cat:hover {
    color: #ef4444;
  }
  
  .empty {
    text-align: center;
    color: grey;
    margin-top: 2rem;
  }
  
  .header-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  
  .btn-settings {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
  }
  
  .btn-settings:hover {
    background: #eee;
  }
  
  .settings-panel {
    background: white;
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .settings-panel h3 {
    margin-bottom: 0.75rem;
    font-size: 1rem;
  }
  
  .settings-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .btn-backup, .btn-restore {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .btn-backup:hover, .btn-restore:hover {
    background: #f5f5f5;
  }
</style>
