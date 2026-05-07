<script>
  let fields = $state([
    { id: 'name', label: 'Full Name', value: '', valid: false, touched: false },
    { id: 'email', label: 'Email', value: '', valid: false, touched: false },
    { id: 'phone', label: 'Phone', value: '', valid: false, touched: false },
    { id: 'company', label: 'Company', value: '', valid: false, touched: false },
    { id: 'role', label: 'Role', value: '', valid: false, touched: false },
  ]);

  let allValid = $derived(fields.every(f => f.valid));
  let touchedCount = $derived(fields.filter(f => f.touched).length);
  let validCount = $derived(fields.filter(f => f.valid).length);

  function updateField(id, value) {
    fields = fields.map(f => {
      if (f.id === id) {
        const valid = validate(id, value);
        return { ...f, value, valid, touched: true };
      }
      return f;
    });
  }

  function validate(id, value) {
    switch (id) {
      case 'name': return value.length >= 2;
      case 'email': return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'phone': return /^\d{10,}$/.test(value.replace(/\D/g, ''));
      case 'company': return value.length >= 1;
      case 'role': return value.length >= 2;
      default: return false;
    }
  }

  function fillRandom() {
    const data = {
      name: ['Alice Johnson', 'Bob Smith', 'Carol White', 'David Brown'][Math.floor(Math.random() * 4)],
      email: ['alice@example.com', 'bob@test.org', 'carol@demo.net', 'david@sample.io'][Math.floor(Math.random() * 4)],
      phone: '555' + String(Math.floor(Math.random() * 10000000)).padStart(7, '0'),
      company: ['Acme Corp', 'TechStart', 'Global Inc', 'Local LLC'][Math.floor(Math.random() * 4)],
      role: ['Engineer', 'Manager', 'Director', 'Analyst'][Math.floor(Math.random() * 4)],
    };
    Object.entries(data).forEach(([id, value]) => updateField(id, value));
  }

  function reset() {
    fields = fields.map(f => ({ ...f, value: '', valid: false, touched: false }));
  }
</script>

<div class="form-app">
  <h2>Svelte 5 Form (5 fields)</h2>
  
  <div class="progress">
    <div class="progress-bar" style="width: {(validCount / fields.length) * 100}%"></div>
    <span>{validCount}/{fields.length} valid</span>
  </div>

  <form onsubmit={(e) => e.preventDefault()}>
    {#each fields as field (field.id)}
      <div class="field" class:valid={field.valid} class:invalid={field.touched && !field.valid}>
        <label for={field.id}>{field.label}</label>
        <input
          id={field.id}
          type="text"
          value={field.value}
          oninput={(e) => updateField(field.id, e.target.value)}
          data-testid={field.id}
        />
        {#if field.touched}
          <span class="status">{field.valid ? '✓' : '✗'}</span>
        {/if}
      </div>
    {/each}

    <div class="actions">
      <button type="submit" disabled={!allValid} class:ready={allValid}>
        {allValid ? '✓ Submit' : 'Complete all fields'}
      </button>
      <button type="button" onclick={fillRandom}>Fill Random</button>
      <button type="button" onclick={reset}>Reset</button>
    </div>
  </form>
</div>

<style>
  .form-app { max-width: 400px; padding: 1rem; }
  h2 { color: #ff3e00; margin-bottom: 1rem; }
  .progress { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; background: #f0f0f0; border-radius: 4px; padding: 0.25rem; }
  .progress-bar { height: 8px; background: #ff3e00; border-radius: 4px; transition: width 0.3s; }
  .field { margin-bottom: 0.75rem; position: relative; }
  label { display: block; font-size: 0.9rem; margin-bottom: 0.25rem; font-weight: 500; }
  input { width: 100%; padding: 0.5rem; border: 2px solid #ddd; border-radius: 4px; font-size: 1rem; transition: border-color 0.2s; }
  input:focus { outline: none; border-color: #ff3e00; }
  .valid input { border-color: #22c55e; }
  .invalid input { border-color: #ef4444; }
  .status { position: absolute; right: 0.5rem; top: 1.8rem; font-size: 1.2rem; }
  .actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
  button { padding: 0.5rem 1rem; border: none; border-radius: 4px; background: #666; color: white; cursor: pointer; }
  button.ready { background: #22c55e; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  button:hover:not(:disabled) { opacity: 0.9; }
</style>
