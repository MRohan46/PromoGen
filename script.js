(function(){
  const qs = (sel, ctx=document) => ctx.querySelector(sel);
  const qsa = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  // THEME TOGGLE
  const applyTheme = (theme) => document.documentElement.setAttribute('data-theme', theme);
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) applyTheme(savedTheme);
  const themeToggle = qs('[data-theme-toggle]');
  themeToggle?.addEventListener('click', () => {
    const next = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  // TAGS INPUT
  const tagsList = qs('[data-tags-list]');
  const tagInput = qs('#audienceInput');
  const maxTags = 8;
  const tags = [];
  const renderTags = () => {
    if (!tagsList) return;
    tagsList.innerHTML = '';
    tags.forEach((t, i) => {
      const el = document.createElement('span');
      el.className = 'tag';
      el.innerHTML = `${t} <button type="button" class="remove" aria-label="Remove ${t}" data-remove="${i}">×</button>`;
      tagsList.appendChild(el);
    });
  };
  tagInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
      e.preventDefault();
      const v = tagInput.value.trim();
      if (!v) return;
      if (tags.includes(v)) return;
      if (tags.length >= maxTags) return;
      tags.push(v);
      tagInput.value = '';
      renderTags();
    }
    if (e.key === 'Backspace' && !tagInput.value && tags.length){
      tags.pop();
      renderTags();
    }
  });
  tagsList?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove]');
    if (btn){
      const idx = Number(btn.getAttribute('data-remove'));
      tags.splice(idx,1);
      renderTags();
    }
  });

  // FORM + GENERATION FLOW (stub)
  const businessType = qs('#businessType');
  const businessTypeOther = qs('#businessTypeOther');
  businessType?.addEventListener('change', () => {
    const isOther = businessType.value === 'Other';
    businessTypeOther.classList.toggle('hidden', !isOther);
    if (isOther) businessTypeOther.focus();
  });

  const form = qs('#generator-form');
  const output = qs('#output');
  const loading = document.querySelector('.loading-overlay');
  const historyList = qs('#historyList');
  const generateBtn = qs('#generateBtn');

  function setLoading(isLoading){
    if (!loading || !generateBtn) return;
    loading.style.display = isLoading ? 'flex' : 'none';
    generateBtn.disabled = isLoading;
  }

  function getFormData(){
    const type = businessType?.value === 'Other' ? (businessTypeOther?.value?.trim() || 'Business') : (businessType?.value || 'Business');
    const goal = qs('#goal')?.value || '';
    const audience = tags.slice();
    return { businessType: type, goal, audience };
  }

  function generateMockContent({businessType, goal, audience}){
    const audienceStr = audience.length ? ` for ${audience.join(', ')}` : '';
    const templates = {
      'Social Media Post': `🚀 ${businessType} update${audienceStr}! Discover what makes us different — quality, care, and innovation. Tap to learn more and join the conversation today. #${businessType.replace(/\\s+/g,'')}`,
      'Ad Copy': `Experience ${businessType} without compromise. Trusted by thousands${audienceStr}. Try it now — risk-free.`,
      'Email Subject Line': `${businessType}: A better way awaits ✨`,
      'Google Ad': `${businessType} — Get started in minutes. Transparent pricing. No surprises.`,
      'Blog Intro': `In today’s market, ${businessType} stands out by putting people first. In this post, we’ll explore how thoughtful design and real-world results come together to deliver value${audienceStr}.`,
      'LinkedIn Post': `${businessType} is evolving. We’re focused on outcomes, not hype. Here’s how we help teams win${audienceStr}.`
    };
    return templates[goal] || `Here’s compelling content for your ${businessType}${audienceStr}.`;
  }

  function appendHistory(text){
    if (!historyList) return;
    const li = document.createElement('li');
    li.className = 'history-item';
    li.textContent = text.slice(0, 160) + (text.length > 160 ? '…' : '');
    historyList.prepend(li);
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = getFormData();
    if (!data.businessType || !data.goal){
      output.innerHTML = '<p>Please select a business type and goal.</p>';
      return;
    }
    setLoading(true);
    output.innerHTML = '';
    try {
      await new Promise(r => setTimeout(r, 900));
      const text = generateMockContent(data);
      const p = document.createElement('p');
      p.textContent = text;
      p.className = 'fade-in';
      output.appendChild(p);
      appendHistory(text);
    } finally {
      setLoading(false);
    }
  });

  // Clear
  qs('#clearBtn')?.addEventListener('click', () => {
    output.innerHTML = '<p class="placeholder">Your content will appear here after generation.</p>';
  });

  // Copy, Download, Print
  qs('#copyBtn')?.addEventListener('click', async () => {
    const text = output?.innerText?.trim();
    if (!text) return;
    try{ await navigator.clipboard.writeText(text); } catch {}
  });
  qs('#downloadBtn')?.addEventListener('click', () => {
    const text = output?.innerText?.trim();
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'marketing-content.txt';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });
  qs('#printBtn')?.addEventListener('click', () => window.print());
})();
