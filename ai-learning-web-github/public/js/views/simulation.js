// views/simulation.js — Panel Simulasi Algoritma (PG-04)

const SIM = { type: null };

function openSimModal(type){
  const titles = { knn: 'Simulasi KNN', nb: 'Simulasi Naive Bayes', bp: 'Simulasi Backpropagation' };
  if (!titles[type]) {
    toast('Jenis simulasi tidak dikenal');
    return;
  }
  closeSimModal();
  SIM.type = type;
  const body = type === 'knn' ? knnForm() : type === 'nb' ? nbForm() : bpForm();
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-overlay show" id="simOverlay">
      <div class="modal">
        <div class="modal-head">
          <h3>🔢 ${titles[type]}</h3>
          <button class="modal-close" data-act="close-sim">×</button>
        </div>
        <div class="modal-body">${body}</div>
      </div>
    </div>`);
}

function closeSimModal(){
  const el = $('#simOverlay');
  if (el) el.remove();
  SIM.type = null;
}

// ---------- KNN ----------
function knnForm(){
  const samples = [
    { x: 1, y: 2, c: 'A' }, { x: 2, y: 3, c: 'A' }, { x: 3, y: 3, c: 'A' },
    { x: 6, y: 5, c: 'B' }, { x: 7, y: 7, c: 'B' }, { x: 8, y: 6, c: 'B' },
  ];
  return `
    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px">
      Data latih (6 titik, 2 kelas) & data uji. Ubah K lalu klik <b>Hitung</b>.
    </p>
    <div style="font-size:12px;margin-bottom:10px"><b>Data Latih:</b></div>
    <table class="sim-table">
      <thead><tr><th>#</th><th>X</th><th>Y</th><th>Kelas</th></tr></thead>
      <tbody>${samples.map((s,i)=>`<tr><td>${i+1}</td><td>${s.x}</td><td>${s.y}</td><td>${s.c}</td></tr>`).join('')}</tbody>
    </table>
    <div class="sim-inputs">
      <div class="field"><label>X Uji</label><input id="knn-x" type="number" value="4" step="0.1"></div>
      <div class="field"><label>Y Uji</label><input id="knn-y" type="number" value="4" step="0.1"></div>
      <div class="field"><label>Nilai K</label><input id="knn-k" type="number" value="3" min="1" max="6"></div>
    </div>
    <button class="btn btn-primary" data-act="run-knn">Hitung KNN</button>
    <div id="knn-result"></div>`;
}

function runKNN(){
  const xValue = $('#knn-x').value.trim(), yValue = $('#knn-y').value.trim();
  const kValue = $('#knn-k').value.trim();
  const x = Number(xValue), y = Number(yValue), k = Number(kValue);
  const samples = [
    { x: 1, y: 2, c: 'A' }, { x: 2, y: 3, c: 'A' }, { x: 3, y: 3, c: 'A' },
    { x: 6, y: 5, c: 'B' }, { x: 7, y: 7, c: 'B' }, { x: 8, y: 6, c: 'B' },
  ];
  if (!xValue || !yValue || !kValue || !Number.isFinite(x) || !Number.isFinite(y)
      || !Number.isInteger(k) || k < 1 || k > samples.length) {
    toast(`Masukkan X dan Y yang valid serta K antara 1 dan ${samples.length}`);
    return;
  }
  const rows = samples.map((s, i) => {
    const dx = x - s.x, dy = y - s.y;
    const d = Math.sqrt(dx*dx + dy*dy);
    return { i: i+1, x: s.x, y: s.y, c: s.c, d };
  }).sort((a, b) => a.d - b.d);

  const topK = rows.slice(0, k);
  const votes = {};
  topK.forEach(r => votes[r.c] = (votes[r.c] || 0) + 1);
  const winner = Object.entries(votes).sort((a,b)=>b[1]-a[1])[0][0];

  const tableRows = rows.map((r, idx) => `
    <tr class="${idx < k ? 'highlight' : ''}">
      <td>${r.i}</td><td>${r.x}</td><td>${r.y}</td><td>${r.c}</td>
      <td>√((${x}-${r.x})² + (${y}-${r.y})²) = <b>${r.d.toFixed(3)}</b></td>
    </tr>`).join('');

  $('#knn-result').innerHTML = `
    <div class="sim-result">
      <h4>Langkah Perhitungan</h4>
      <table class="sim-table">
        <thead><tr><th>#</th><th>X</th><th>Y</th><th>Kelas</th><th>Jarak Euclidean</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="sim-step"><b>K = ${k}</b>, ${k} tetangga terdekat disorot kuning.</div>
      <div class="sim-step">Voting: ${Object.entries(votes).map(([c,v])=>`Kelas <b>${c}</b> = ${v} suara`).join(' · ')}</div>
      <div class="sim-verdict">Prediksi kelas data uji (${x}, ${y}) = <b>${winner}</b></div>
    </div>`;
}

// ---------- Naive Bayes ----------
function nbForm(){
  return `
    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px">
      Dataset main <i>"tennis"</i>: prediksi main tenis berdasarkan Cuaca & Suhu.
    </p>
    <table class="sim-table">
      <thead><tr><th>#</th><th>Cuaca</th><th>Suhu</th><th>Main?</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>Cerah</td><td>Panas</td><td>Ya</td></tr>
        <tr><td>2</td><td>Cerah</td><td>Panas</td><td>Ya</td></tr>
        <tr><td>3</td><td>Mendung</td><td>Panas</td><td>Ya</td></tr>
        <tr><td>4</td><td>Hujan</td><td>Dingin</td><td>Tidak</td></tr>
        <tr><td>5</td><td>Hujan</td><td>Dingin</td><td>Tidak</td></tr>
        <tr><td>6</td><td>Mendung</td><td>Dingin</td><td>Tidak</td></tr>
      </tbody>
    </table>
    <div class="sim-inputs">
      <div class="field"><label>Cuaca</label>
        <select id="nb-weather"><option>Cerah</option><option>Mendung</option><option>Hujan</option></select>
      </div>
      <div class="field"><label>Suhu</label>
        <select id="nb-temp"><option>Panas</option><option>Dingin</option></select>
      </div>
    </div>
    <button class="btn btn-primary" data-act="run-nb">Hitung Naive Bayes</button>
    <div id="nb-result"></div>`;
}

function runNB(){
  const weather = $('#nb-weather').value, temp = $('#nb-temp').value;
  const data = [
    {w:'Cerah',t:'Panas',y:'Ya'}, {w:'Cerah',t:'Panas',y:'Ya'}, {w:'Mendung',t:'Panas',y:'Ya'},
    {w:'Hujan',t:'Dingin',y:'Tidak'}, {w:'Hujan',t:'Dingin',y:'Tidak'}, {w:'Mendung',t:'Dingin',y:'Tidak'},
  ];
  const classes = ['Ya', 'Tidak'];
  const weatherValues = [...new Set(data.map(row => row.w))];
  const temperatureValues = [...new Set(data.map(row => row.t))];
  const total = data.length;
  const stats = {};

  classes.forEach(c => {
    const subset = data.filter(d => d.y === c);
    stats[c] = {
      prior: subset.length / total,
      w: (subset.filter(d => d.w === weather).length + 1) / (subset.length + weatherValues.length),
      t: (subset.filter(d => d.t === temp).length + 1) / (subset.length + temperatureValues.length),
      n: subset.length,
    };
  });

  const rows = classes.map(c => {
    const s = stats[c];
    const post = s.prior * s.w * s.t;
    return { c, ...s, post };
  });
  const best = rows.sort((a,b) => b.post - a.post)[0];

  $('#nb-result').innerHTML = `
    <div class="sim-result">
      <h4>Perhitungan Probabilitas</h4>
      <table class="sim-table">
        <thead><tr><th>Kelas</th><th>n</th><th>P(C)</th><th>P(${weather}|C)</th><th>P(${temp}|C)</th><th>P(C)·ΠP(X|C)</th></tr></thead>
        <tbody>
          ${rows.map(r => `<tr class="${r.c===best.c?'highlight':''}">
            <td>${r.c}</td><td>${r.n}</td>
            <td>${r.prior.toFixed(3)}</td>
            <td>${r.w.toFixed(3)}</td>
            <td>${r.t.toFixed(3)}</td>
            <td><b>${r.post.toFixed(5)}</b></td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="sim-step">Prior P(C) = jumlah kelas / total data.</div>
      <div class="sim-step">Likelihood memakai Laplace smoothing: (jumlah fitur sama + 1) / (jumlah kelas + jumlah nilai fitur).</div>
      <div class="sim-verdict">Prediksi: <b>Main tenis = ${best.c}</b> (posterior tertinggi)</div>
    </div>`;
}

// ---------- Backpropagation ----------
function bpForm(){
  return `
    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px">
      Jaringan 2-input → 2-hidden → 1-output, aktivasi <b>sigmoid</b>, loss MSE, learning rate η = 0.5.
    </p>
    <pre>Input x = [0.5, 0.8]   Target y = 1
W1 = [[0.1, 0.2], [0.3, 0.4]]   b1 = [0.1, 0.1]
W2 = [[0.5], [0.6]]              b2 = [0.2]</pre>
    <button class="btn btn-primary" data-act="run-bp">Jalankan 1 Iterasi Backprop</button>
    <div id="bp-result"></div>`;
}

function sigmoid(x){ return 1 / (1 + Math.exp(-x)); }

function runBP(){
  const x = [0.5, 0.8], y = 1, lr = 0.5;
  const W1 = [[0.1, 0.2], [0.3, 0.4]], b1 = [0.1, 0.1];
  const W2 = [0.5, 0.6], b2 = 0.2;

  // Forward
  const z1 = [
    W1[0][0]*x[0] + W1[1][0]*x[1] + b1[0],
    W1[0][1]*x[0] + W1[1][1]*x[1] + b1[1],
  ];
  const a1 = z1.map(sigmoid);
  const z2 = W2[0]*a1[0] + W2[1]*a1[1] + b2;
  const a2 = sigmoid(z2);
  const loss = 0.5 * (a2 - y) ** 2;

  // Backward
  const dL_da2 = a2 - y;
  const dL_dz2 = dL_da2 * a2 * (1 - a2);
  const dL_dW2 = [dL_dz2 * a1[0], dL_dz2 * a1[1]];
  const dL_db2 = dL_dz2;
  const dL_da1 = [dL_dz2 * W2[0], dL_dz2 * W2[1]];
  const dL_dz1 = [dL_da1[0] * a1[0] * (1 - a1[0]), dL_da1[1] * a1[1] * (1 - a1[1])];
  const dL_dW1 = [
    [dL_dz1[0] * x[0], dL_dz1[1] * x[0]],
    [dL_dz1[0] * x[1], dL_dz1[1] * x[1]],
  ];

  // Update
  const newW1 = W1.map((row, i) => row.map((w, j) => w - lr * dL_dW1[i][j]));
  const newB1 = b1.map((b, i) => b - lr * dL_dz1[i]);
  const newW2 = W2.map((w, i) => w - lr * dL_dW2[i]);
  const newB2 = b2 - lr * dL_db2;

  $('#bp-result').innerHTML = `
    <div class="sim-result">
      <h4>Forward Pass</h4>
      <div class="sim-step">z1 = [${z1.map(v=>v.toFixed(3)).join(', ')}] → a1 = σ(z1) = [${a1.map(v=>v.toFixed(3)).join(', ')}]</div>
      <div class="sim-step">z2 = ${z2.toFixed(3)} → a2 = σ(z2) = <b>${a2.toFixed(4)}</b></div>
      <div class="sim-step">Loss setengah kuadrat error = ½(a2 − y)² = <b>${loss.toFixed(5)}</b></div>
      <h4>Backward Pass</h4>
      <div class="sim-step">∂L/∂z2 = (a2 − y)·a2·(1−a2) = <b>${dL_dz2.toFixed(5)}</b></div>
      <div class="sim-step">∂L/∂W2 = [${dL_dW2.map(v=>v.toFixed(5)).join(', ')}]</div>
      <div class="sim-step">∂L/∂z1 = [${dL_dz1.map(v=>v.toFixed(5)).join(', ')}]</div>
      <h4>Update Bobot (η = ${lr})</h4>
      <div class="sim-step">W2 baru = [${newW2.map(v=>v.toFixed(4)).join(', ')}]</div>
      <div class="sim-step">b2 baru = ${newB2.toFixed(4)}</div>
      <div class="sim-step">W1 baru = [[${newW1[0].map(v=>v.toFixed(4)).join(', ')}], [${newW1[1].map(v=>v.toFixed(4)).join(', ')}]]</div>
      <div class="sim-step">b1 baru = [${newB1.map(v=>v.toFixed(4)).join(', ')}]</div>
      <div class="sim-verdict">✅ Iterasi selesai — bobot sudah diperbarui, loss turun pada iterasi berikutnya.</div>
    </div>`;
}