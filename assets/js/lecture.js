// ===== LECTURE PAGE =====

let lectureData = null;
let currentMode = 'mnemonics';

async function loadLecture() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) { location.href = 'index.html'; return; }

  try {
    const indexRes = await fetch('data/index.json');
    if (!indexRes.ok) throw new Error('index not found');
    const index = await indexRes.json();
    const entry = index.lectures.find(l => l.id === id);
    if (!entry) throw new Error('not found');

    const res = await fetch(`data/${entry.exam}/${entry.slug}.json`);
    if (!res.ok) throw new Error('not found');
    lectureData = await res.json();
    renderLecture();
  } catch (e) {
    console.error(e);
    document.getElementById('loadingState').innerHTML =
      '<p style="color:var(--red);text-align:center;padding:60px">تعذّر تحميل المحاضرة.</p>';
  }
}

function renderLecture() {
  document.title = `${lectureData.title} | Pharma Memory Hub`;

  // Header
  document.getElementById('lectureTitle').textContent = lectureData.title;
  const exam = lectureData.exam;
  const badgeClass = exam === 'mid1' ? 'badge-mid1' : exam === 'mid2' ? 'badge-mid2' : 'badge-final';
  const examLabel = exam === 'mid1' ? 'MID 1' : exam === 'mid2' ? 'MID 2' : 'Final';
  const topics = (lectureData.topics || []).slice(0, 4).map(t =>
    `<span class="topic-tag">${t}</span>`).join('');
  document.getElementById('lectureMeta').innerHTML =
    `<span class="exam-badge ${badgeClass}">${examLabel}</span>${topics}`;

  // Summary
  if (lectureData.summary) {
    document.getElementById('summaryText').textContent = lectureData.summary;
  } else {
    document.getElementById('summaryBox').style.display = 'none';
  }

  // Key drugs table
  const drugs = lectureData.key_drugs || [];
  if (drugs.length > 0) {
    const tbody = document.getElementById('keyDrugsBody');
    tbody.innerHTML = drugs.map(d =>
      `<tr><td>${d.name}</td><td>${d.class || '—'}</td><td>${d.note || '—'}</td></tr>`
    ).join('');
  } else {
    document.getElementById('keyDrugsBox').style.display = 'none';
  }

  // Mnemonics
  const mnemonics = lectureData.mnemonics || [];
  const container = document.getElementById('mnemonicsContainer');
  if (mnemonics.length === 0) {
    document.getElementById('mnemonicsEmpty').style.display = 'block';
  } else {
    container.innerHTML = mnemonics.map(m => buildMnemonicCard(m)).join('');
  }

  // Flashcards
  initFlashcards(lectureData.flashcards || []);

  // Quiz
  initQuiz(lectureData.mcqs || []);

  // Show page
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('pageContent').style.display = 'block';
}

function buildMnemonicCard(m) {
  const typeClass = {
    acronym: 'type-acronym',
    story: 'type-story',
    visual: 'type-visual'
  }[m.type] || 'type-story';

  const typeLabel = {
    acronym: '🔤 اختصار',
    story: '📖 قصة',
    visual: '🎨 بصري'
  }[m.type] || '📖 قصة';

  const coversHtml = (m.covers || []).map(d =>
    `<span class="drug-tag">${d}</span>`).join('');

  const sourceHtml = m.source_ref
    ? `<div style="margin-top:10px;font-size:0.75rem;color:var(--text3)">📌 المصدر: ${m.source_ref}</div>`
    : '';

  return `
    <div class="mnemonic-card">
      <span class="mnemonic-type ${typeClass}">${typeLabel}</span>
      <h3>${m.title}</h3>
      <div class="body">${m.body}</div>
      ${coversHtml ? `<div class="covers">${coversHtml}</div>` : ''}
      ${sourceHtml}
    </div>
  `;
}

function switchMode(mode) {
  currentMode = mode;
  ['mnemonics', 'flashcards', 'quiz'].forEach(m => {
    document.getElementById(`mode-${m}`).style.display = m === mode ? 'block' : 'none';
    document.querySelector(`[data-mode="${m}"]`).classList.toggle('active', m === mode);
  });
}

// Start
loadLecture();
