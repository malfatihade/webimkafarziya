// store.js — Data materi AI sesuai RPS & state global

const COURSE = {
  name: 'Kecerdasan Buatan (AI)',
  sks: 3,
  semester: 'Genap 2026/2027',
  prodi: 'Teknik Informatika',
  desc: 'Platform pembelajaran mandiri AI sesuai RPS: dari konsep agen cerdas, sistem pakar Prolog, machine learning (KNN, Naive Bayes, Backpropagation), hingga tools open-source (WEKA) & deep learning (ResNet-34).',
};

const MODULES = [
  {
    id: 'm1', num: '01', color: '#0F766E',
    title: 'Konsep Dasar AI & Intelligent Agents',
    dur: '2 pertemuan',
    desc: 'Memahami definisi AI, sejarah, studi kasus NASA Perseverance Rover, serta analisis task environment (PEAS) dan cabang-cabang AI.',
    lessons: [
      {
        id: 'm1l1', title: 'Definisi, Sejarah & Studi Kasus (NASA Perseverance Rover)',
        objective: 'Mahasiswa dapat menjelaskan definisi AI, sejarah perkembangannya, serta mengidentifikasi penerapan AI pada studi kasus nyata.',
        body: `
          <h4>Definisi Kecerdasan Buatan</h4>
          <p>AI adalah cabang ilmu komputer yang berfokus pada pembuatan sistem yang mampu meniru kemampuan kognitif manusia: belajar, menalar, memecahkan masalah, dan mengambil keputusan.</p>
          <h4>Sejarah Singkat</h4>
          <ul>
            <li><b>1950</b> — Alan Turing memperkenalkan <i>Turing Test</i>.</li>
            <li><b>1956</b> — Dartmouth Workshop; AI lahir sebagai disiplin ilmu.</li>
            <li><b>1970–1980</b> — Era sistem pakar (expert systems).</li>
            <li><b>2010–sekarang</b> — Era <i>deep learning</i> & AI generatif.</li>
          </ul>
          <h4>Studi Kasus: NASA Perseverance Rover</h4>
          <p>Rover Perseverance menggunakan AutoNav untuk merencanakan sebagian perjalanan secara otonom dan memproses pengamatan di Mars. Sistem membantu navigasi dalam jeda komunikasi dengan Bumi, sementara tujuan ilmiah dan rencana misi tetap melibatkan tim manusia.</p>
          <ul>
            <li><b>Computer Vision</b> — mengenali medan & bebatuan.</li>
            <li><b>Machine Learning</b> — memilih target sampel optimal.</li>
            <li><b>Planning</b> — merencanakan rute aman.</li>
          </ul>
          <h4>Bagaimana AI Membuat Keputusan?</h4>
          <p>Sistem menerima data dari sensor, mengubahnya menjadi representasi yang dapat diproses, lalu memilih tindakan berdasarkan tujuan dan batasan. Kemampuan tersebut tidak berarti komputer memiliki kesadaran; sistem menjalankan model, aturan, dan prosedur yang dirancang manusia.</p>
          <p>AI berbeda dari otomatisasi sederhana. Pengatur lampu dengan jadwal tetap mengikuti aturan yang sama, sedangkan sistem AI dapat menggunakan data untuk mengenali pola atau menyesuaikan prediksi. Banyak produk menggabungkan keduanya.</p>
          <h4>Batasan pada Rover</h4>
          <p>Jeda komunikasi antara Mars dan Bumi membuat rover perlu mengambil sebagian keputusan navigasi secara mandiri. Namun, otonomi tetap dibatasi oleh energi, kemampuan sensor, kondisi medan, dan rencana misi yang disusun tim manusia.</p>
          `
      },
      {
        id: 'm1l2', title: 'Analisis Task Environment (PEAS) & Cabang AI',
        objective: 'Mahasiswa mampu menganalisis task environment sebuah agen cerdas menggunakan kerangka PEAS.',
        body: `
          <h4>Kerangka PEAS</h4>
          <ul>
            <li><b>P — Performance Measure</b>: ukuran keberhasilan agen.</li>
            <li><b>E — Environment</b>: lingkungan kerja agen.</li>
            <li><b>A — Actuators</b>: aksi yang dapat dilakukan agen.</li>
            <li><b>S — Sensors</b>: cara agen mempersepsi lingkungan.</li>
          </ul>
          <h4>Contoh PEAS: Taksi Otonom</h4>
          <pre>Performance : Aman, cepat, legal, nyaman
Environment : Jalan raya, lalu lintas, pejalan kaki
Actuators   : Setir, gas, rem, klakson
Sensors     : Kamera, LiDAR, GPS, speedometer</pre>
          <h4>Cabang-Cabang AI</h4>
          <ul>
            <li><b>Machine Learning</b> — belajar dari data.</li>
            <li><b>NLP</b> — pemrosesan bahasa manusia.</li>
            <li><b>Computer Vision</b> — interpretasi citra/video.</li>
            <li><b>Robotics</b> — integrasi AI dengan perangkat fisik.</li>
            <li><b>Expert Systems</b> — sistem berbasis aturan.</li>
          </ul>
          <h4>Siklus Agen Cerdas</h4>
          <p>Agen mengamati lingkungan melalui sensor, memperbarui pemahamannya, memilih tindakan, lalu menggunakan aktuator untuk bertindak. Siklus ini berulang karena lingkungan dapat berubah dan pengamatan tidak selalu lengkap.</p>
          <h4>Karakteristik Lingkungan</h4>
          <p>Selain PEAS, lingkungan dapat dianalisis sebagai teramati penuh atau sebagian, deterministik atau stokastik, statis atau dinamis, serta episodik atau berurutan. Karakteristik tersebut membantu menentukan kebutuhan memori, perencanaan, dan penanganan ketidakpastian.</p>
          `
      }
    ]
  },
  {
    id: 'm2', num: '02', color: '#0284C7',
    title: 'Sistem Berbasis Pengetahuan & Prolog',
    dur: '2 pertemuan',
    desc: 'Teori rule, fakta, query, studi kasus sistem pakar, dan praktikum online SWISH SWI-Prolog.',
    swish: 'https://swish.swi-prolog.org/',
    lessons: [
      {
        id: 'm2l1', title: 'Teori Rule, Fakta, Query & Studi Kasus Sistem Pakar',
        objective: 'Mahasiswa memahami konsep fakta, rule, dan query dalam sistem berbasis pengetahuan.',
        body: `
          <h4>Komponen Sistem Berbasis Pengetahuan</h4>
          <ul>
            <li><b>Fakta</b> — pernyataan benar yang menjadi basis pengetahuan.</li>
            <li><b>Rule</b> — aturan IF-THEN untuk inferensi.</li>
            <li><b>Query</b> — pertanyaan yang diajukan ke sistem.</li>
            <li><b>Inference Engine</b> — mesin penalaran (forward/backward chaining).</li>
          </ul>
          <h4>Contoh Prolog</h4>
          <pre>% Fakta
orang_bijak(socrates).
manusia(X) :- orang_bijak(X).

% Query
?- manusia(socrates).
true.</pre>
          <h4>Studi Kasus: Sistem Pakar Diagnosa</h4>
          <p>Sistem pakar medis menggunakan rule IF gejala THEN penyakit untuk membantu dokter mendiagnosis. Contoh historisnya adalah MYCIN. Hasil sistem berbasis aturan perlu ditinjau ahli; keluaran bukan pengganti pemeriksaan profesional.</p>
          <h4>Membaca Sintaks Prolog</h4>
          <p>Fakta dan aturan diakhiri titik. Atom biasanya ditulis dengan huruf kecil, sedangkan variabel diawali huruf besar atau garis bawah. Tanda <code>:-</code> berarti “benar jika”, dan beberapa kondisi di sisi kanan aturan dipisahkan koma yang berarti AND.</p>
          <h4>Proses Inferensi</h4>
          <p>Pada backward chaining, sistem memulai dari query lalu mencari aturan dan fakta yang dapat membuktikannya. Pada forward chaining, sistem memulai dari fakta yang tersedia dan menerapkan aturan untuk memperoleh kesimpulan baru. Pilihan strategi memengaruhi cara sistem menelusuri basis pengetahuan.</p>`
      },
      {
        id: 'm2l2', title: 'Akses Praktikum Online (SWISH SWI-Prolog)',
        objective: 'Mahasiswa mampu menjalankan program Prolog pada lingkungan SWISH online.',
        body: `
          <h4>Langkah Praktikum</h4>
          <ul>
            <li>Buka <a href="https://swish.swi-prolog.org/" target="_blank" rel="noopener" style="color:#0284C7;font-weight:700">SWISH SWI-Prolog</a> di tab baru.</li>
            <li>Tulis fakta & rule pada editor kiri.</li>
            <li>Jalankan query pada panel kanan bawah.</li>
            <li>Simpan program dengan tombol <i>File → Save</i>.</li>
          </ul>
          <h4>Contoh Program Keluarga</h4>
          <pre>parent(andi, budi).
parent(budi, citra).

grandparent(X, Z) :- parent(X, Y), parent(Y, Z).

?- grandparent(andi, citra).
true.</pre>
          <p>Mulailah dari fakta sederhana dan jalankan query setelah setiap perubahan. Jika hasilnya <code>false</code>, periksa ejaan atom, urutan argumen, tanda titik, dan apakah aturan sesuai dengan fakta.</p>`
      }
    ]
  },
  {
    id: 'm3', num: '03', color: '#7C3AED',
    title: 'Machine Learning & k-Nearest Neighbor (KNN)',
    dur: '2 pertemuan',
    desc: 'Konsep dasar ML, studi kasus biometrik pengenalan wajah, dan simulasi perhitungan manual KNN interaktif.',
    hasSimulation: true,
    lessons: [
      {
        id: 'm3l1', title: 'Konsep Dasar ML & Studi Kasus Biometrik Pengenalan Wajah',
        objective: 'Mahasiswa memahami paradigma ML dan penerapannya pada biometrik wajah.',
        body: `
          <h4>Paradigma Machine Learning</h4>
          <ul>
            <li><b>Supervised</b> — data berlabel (klasifikasi, regresi).</li>
            <li><b>Unsupervised</b> — data tanpa label (clustering).</li>
            <li><b>Reinforcement</b> — belajar dari reward/penalty.</li>
          </ul>
          <h4>Studi Kasus: Pengenalan Wajah</h4>
          <p>Sistem biometrik wajah mengekstraksi fitur wajah (embedding) lalu membandingkan jarak antar-embedding. Algoritma KNN dapat mengklasifikasikan identitas berdasarkan kedekatan fitur, tetapi mutu hasil dipengaruhi pencahayaan, sudut wajah, variasi data, dan pemilihan ambang keputusan.</p>
          <h4>Alur Kerja Machine Learning</h4>
          <ol>
            <li>Kumpulkan data yang relevan dan berizin.</li>
            <li>Bersihkan data, pilih fitur, lalu pisahkan data latih dan evaluasi.</li>
            <li>Latih model hanya menggunakan data latih.</li>
            <li>Evaluasi pada data yang belum digunakan saat pelatihan.</li>
            <li>Gunakan model dengan pemantauan dan evaluasi berkala.</li>
          </ol>
          <h4>Privasi dan Keadilan</h4>
          <p>Data wajah merupakan data biometrik yang sensitif. Pengumpulan memerlukan tujuan yang jelas, persetujuan yang sesuai, perlindungan penyimpanan, dan pembatasan akses. Kinerja juga perlu diuji pada kelompok dan kondisi yang beragam agar kesalahan tidak merugikan kelompok tertentu.</p>`
      },
      {
        id: 'm3l2', title: 'Simulasi Perhitungan Manual KNN (Interaktif)',
        objective: 'Mahasiswa mampu menghitung jarak Euclidean dan menentukan kelas berdasarkan K tetangga terdekat.',
        hasSim: 'knn',
        body: `
          <h4>Algoritma KNN</h4>
          <ul>
            <li>Pilih K (jumlah tetangga).</li>
            <li>Hitung jarak Euclidean data uji ke semua data latih: <code>d = √((x₂-x₁)² + (y₂-y₁)²)</code>.</li>
            <li>Urutkan jarak & ambil K terkecil.</li>
            <li>Voting mayoritas → kelas prediksi.</li>
          </ul>
          <h4>Contoh Perhitungan</h4>
          <p>Misalkan data uji adalah (4,4). Jarak ke titik kelas A (3,3) adalah √2 ≈ 1,414. Jarak ke (2,3) kelas A adalah √5 ≈ 2,236, dan ke (6,5) kelas B juga √5 ≈ 2,236. Jika tiga tetangga terdekat memberi dua suara A dan satu suara B, prediksi mayoritasnya adalah A.</p>
          <h4>Memilih Nilai K</h4>
          <p>Nilai K kecil peka terhadap noise, sedangkan K terlalu besar dapat mengaburkan pola lokal. Uji beberapa nilai K pada data validasi. Jika skala fitur berbeda jauh, lakukan penskalaan terlebih dahulu agar fitur berskala besar tidak mendominasi jarak.</p>
          <p>Klik tombol <b>"Buka Simulasi KNN"</b> di bawah untuk mencoba kalkulator interaktif langkah demi langkah.</p>`
      }
    ]
  },
  {
    id: 'm4', num: '04', color: '#D97706',
    title: 'Naive Bayes Classifier',
    dur: '1 pertemuan',
    desc: 'Teori probabilitas & simulasi perhitungan manual Naive Bayes dengan data sampel.',
    hasSimulation: true,
    lessons: [
      {
        id: 'm4l1', title: 'Teori Probabilitas & Simulasi Perhitungan Manual Naive Bayes',
        objective: 'Mahasiswa mampu menghitung probabilitas posterior Naive Bayes secara manual.',
        hasSim: 'nb',
        body: `
          <h4>Teorema Bayes</h4>
          <p><code>P(C|X) = P(X|C) · P(C) / P(X)</code></p>
          <p>Naive Bayes mengasumsikan antar-fitur saling independen sehingga <code>P(X|C) = Π P(xᵢ|C)</code>.</p>
          <h4>Langkah Perhitungan</h4>
          <ul>
            <li>Hitung prior P(C) tiap kelas.</li>
            <li>Hitung likelihood P(xᵢ|C) tiap fitur per kelas.</li>
            <li>Kalikan semua likelihood & prior.</li>
            <li>Pilih kelas dengan probabilitas posterior tertinggi.</li>
          </ul>
          <h4>Memahami Komponen</h4>
          <p><b>Prior</b> menunjukkan peluang kelas sebelum fitur diamati. <b>Likelihood</b> mengukur seberapa cocok fitur dengan kelas. Posterior menggabungkan keduanya: <code>P(C|X) ∝ P(C) × P(X|C)</code>. Karena faktor <code>P(X)</code> sama untuk semua kelas, perbandingan skor dapat dilakukan tanpa menghitungnya.</p>
          <h4>Asumsi dan Laplace Smoothing</h4>
          <p>Asumsi “naive” menyederhanakan perhitungan dengan menganggap fitur saling independen setelah kelas diketahui. Dalam data nyata, asumsi ini belum tentu benar. Jika suatu nilai fitur belum pernah muncul pada kelas tertentu, Laplace smoothing menambahkan hitungan kecil agar likelihood tidak menjadi nol.</p>
          <p>Klik tombol <b>"Buka Simulasi Naive Bayes"</b> untuk mencoba kalkulator interaktif.</p>`
      }
    ]
  },
  {
    id: 'm5', num: '05', color: '#DC2626',
    title: 'Multi-Layer Perceptron & Backpropagation',
    dur: '1 pertemuan',
    desc: 'Arsitektur MLP & simulasi perhitungan manual backpropagation step-by-step.',
    hasSimulation: true,
    lessons: [
      {
        id: 'm5l1', title: 'Arsitektur MLP & Simulasi Perhitungan Manual Backpropagation',
        objective: 'Mahasiswa memahami forward pass, loss, backward pass, dan update bobot MLP.',
        hasSim: 'bp',
        body: `
          <h4>Arsitektur MLP</h4>
          <ul>
            <li><b>Input layer</b> → <b>Hidden layer(s)</b> → <b>Output layer</b>.</li>
            <li>Tiap neuron: <code>z = Σ(wᵢxᵢ) + b</code>, <code>a = σ(z)</code>.</li>
            <li>Aktivasi umum: sigmoid, ReLU, tanh.</li>
          </ul>
          <h4>Backpropagation</h4>
          <ul>
            <li><b>Forward</b>: hitung output prediksi.</li>
            <li><b>Loss</b>: ukur selisih prediksi terhadap target.</li>
            <li><b>Backward</b>: hitung gradien via chain rule.</li>
            <li><b>Update</b>: <code>w ← w - η · ∂L/∂w</code>.</li>
          </ul>
          <h4>Forward Pass</h4>
          <p>Setiap neuron menghitung jumlah berbobot <code>z = Σ(wᵢxᵢ)+b</code>, lalu menerapkan fungsi aktivasi untuk menghasilkan <code>a</code>. Nilai aktivasi satu lapisan menjadi masukan lapisan berikutnya hingga diperoleh prediksi.</p>
          <h4>Backward Pass dan Pembaruan</h4>
          <p>Gradien menunjukkan arah perubahan parameter yang menaikkan loss. Backpropagation meneruskan turunan dari output ke lapisan sebelumnya menggunakan chain rule. Bobot dan bias kemudian diperbarui berlawanan arah gradien; learning rate terlalu besar dapat membuat proses tidak stabil, sedangkan nilai terlalu kecil memperlambat pembelajaran.</p>
          <h4>Evaluasi Iterasi</h4>
          <p>Bandingkan loss sebelum dan setelah pembaruan menggunakan input dan target yang sama. Satu iterasi yang menurunkan loss belum menjamin model bekerja baik pada data baru; evaluasi tetap memerlukan data validasi.</p>
          <p>Klik tombol <b>"Buka Simulasi Backpropagation"</b> untuk mencoba kalkulator interaktif 2-layer.</p>`
      }
    ]
  },
  {
    id: 'm6', num: '06', color: '#0F172A',
    title: 'Tools Open-Source & Deep Learning',
    dur: '2 pertemuan',
    desc: 'Panduan praktikum WEKA & arsitektur deep learning ResNet-34.',
    lessons: [
      {
        id: 'm6l1', title: 'Panduan Praktikum WEKA',
        objective: 'Mahasiswa mampu menggunakan WEKA untuk eksperimen ML klasik.',
        body: `
          <h4>Langkah Praktikum WEKA</h4>
          <ul>
            <li>Unduh & pasang WEKA dari <a href="https://www.cs.waikato.ac.nz/ml/weka/" target="_blank" rel="noopener" style="color:#0284C7;font-weight:700">cs.waikato.ac.nz/ml/weka</a>.</li>
            <li>Buka <i>Explorer</i> → <i>Preprocess</i> → muat dataset (ARFF/CSV).</li>
            <li>Pilih tab <i>Classify</i> → pilih algoritma (J48, NaiveBayes, IBk/KNN).</li>
            <li>Klik <i>Start</i> → lihat output accuracy, confusion matrix.</li>
          </ul>
          <h4>Membaca Hasil Evaluasi</h4>
          <p>Jangan hanya melihat akurasi. Confusion matrix menunjukkan jumlah prediksi benar dan salah per kelas; precision dan recall membantu saat biaya kesalahan tiap kelas berbeda. Untuk estimasi yang lebih stabil pada dataset kecil, gunakan cross-validation dan laporkan pengaturan eksperimennya.</p>
          <h4>Praktik yang Baik</h4>
          <p>Pisahkan data evaluasi sebelum memilih model atau mengatur parameter. Jika informasi dari data uji ikut memengaruhi pelatihan, hasil evaluasi menjadi terlalu optimistis. Catat dataset, preprocessing, algoritma, parameter, serta random seed agar eksperimen dapat diulang.</p>`
      },
      {
        id: 'm6l2', title: 'Arsitektur Deep Learning (ResNet-34)',
        objective: 'Mahasiswa memahami konsep residual connection pada ResNet-34.',
        body: `
          <h4>ResNet-34</h4>
          <ul>
            <li>34 layer deep CNN dengan <b>residual connection</b> (<code>y = F(x) + x</code>).</li>
            <li>Membantu optimisasi jaringan dalam dengan jalur residual.</li>
            <li>Arsitektur: Conv 7×7 → 4 stage residual block → Global Average Pooling → FC.</li>
            <li>Dilatih pada ImageNet (1000 kelas).</li>
          </ul>
          <h4>Penerapan</h4>
          <ul>
            <li>Feature extractor untuk klasifikasi citra medis.</li>
            <li>Transfer learning ke dataset kecil.</li>
          </ul>
          <h4>Susunan Residual Block</h4>
          <p>ResNet-34 menggunakan empat stage residual dengan jumlah basic block 3, 4, 6, dan 3. Pada blok identitas, masukan ditambahkan kembali ke hasil transformasi: <code>y = F(x) + x</code>. Jika ukuran atau jumlah kanal berubah, shortcut memakai proyeksi agar dimensinya cocok.</p>
          <h4>Mengapa Shortcut Membantu?</h4>
          <p>Jalur shortcut menyediakan lintasan langsung bagi sinyal dan gradien. Ini membantu optimisasi jaringan dalam dibanding menumpuk transformasi tanpa jalur residual, meskipun tidak menghilangkan seluruh tantangan pelatihan.</p>
          <h4>Transfer Learning</h4>
          <p>Model pralatih dapat digunakan sebagai ekstraktor fitur atau disesuaikan pada dataset target. Samakan preprocessing dengan model asal, pisahkan data uji, dan evaluasi bias serta kesesuaian domain sebelum digunakan—terutama pada aplikasi berisiko tinggi.</p>`
      }
    ]
  }
];

const MODULE_QUIZZES = {
  m1: [
    {
      id: 'm1q1', type: 'choice', lessonId: 'm1l1',
      prompt: 'Apa perbedaan utama AI dengan otomatisasi berbasis aturan tetap?',
      options: [
        'AI selalu memiliki kesadaran seperti manusia.',
        'Otomatisasi tetap selalu belajar dari data baru.',
        'AI dapat mengenali pola dari data, sedangkan aturan tetap mengikuti instruksi yang ditentukan.',
        'AI dan otomatisasi tidak pernah digunakan bersamaan.',
      ],
      answer: 2,
      explanation: 'AI dapat menggunakan model atau data untuk mengenali pola dan membuat prediksi. Otomatisasi berbasis aturan menjalankan instruksi yang sudah ditetapkan; sebuah produk dapat menggabungkan keduanya.',
    },
    {
      id: 'm1q2', type: 'choice', lessonId: 'm1l2',
      prompt: 'Pada kerangka PEAS, kamera dan LiDAR pada taksi otonom termasuk bagian apa?',
      options: ['Performance measure', 'Environment', 'Actuators', 'Sensors'],
      answer: 3,
      explanation: 'Kamera dan LiDAR mengumpulkan pengamatan dari lingkungan, sehingga termasuk Sensors.',
    },
    {
      id: 'm1q3', type: 'essay', lessonId: 'm1l2',
      prompt: 'Jelaskan contoh PEAS untuk taksi otonom dengan menyebutkan ukuran keberhasilan, lingkungan, aktuator, dan sensor.',
      rubric: [
        { label: 'Ukuran keberhasilan', keywords: ['performance measure', 'ukuran keberhasilan', 'keselamatan', 'aman'] },
        { label: 'Lingkungan', keywords: ['environment', 'lingkungan', 'jalan raya', 'lalu lintas'] },
        { label: 'Aktuator', keywords: ['actuator', 'aktuator', 'setir', 'rem', 'gas'] },
        { label: 'Sensor', keywords: ['sensor', 'kamera', 'lidar', 'gps'] },
      ],
      sampleAnswer: 'Ukuran keberhasilannya antara lain keselamatan dan kepatuhan lalu lintas. Lingkungannya mencakup jalan raya, kendaraan lain, dan pejalan kaki. Aktuatornya berupa setir, gas, dan rem. Sensornya dapat berupa kamera, LiDAR, dan GPS.',
      explanation: 'PEAS membantu merinci tujuan agen, lingkungan yang dihadapi, tindakan yang dapat dilakukan, serta sumber pengamatannya.',
    },
  ],
  m2: [
    {
      id: 'm2q1', type: 'choice', lessonId: 'm2l1',
      prompt: 'Dalam aturan Prolog, apa arti operator :- ?',
      options: [
        'Memisahkan nama file dari program.',
        'Menyatakan bahwa bagian kiri benar jika kondisi di bagian kanan terpenuhi.',
        'Menandai akhir dari sebuah query.',
        'Menggabungkan dua fakta tanpa syarat.',
      ],
      answer: 1,
      explanation: 'Kepala aturan di sebelah kiri :- dapat dibuktikan jika kondisi pada tubuh aturan di sebelah kanan terpenuhi.',
    },
    {
      id: 'm2q2', type: 'choice', lessonId: 'm2l2',
      prompt: 'Apa fungsi baris query ?- grandparent(andi, citra). ?',
      options: [
        'Menambahkan fakta baru bernama grandparent.',
        'Mendefinisikan variabel global bernama andi.',
        'Meminta Prolog memeriksa apakah relasi grandparent(andi, citra) dapat dibuktikan.',
        'Menghapus semua fakta parent.',
      ],
      answer: 2,
      explanation: 'Tanda ?- mengawali query. Prolog mencari fakta dan aturan yang dapat membuktikan relasi yang diminta.',
    },
    {
      id: 'm2q3', type: 'essay', lessonId: 'm2l2',
      prompt: 'Tuliskan aturan Prolog grandparent(X,Z) berdasarkan dua relasi parent, lalu jelaskan arti kedua kondisi tersebut.',
      rubric: [
        { label: 'Kepala aturan grandparent', keywords: ['grandparent(x,z)', 'kakek(x,z)'] },
        { label: 'Relasi parent pertama', keywords: ['parent(x,y)'] },
        { label: 'Relasi parent kedua', keywords: ['parent(y,z)'] },
      ],
      sampleAnswer: 'grandparent(X, Z) :- parent(X, Y), parent(Y, Z). Aturan ini menyatakan X adalah kakek/nenek Z jika X adalah orang tua Y dan Y adalah orang tua Z.',
      explanation: 'Koma di dalam tubuh aturan berarti kedua kondisi harus terpenuhi. Variabel Y menghubungkan dua relasi parent.',
    },
  ],
  m3: [
    {
      id: 'm3q1', type: 'choice', lessonId: 'm3l2',
      prompt: 'Setelah K tetangga terdekat ditemukan pada KNN klasifikasi, langkah berikutnya adalah ...',
      options: [
        'Menghapus data latih yang tidak terpilih.',
        'Memilih kelas berdasarkan voting mayoritas tetangga.',
        'Menghitung prior setiap kelas seperti Naive Bayes.',
        'Memperbarui bobot jaringan saraf.',
      ],
      answer: 1,
      explanation: 'KNN klasifikasi menentukan kelas melalui voting label dari K tetangga terdekat.',
    },
    {
      id: 'm3q2', type: 'choice', lessonId: 'm3l2',
      prompt: 'Mengapa fitur sering perlu diskalakan sebelum jarak KNN dihitung?',
      options: [
        'Agar jumlah data latih bertambah.',
        'Agar fitur dengan rentang angka besar tidak mendominasi perhitungan jarak.',
        'Agar semua kelas memiliki label yang sama.',
        'Agar KNN tidak memerlukan nilai K.',
      ],
      answer: 1,
      explanation: 'Jarak sensitif terhadap skala. Tanpa penskalaan, fitur dengan rentang besar dapat mendominasi kontribusi fitur lain.',
    },
    {
      id: 'm3q3', type: 'essay', lessonId: 'm3l2',
      prompt: 'Uraikan langkah KNN untuk memprediksi kelas sebuah data baru.',
      rubric: [
        { label: 'Menghitung jarak', keywords: ['hitung jarak', 'menghitung jarak', 'euclidean', 'jarak'] },
        { label: 'Memilih K tetangga', keywords: ['k tetangga', 'tetangga terdekat', 'jarak terkecil'] },
        { label: 'Melakukan voting', keywords: ['voting', 'mayoritas', 'suara terbanyak'] },
        { label: 'Menentukan prediksi', keywords: ['prediksi', 'kelas hasil', 'kelas data'] },
      ],
      sampleAnswer: 'Hitung jarak data baru ke setiap data latih, urutkan jaraknya, lalu pilih K tetangga terdekat. Hitung suara label pada tetangga tersebut dan gunakan kelas dengan suara terbanyak sebagai prediksi.',
      explanation: 'KNN menyimpan data latih, lalu menggunakan kedekatan dan voting tetangga untuk menentukan kelas data baru.',
    },
  ],
  m4: [
    {
      id: 'm4q1', type: 'choice', lessonId: 'm4l1',
      prompt: 'Dalam Naive Bayes, prior P(C) menjelaskan ...',
      options: [
        'Peluang kelas sebelum fitur data uji diamati.',
        'Jarak data uji ke pusat kelas.',
        'Jumlah bobot pada jaringan saraf.',
        'Peluang fitur setelah semua kelas digabung.',
      ],
      answer: 0,
      explanation: 'Prior adalah peluang awal suatu kelas, biasanya dihitung dari proporsi kelas pada data latih.',
    },
    {
      id: 'm4q2', type: 'choice', lessonId: 'm4l1',
      prompt: 'Apa tujuan Laplace smoothing pada Naive Bayes?',
      options: [
        'Menghapus semua fitur yang berkorelasi.',
        'Mencegah likelihood bernilai nol saat kombinasi fitur belum muncul.',
        'Memilih nilai K terbaik.',
        'Mengubah klasifikasi menjadi regresi.',
      ],
      answer: 1,
      explanation: 'Penambahan hitungan kecil pada perhitungan likelihood mencegah satu nilai nol membuat seluruh hasil perkalian menjadi nol.',
    },
    {
      id: 'm4q3', type: 'essay', lessonId: 'm4l1',
      prompt: 'Jelaskan cara Naive Bayes membandingkan kelas untuk menentukan prediksi dan apa arti asumsi “naive”.',
      rubric: [
        { label: 'Menggunakan prior', keywords: ['prior', 'peluang awal'] },
        { label: 'Menghitung likelihood fitur', keywords: ['likelihood', 'peluang fitur'] },
        { label: 'Membandingkan skor posterior', keywords: ['posterior', 'skor tertinggi', 'membandingkan kelas'] },
        { label: 'Asumsi independensi fitur', keywords: ['independen', 'independensi', 'bebas bersyarat'] },
      ],
      sampleAnswer: 'Untuk tiap kelas, Naive Bayes mengalikan prior dengan likelihood fitur-fitur yang diamati, lalu memilih kelas dengan skor posterior tertinggi. Asumsi naive menyatakan fitur dianggap saling independen setelah kelas diketahui.',
      explanation: 'Rumus Bayes menggabungkan peluang awal kelas dan kecocokan fitur. Asumsi independensi menyederhanakan likelihood gabungan.',
    },
  ],
  m5: [
    {
      id: 'm5q1', type: 'choice', lessonId: 'm5l1',
      prompt: 'Pembaruan bobot sederhana dengan gradient descent ditulis sebagai ...',
      options: [
        'w ← w + η · ∂L/∂w',
        'w ← w - η · ∂L/∂w',
        'w ← η / ∂L/∂w',
        'w ← w tanpa menggunakan loss.',
      ],
      answer: 1,
      explanation: 'Bobot digeser berlawanan arah gradien loss dengan besar langkah yang ditentukan learning rate η.',
    },
    {
      id: 'm5q2', type: 'choice', lessonId: 'm5l1',
      prompt: 'Apa dampak yang mungkin terjadi jika learning rate terlalu besar?',
      options: [
        'Pembaruan dapat melompati nilai minimum dan membuat loss tidak stabil.',
        'Model tidak lagi membutuhkan data latih.',
        'Semua gradien otomatis menjadi nol.',
        'Jumlah layer model bertambah.',
      ],
      answer: 0,
      explanation: 'Langkah pembaruan terlalu besar dapat melewati daerah minimum dan menyebabkan loss berosilasi atau meningkat.',
    },
    {
      id: 'm5q3', type: 'essay', lessonId: 'm5l1',
      prompt: 'Jelaskan hubungan forward pass, loss, backpropagation, dan pembaruan bobot pada MLP.',
      rubric: [
        { label: 'Forward pass menghasilkan prediksi', keywords: ['forward', 'prediksi', 'output'] },
        { label: 'Loss mengukur kesalahan', keywords: ['loss', 'error', 'kesalahan'] },
        { label: 'Backpropagation menghitung gradien', keywords: ['backpropagation', 'gradien', 'chain rule'] },
        { label: 'Bobot diperbarui dengan learning rate', keywords: ['bobot', 'learning rate', 'eta', 'pembaruan'] },
      ],
      sampleAnswer: 'Forward pass menghitung prediksi dari input melalui lapisan MLP. Loss mengukur selisih prediksi terhadap target. Backpropagation memakai chain rule untuk menghitung gradien, lalu bobot diperbarui berlawanan arah gradien dengan learning rate.',
      explanation: 'Keempat tahap tersebut membentuk satu iterasi pelatihan: prediksi, pengukuran kesalahan, perhitungan gradien, dan pembaruan parameter.',
    },
  ],
  m6: [
    {
      id: 'm6q1', type: 'choice', lessonId: 'm6l1',
      prompt: 'Mengapa cross-validation berguna saat mengevaluasi model pada dataset terbatas?',
      options: [
        'Menggunakan beberapa pembagian data untuk memperoleh estimasi kinerja yang lebih stabil.',
        'Menjamin akurasi selalu 100%.',
        'Menghilangkan kebutuhan memisahkan data latih dan evaluasi.',
        'Mengubah semua fitur menjadi gambar.',
      ],
      answer: 0,
      explanation: 'Cross-validation mengulang evaluasi pada beberapa fold sehingga estimasi tidak bergantung pada satu pembagian saja.',
    },
    {
      id: 'm6q2', type: 'choice', lessonId: 'm6l2',
      prompt: 'Pada residual block, apa arti y = F(x) + x?',
      options: [
        'Output hanya berasal dari shortcut x.',
        'Transformasi F(x) dijumlahkan dengan input x jika dimensinya sesuai.',
        'F(x) selalu dikalikan dengan jumlah kelas.',
        'Input x dibuang sebelum output dihitung.',
      ],
      answer: 1,
      explanation: 'Residual connection menjumlahkan transformasi dengan shortcut input. Bentuk tensor harus cocok atau shortcut perlu proyeksi.',
    },
    {
      id: 'm6q3', type: 'essay', lessonId: 'm6l2',
      prompt: 'Jelaskan transfer learning dan satu cara mencegah kebocoran data saat mengevaluasi model.',
      rubric: [
        { label: 'Memanfaatkan model pralatih', keywords: ['pralatih', 'pretrained', 'model yang sudah dilatih', 'bobot terlatih'] },
        { label: 'Menyesuaikan model pada tugas baru', keywords: ['dataset target', 'tugas baru', 'fine tuning', 'ekstraktor fitur'] },
        { label: 'Memisahkan data uji', keywords: ['data uji', 'test set', 'data evaluasi'] },
        { label: 'Tidak memakai data uji saat melatih', keywords: ['tidak digunakan saat pelatihan', 'tidak ikut melatih', 'terpisah dari pelatihan'] },
      ],
      sampleAnswer: 'Transfer learning menggunakan model pralatih sebagai ekstraktor fitur atau melakukan fine-tuning pada dataset target. Untuk mencegah kebocoran data, pisahkan data uji dan jangan menggunakannya saat preprocessing yang dipelajari, pemilihan model, atau pelatihan.',
      explanation: 'Model pralatih dapat mengurangi kebutuhan data dan waktu pelatihan. Data uji harus tetap terpisah sampai evaluasi akhir.',
    },
  ],
};

const MODULE_STUDY_TOOLS = {
  m1: {
    type: 'peas', title: 'Perancang PEAS',
    description: 'Petakan sebuah agen cerdas melalui tujuan, lingkungan, tindakan, dan sensor sebelum menilai desainnya.',
    fields: [
      { name: 'task', label: 'Agen atau tugas', placeholder: 'Contoh: taksi otonom' },
      { name: 'performance', label: 'P — ukuran keberhasilan', placeholder: 'Contoh: aman dan patuh aturan' },
      { name: 'environment', label: 'E — lingkungan', placeholder: 'Contoh: jalan raya dan pejalan kaki' },
      { name: 'actuators', label: 'A — aktuator', placeholder: 'Contoh: setir, gas, dan rem' },
      { name: 'sensors', label: 'S — sensor', placeholder: 'Contoh: kamera, LiDAR, GPS' },
    ],
  },
  m2: {
    type: 'prolog', title: 'Pembangun Aturan Prolog',
    description: 'Buat kerangka fakta parent, aturan grandparent, dan query untuk dicoba di SWISH.',
    fields: [
      { name: 'parentOne', label: 'Orang tua pertama', placeholder: 'andi', value: 'andi' },
      { name: 'childOne', label: 'Anak pada fakta pertama', placeholder: 'budi', value: 'budi' },
      { name: 'parentTwo', label: 'Orang tua kedua', placeholder: 'budi', value: 'budi' },
      { name: 'childTwo', label: 'Anak pada fakta kedua', placeholder: 'citra', value: 'citra' },
    ],
  },
  m3: {
    type: 'simulation', title: 'Kalkulator KNN',
    description: 'Ubah titik uji dan nilai K untuk melihat jarak Euclidean, tetangga terdekat, serta voting kelas.',
    simulation: 'knn', buttonLabel: 'Buka kalkulator KNN',
  },
  m4: {
    type: 'simulation', title: 'Kalkulator Naive Bayes',
    description: 'Uji kombinasi fitur dan periksa prior, likelihood dengan Laplace smoothing, serta skor posterior.',
    simulation: 'nb', buttonLabel: 'Buka kalkulator Naive Bayes',
  },
  m5: {
    type: 'simulation', title: 'Penelusur Backpropagation',
    description: 'Ikuti forward pass, loss, gradien, dan pembaruan bobot pada jaringan contoh.',
    simulation: 'bp', buttonLabel: 'Jalankan simulasi Backpropagation',
  },
  m6: {
    type: 'resnet', title: 'Pemeriksa Dimensi Residual',
    description: 'Bandingkan bentuk input shortcut dan keluaran transformasi sebelum keduanya dijumlahkan.',
    fields: [
      { name: 'inputH', label: 'Tinggi input', value: '56' },
      { name: 'inputW', label: 'Lebar input', value: '56' },
      { name: 'inputC', label: 'Kanal input', value: '64' },
      { name: 'outputH', label: 'Tinggi F(x)', value: '56' },
      { name: 'outputW', label: 'Lebar F(x)', value: '56' },
      { name: 'outputC', label: 'Kanal F(x)', value: '64' },
    ],
  },
};

// ---- State Global ----
const State = {
  user: null,           // { email }
  progress: {},         // { moduleId: [lessonId,...] }
  route: 'login',
  currentModule: null,
};

function findModule(id){ return MODULES.find(m => m.id === id); }
function isDone(moduleId, lessonId){ return (State.progress[moduleId] || []).includes(lessonId); }

function moduleProgress(mod){
  const total = mod.lessons.length;
  const done = mod.lessons.filter(l => isDone(mod.id, l.id)).length;
  return { done, total, pct: total ? Math.round((done/total)*100) : 0 };
}
function overallProgress(){
  let total = 0, done = 0;
  MODULES.forEach(m => {
    const p = moduleProgress(m);
    total += p.total; done += p.done;
  });
  return { done, total, pct: total ? Math.round((done/total)*100) : 0 };
}