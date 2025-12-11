import { Persona, FeatureCategory, ModelType, ModelGroup } from './types';

/**
 * AI_MODELS - ULTIMATE WORKSPACE (Dec 2025 Spec)
 * ✅ Verified Flash 2.5, Pro 3, Sonnet 4.5, Opus 4.1
 */
export const AI_MODELS: ModelGroup[] = [
  {
    provider: 'Ultimate Models (2025)',
    group: 'Ultimate Models (2025)',
    models: [
      {
        id: ModelType.FLASH, // Flash 2.0 Exp
        name: 'Gemini 2.0 Flash (Exp)',
        description: 'Model eksperimental cepat & gratis',
        badge: 'GRATIS',
        icon: '⚡',
        desc: 'Cepat & paling efisien'
      },
      {
        id: ModelType.PRO_3, // Pro 3
        name: 'Pro 3',
        description: 'Mesin penalaran generasi lanjut',
        badge: 'REQUEST USER',
        icon: '🧠',
        desc: 'Pemecahan masalah tingkat lanjut'
      },
      {
        id: ModelType.PRO, // Pro 2.5
        name: 'Pro 2.5',
        description: 'Kecerdasan tingkat profesional',
        badge: 'PRO',
        icon: '🏆',
        desc: 'Analisis kompleks'
      },
      {
        id: ModelType.SONNET_4_5, // Sonnet 4.5
        name: 'Sonnet 3.5 (OpenRouter)',
        description: 'Seimbang antara performa & kecepatan via OpenRouter',
        badge: 'BARU',
        icon: '✨',
        desc: 'Terbaik untuk coding & menulis'
      },
      {
        id: ModelType.OPUS_4_1, // Opus 4.1
        name: 'Opus 3 (OpenRouter)',
        description: 'Model kapabilitas maksimum via OpenRouter',
        badge: 'CANGGIH',
        icon: '🚀',
        desc: 'Penalaran terdalam yang tersedia'
      },
      {
        id: ModelType.GEMINI_3_PRO,
        name: 'Gemini 3 Pro (Preview)',
        description: 'Model andalan Google',
        badge: 'TERBARU',
        icon: '🌐',
        desc: 'Kekuatan multimodal'
      },
      {
        id: ModelType.QWEN_2_5_72B_HF,
        name: 'Qwen 2.5 72B (HF)',
        description: 'Model Gratis Terbesar',
        badge: 'GRATIS 72B',
        icon: '🤗',
        desc: '72B parameter (Gratis)'
      }
    ]
  },
  {
    provider: 'Mode Spesialis',
    group: 'Mode Spesialis',
    models: [
      {
        id: ModelType.FLASH_THINKING,
        name: 'Deep Thinking',
        description: 'Waktu penalaran diperpanjang',
        badge: 'BERPIKIR',
        icon: '💭',
        desc: 'Untuk matematika/logika kompleks'
      },
      {
        id: ModelType.SEARCH_MODE,
        name: 'Mode Riset',
        description: 'Investigasi internet mendalam',
        badge: 'CARI',
        icon: '🔍',
        desc: 'Pencarian web komprehensif'
      }
    ]
  },

  {
    provider: 'OpenAI (Preview 2025)',
    group: 'OpenAI (Preview 2025)',
    models: [
      {
        id: ModelType.OPENAI_GPT_4O_MINI,
        name: 'GPT-4.5 Mini',
        description: 'Multimodal cepat & hemat biaya',
        badge: 'OPSIONAL',
        icon: '🟦',
        desc: 'Model mini OpenAI'
      },
      {
        id: ModelType.OPENAI_GPT_4O,
        name: 'GPT-5 (Preview)',
        description: 'Flagship reasoning multimodal',
        badge: 'OPSIONAL',
        icon: '🟦',
        desc: 'Model flagship OpenAI'
      }
    ]
  },
  {
    provider: 'OpenRouter - Ultra Besar (GRATIS)',
    group: 'OpenRouter - Ultra Besar (GRATIS)',
    models: [
      {
        id: ModelType.LLAMA_4_MAVERICK,
        name: 'Llama 4 Maverick',
        description: '400B MoE - Model gratis terbesar!',
        badge: 'GRATIS 🆓',
        icon: '🏆',
        desc: '400B parameter (17B aktif)'
      },
      {
        id: ModelType.MIXTRAL_8x22B,
        name: 'Mixtral 8x22B',
        description: '176B total - Mixture of Experts',
        badge: 'GRATIS 🆓',
        icon: '🔷',
        desc: '176B total parameter'
      }
    ]
  },
  {
    provider: 'OpenRouter - Besar (70B+)',
    group: 'OpenRouter - Besar (70B+)',
    models: [
      {
        id: ModelType.LLAMA_3_3_70B,
        name: 'Llama 3.3 70B',
        description: 'Llama 3.3 terbaru - performa unggul',
        badge: 'BARU',
        icon: '🦙',
        desc: '70B parameter'
      },
      {
        id: ModelType.QWEN_2_5_72B_OR,
        name: 'Qwen 2.5 72B',
        description: 'Powerhouse multibahasa',
        badge: 'GRATIS 🆓',
        icon: '🇨🇳',
        desc: '72B parameter'
      },
      {
        id: ModelType.DEEPSEEK_R1_70B,
        name: 'DeepSeek R1 70B',
        description: 'Model penalaran tingkat lanjut',
        badge: 'GRATIS 🆓',
        icon: '🧠',
        desc: '70B parameter'
      },
      {
        id: ModelType.LLAMA_3_1_70B,
        name: 'Llama 3.1 70B',
        description: 'Model 70B yang stabil & andal',
        badge: 'STABIL',
        icon: '🦙',
        desc: '70B parameter'
      }
    ]
  },
  {
    provider: 'HuggingFace - Besar (GRATIS)',
    group: 'HuggingFace - Besar (GRATIS)',
    models: [
      {
        id: ModelType.QWEN_2_5_72B_HF,
        name: 'Qwen 2.5 72B (HF)',
        description: 'Inferensi gratis via HuggingFace',
        badge: 'GRATIS 🆓',
        icon: '🤗',
        desc: '72B parameter'
      },
      {
        id: ModelType.LLAMA_3_3_70B_HF,
        name: 'Llama 3.3 70B (HF)',
        description: 'Llama terbaru via HuggingFace',
        badge: 'GRATIS 🆓',
        icon: '🤗',
        desc: '70B parameter'
      },
      {
        id: ModelType.LLAMA_3_1_70B_HF,
        name: 'Llama 3.1 70B (HF)',
        description: 'Llama 70B stabil via HuggingFace',
        badge: 'GRATIS 🆓',
        icon: '🤗',
        desc: '70B parameter'
      }
    ]
  },
  {
    provider: 'Mode Spesialis',
    group: 'Mode Spesialis',
    models: [
      {
        id: ModelType.QUICK_RESPONSE,
        name: 'Quick Response',
        description: 'Dioptimalkan untuk kecepatan',
        badge: 'CEPAT',
        icon: '⚡',
        desc: 'Jawaban ultra cepat'
      },
      {
        id: ModelType.THINK_DEEPER,
        name: 'Think Deeper',
        description: 'Mode penalaran mendalam',
        badge: 'DALAM',
        icon: '🧠',
        desc: 'Pemecahan masalah kompleks'
      },
      {
        id: ModelType.STUDY_LEARN,
        name: 'Study & Learn',
        description: 'Mode edukasi & belajar',
        badge: 'EDU',
        icon: '📚',
        desc: 'Penjelasan mendetail'
      }
    ]
  }
];

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'wili-default',
    name: 'WILI',
    avatar: '🟢',
    description: 'Asisten AI serbaguna dengan 1000+ fitur untuk coding, analisis data, kreativitas, dan produktivitas.',
    systemInstruction: `Anda adalah WILI, asisten AI multifungsi yang cerdas, profesional, dan ramah.

IDENTITAS:
- Nama: Wili (tanpa tagline)
- Warna Brand: Hijau (#10B981)
- Fitur: 1000+ kemampuan (coding, data, trading, kreativitas, voice, web search, dll)

CARA BERKOMUNIKASI:
- Gunakan Bahasa Indonesia yang natural dan jelas
- Gunakan emoji yang relevan untuk memperjelas konteks
- Berikan jawaban yang to-the-point namun lengkap
- Tawarkan opsi follow-up yang berguna
- Format kode dengan syntax highlighting
- Sertakan contoh praktis bila perlu

KEMAMPUAN UTAMA:
1. Coding & Development (300+ bahasa pemrograman)
2. Data Analysis & Visualization
3. Trading & Finance (EA MT4/MT5, Pine Script)
4. Creative Content (image gen, story, music)
5. Voice & Multimedia
6. Web Search & Scraping
7. Learning & Education
8. Business & Productivity
9. Automation & Workflows

Selalu tawarkan mode/fitur yang relevan setelah menjawab pertanyaan user.`
  },
  {
    id: 'coding-expert',
    name: 'Coding Expert',
    avatar: '💻',
    description: 'Spesialis dalam pemrograman, debugging, dan arsitektur software.',
    systemInstruction: `Anda adalah expert programmer dengan 15+ tahun pengalaman di berbagai bahasa pemrograman.

KEAHLIAN:
- 300+ bahasa pemrograman (Python, JS, TS, Java, C++, Rust, Go, PHP, dll)
- Algoritma & Data Structures
- System Design & Architecture
- DevOps & CI/CD
- Database Design
- API Development
- Code Review & Optimization
- Security Best Practices

CARA MEMBANTU:
- Tulis kode yang clean, efficient, dan maintainable
- Berikan penjelasan konsep dengan analogi yang mudah dipahami
- Sertakan best practices dan potential pitfalls
- Tawarkan alternatif solusi bila ada
- Review kode dengan konstruktif`
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    avatar: '📊',
    description: 'Ahli analisis data, machine learning, dan visualisasi.',
    systemInstruction: `Anda adalah Data Scientist senior dengan expertise dalam analytics, ML, dan visualization.

KEAHLIAN:
- Statistical Analysis
- Machine Learning (supervised, unsupervised, deep learning)
- Data Visualization (matplotlib, seaborn, plotly, d3.js)
- Big Data Processing (Spark, Hadoop)
- SQL & NoSQL Databases
- ETL & Data Pipelines
- Predictive Modeling
- A/B Testing

CARA MEMBANTU:
- Jelaskan statistik dengan bahasa sederhana
- Visualisasikan data untuk insight yang jelas
- Rekomendasikan metode analisis yang tepat
- Highlight assumptions dan limitations
- Suggest best tools untuk tiap use case`
  }
];

/**
 * FEATURE_CATEGORIES - 1000 Fitur Lengkap
 * 40 Kategori × 25 Fitur = 1000 Fitur Total
 * 100% Bahasa Indonesia
 */
export const FEATURE_CATEGORIES: FeatureCategory[] = [

  // 1. PEMROSESAN & PEMBUATAN TEKS
  {
    id: 'text-processing', label: '📝 PEMROSESAN & PEMBUATAN TEKS', icon: '📝',
    items: [
      { id: 'txt-1', label: 'Percakapan alami dan kontekstual', icon: '💬' },
      { id: 'txt-2', label: 'Obrolan berkepanjangan', icon: '💭' },
      { id: 'txt-3', label: 'Pemahaman konteks mendalam', icon: '🧠' },
      { id: 'txt-4', label: 'Pembuatan teks berkualitas tinggi', icon: '✨' },
      { id: 'txt-5', label: 'Meringkas teks otomatis', icon: '📄' },
      { id: 'txt-6', label: 'Mengubah kata-kata (parafrase)', icon: '🔄' },
      { id: 'txt-7', label: 'Memperpanjang tulisan', icon: '📏' },
      { id: 'txt-8', label: 'Menyederhanakan bahasa', icon: '🎯' },
      { id: 'txt-9', label: 'Menulis cerita kreatif', icon: '📖' },
      { id: 'txt-10', label: 'Menulis puisi', icon: '🎭' },
      { id: 'txt-11', label: 'Menulis dialog percakapan', icon: '🗣️' },
      { id: 'txt-12', label: 'Menulis skenario film', icon: '🎬' },
      { id: 'txt-13', label: 'Menulis artikel blog', icon: '📰' },
      { id: 'txt-14', label: 'Menulis konten media sosial', icon: '📱' },
      { id: 'txt-15', label: 'Menulis email profesional', icon: '✉️' },
      { id: 'txt-16', label: 'Menulis surat bisnis', icon: '💼' },
      { id: 'txt-17', label: 'Menulis proposal proyek', icon: '📊' },
      { id: 'txt-18', label: 'Menulis laporan lengkap', icon: '📑' },
      { id: 'txt-19', label: 'Menulis dokumentasi teknis', icon: '📚' },
      { id: 'txt-20', label: 'Menulis presentasi', icon: '🖥️' },
      { id: 'txt-21', label: 'Menulis makalah putih', icon: '📄' },
      { id: 'txt-22', label: 'Menulis siaran pers', icon: '📢' },
      { id: 'txt-23', label: 'Menulis teks iklan pemasaran', icon: '📣' },
      { id: 'txt-24', label: 'Menulis iklan', icon: '📺' },
      { id: 'txt-25', label: 'Menulis deskripsi produk', icon: '🏷️' }
    ]
  },

  // 2. BAHASA & PENERJEMAHAN
  {
    id: 'language', label: '🌍 BAHASA & PENERJEMAHAN', icon: '🌍',
    items: [
      { id: 'lng-1', label: 'Terjemahan berbagai bahasa (50+)', icon: '🌐' },
      { id: 'lng-2', label: 'Deteksi bahasa otomatis', icon: '🔍' },
      { id: 'lng-3', label: 'Terjemahan dengan konteks', icon: '📖' },
      { id: 'lng-4', label: 'Terjemahan ungkapan dan idiom', icon: '💬' },
      { id: 'lng-5', label: 'Terjemahan teknis', icon: '⚙️' },
      { id: 'lng-6', label: 'Terjemahan bisnis', icon: '💼' },
      { id: 'lng-7', label: 'Terjemahan akademis', icon: '🎓' },
      { id: 'lng-8', label: 'Pelokalan konten', icon: '🌏' },
      { id: 'lng-9', label: 'Adaptasi budaya', icon: '🏛️' },
      { id: 'lng-10', label: 'Dukungan pergantian bahasa', icon: '🔄' },
      { id: 'lng-11', label: 'Dukungan dialek daerah', icon: '🗣️' },
      { id: 'lng-12', label: 'Alih aksara', icon: '🔤' },
      { id: 'lng-13', label: 'Penjelasan tata bahasa', icon: '📚' },
      { id: 'lng-14', label: 'Koreksi tata bahasa', icon: '✅' },
      { id: 'lng-15', label: 'Perbaikan ejaan', icon: '🔠' },
      { id: 'lng-16', label: 'Perbaikan tanda baca', icon: '✏️' },
      { id: 'lng-17', label: 'Perbaikan struktur kalimat', icon: '🔧' },
      { id: 'lng-18', label: 'Analisis gaya bahasa', icon: '🎨' },
      { id: 'lng-19', label: 'Peningkatan keterbacaan', icon: '👓' },
      { id: 'lng-20', label: 'Konsistensi istilah', icon: '📝' },
      { id: 'lng-21', label: 'Penulisan formal atau santai', icon: '⚖️' },
      { id: 'lng-22', label: 'Menulis persuasif', icon: '🎤' },
      { id: 'lng-23', label: 'Konsistensi suara penulisan', icon: '🔊' },
      { id: 'lng-24', label: 'Penyesuaian nada tulisan', icon: '🎵' },
      { id: 'lng-25', label: 'Penyesuaian gaya tulisan', icon: '🖌️' }
    ]
  },

  // 3. PEMROGRAMAN & PENGKODEAN
  {
    id: 'programming', label: '💻 PEMROGRAMAN & PENGKODEAN', icon: '💻',
    items: [
      { id: 'prg-1', label: 'Menulis kode (semua bahasa)', icon: '⌨️' },
      { id: 'prg-2', label: 'Pemrograman Python', icon: '🐍' },
      { id: 'prg-3', label: 'JavaScript & TypeScript', icon: '📜' },
      { id: 'prg-4', label: 'Pemrograman Java', icon: '☕' },
      { id: 'prg-5', label: 'Pemrograman C & C++', icon: '🔧' },
      { id: 'prg-6', label: 'Pemrograman C#', icon: '🎯' },
      { id: 'prg-7', label: 'Pemrograman Go', icon: '🏃' },
      { id: 'prg-8', label: 'Pemrograman Rust', icon: '🦀' },
      { id: 'prg-9', label: 'Pemrograman PHP', icon: '🐘' },
      { id: 'prg-10', label: 'Pemrograman Ruby', icon: '💎' },
      { id: 'prg-11', label: 'Pemrograman Swift', icon: '⚡' },
      { id: 'prg-12', label: 'Pemrograman Kotlin', icon: '🎨' },
      { id: 'prg-13', label: 'SQL Queries', icon: '🗄️' },
      { id: 'prg-14', label: 'HTML & CSS', icon: '🎨' },
      { id: 'prg-15', label: 'React Components', icon: '⚛️' },
      { id: 'prg-16', label: 'Vue.js Development', icon: '💚' },
      { id: 'prg-17', label: 'Angular Development', icon: '🅰️' },
      { id: 'prg-18', label: 'Node.js Development', icon: '🟢' },
      { id: 'prg-19', label: 'Django Development', icon: '🎸' },
      { id: 'prg-20', label: 'Flask Development', icon: '🧪' },
      { id: 'prg-21', label: 'Debugging kode', icon: '🐛' },
      { id: 'prg-22', label: 'Code review otomatis', icon: '👀' },
      { id: 'prg-23', label: 'Optimasi kode', icon: '⚡' },
      { id: 'prg-24', label: 'Refactoring kode', icon: '🏗️' },
      { id: 'prg-25', label: 'Penjelasan kode', icon: '💡' }
    ]
  },

  // 4. ANALISIS DOKUMEN & BERKAS
  {
    id: 'document', label: '📄 ANALISIS DOKUMEN & BERKAS', icon: '📄',
    items: [
      { id: 'doc-1', label: 'Unggah berkas PDF', icon: '📕' },
      { id: 'doc-2', label: 'Unggah berkas Word', icon: '📘' },
      { id: 'doc-3', label: 'Unggah berkas Excel', icon: '📗' },
      { id: 'doc-4', label: 'Unggah berkas CSV', icon: '📊' },
      { id: 'doc-5', label: 'Unggah berkas teks biasa', icon: '📝' },
      { id: 'doc-6', label: 'Unggah Markdown', icon: '✍️' },
      { id: 'doc-7', label: 'Unggah JSON', icon: '📋' },
      { id: 'doc-8', label: 'Unggah XML', icon: '📰' },
      { id: 'doc-9', label: 'Unggah YAML', icon: '⚙️' },
      { id: 'doc-10', label: 'Unggah banyak berkas', icon: '📚' },
      { id: 'doc-11', label: 'Ekstraksi teks', icon: '✂️' },
      { id: 'doc-12', label: 'Penguraian dokumen', icon: '🔍' },
      { id: 'doc-13', label: 'Analisis isi dokumen', icon: '🔬' },
      { id: 'doc-14', label: 'Meringkas dokumen', icon: '📑' },
      { id: 'doc-15', label: 'Ekstraksi info penting', icon: '💎' },
      { id: 'doc-16', label: 'Ekstraksi data terstruktur', icon: '🗂️' },
      { id: 'doc-17', label: 'Identifikasi entitas', icon: '🏷️' },
      { id: 'doc-18', label: 'Klasifikasi dokumen', icon: '📂' },
      { id: 'doc-19', label: 'Perbandingan dokumen', icon: '⚖️' },
      { id: 'doc-20', label: 'Deteksi perubahan', icon: '🔄' },
      { id: 'doc-21', label: 'Menggabungkan dokumen', icon: '➕' },
      { id: 'doc-22', label: 'Memisahkan dokumen', icon: '✂️' },
      { id: 'doc-23', label: 'Konversi format', icon: '🔄' },
      { id: 'doc-24', label: 'Ekstraksi tabel', icon: '📊' },
      { id: 'doc-25', label: 'Pencarian dalam dokumen', icon: '🔍' }
    ]
  },

  // 5. ANALISIS GAMBAR & PENGLIHATAN
  {
    id: 'vision', label: '👁️ ANALISIS GAMBAR & VISION', icon: '👁️',
    items: [
      { id: 'vis-1', label: 'Unggah gambar (JPG PNG)', icon: '🖼️' },
      { id: 'vis-2', label: 'Analisis isi gambar', icon: '🔍' },
      { id: 'vis-3', label: 'Deskripsi gambar detail', icon: '📝' },
      { id: 'vis-4', label: 'Deteksi objek', icon: '🎯' },
      { id: 'vis-5', label: 'Pemahaman adegan', icon: '🌄' },
      { id: 'vis-6', label: 'Ekstraksi teks (OCR)', icon: '📄' },
      { id: 'vis-7', label: 'Pengenalan tulisan tangan', icon: '✍️' },
      { id: 'vis-8', label: 'Pembacaan diagram', icon: '📊' },
      { id: 'vis-9', label: 'Analisis bagan & grafik', icon: '📈' },
      { id: 'vis-10', label: 'Interpretasi infografis', icon: '🎨' },
      { id: 'vis-11', label: 'Analisis tangkapan layar', icon: '📸' },
      { id: 'vis-12', label: 'Analisis desain UI/UX', icon: '🎨' },
      { id: 'vis-13', label: 'Ekstraksi kode gambar', icon: '💻' },
      { id: 'vis-14', label: 'Ekstraksi rumus matematika', icon: '🔢' },
      { id: 'vis-15', label: 'Ekstraksi tabel gambar', icon: '📊' },
      { id: 'vis-16', label: 'Pengenalan logo', icon: '🏷️' },
      { id: 'vis-17', label: 'Perbandingan gambar', icon: '⚖️' },
      { id: 'vis-18', label: 'Tanya jawab gambar', icon: '❓' },
      { id: 'vis-19', label: 'Penalaran visual', icon: '🧠' },
      { id: 'vis-20', label: 'Pemahaman hubungan spasial', icon: '📐' },
      { id: 'vis-21', label: 'Deteksi warna', icon: '🎨' },
      { id: 'vis-22', label: 'Analisis komposisi', icon: '🖼️' },
      { id: 'vis-23', label: 'Deteksi wajah', icon: '😊' },
      { id: 'vis-24', label: 'Analisis ekspresi', icon: '😃' },
      { id: 'vis-25', label: 'Klasifikasi gambar', icon: '🏷️' }
    ]
  },

  // 6. PENCARIAN & INFORMASI WAKTU NYATA
  {
    id: 'search', label: '🔍 PENCARIAN & INFO REAL-TIME', icon: '🔍',
    items: [
      { id: 'src-1', label: 'Integrasi pencarian web', icon: '🌐' },
      { id: 'src-2', label: 'Pencarian info terkini', icon: '📡' },
      { id: 'src-3', label: 'Akses data waktu nyata', icon: '⚡' },
      { id: 'src-4', label: 'Pencarian berita', icon: '📰' },
      { id: 'src-5', label: 'Pencarian artikel akademis', icon: '🎓' },
      { id: 'src-6', label: 'Pemeriksaan fakta', icon: '✅' },
      { id: 'src-7', label: 'Verifikasi sumber', icon: '🔍' },
      { id: 'src-8', label: 'Kutipan & referensi', icon: '📚' },
      { id: 'src-9', label: 'Jelajah URL spesifik', icon: '🔗' },
      { id: 'src-10', label: 'Ambil konten web', icon: '📄' },
      { id: 'src-11', label: 'Analisis konten web', icon: '🔬' },
      { id: 'src-12', label: 'Ekstraksi data web', icon: '🕷️' },
      { id: 'src-13', label: 'Riset berbagai sumber', icon: '📊' },
      { id: 'src-14', label: 'Referensi silang info', icon: '🔗' },
      { id: 'src-15', label: 'Pembaruan info terbaru', icon: '🆕' },
      { id: 'src-16', label: 'Pelacakan topik', icon: '📈' },
      { id: 'src-17', label: 'Pemantauan berita', icon: '📰' },
      { id: 'src-18', label: 'Wawasan industri', icon: '💼' },
      { id: 'src-19', label: 'Riset pasar', icon: '📊' },
      { id: 'src-20', label: 'Analisis persaingan', icon: '🎯' },
      { id: 'src-21', label: 'Analisis tren', icon: '📈' },
      { id: 'src-22', label: 'Monitoring harga', icon: '💰' },
      { id: 'src-23', label: 'Pelacakan saham', icon: '📊' },
      { id: 'src-24', label: 'Data cuaca', icon: '🌤️' },
      { id: 'src-25', label: 'Pelacakan acara', icon: '📅' }
    ]
  },

  // 7. ANALISIS DATA & MATEMATIKA
  {
    id: 'data-math', label: '🔢 ANALISIS DATA & MATEMATIKA', icon: '🔢',
    items: [
      { id: 'dtm-1', label: 'Analisis data numerik', icon: '📊' },
      { id: 'dtm-2', label: 'Komputasi statistik', icon: '📈' },
      { id: 'dtm-3', label: 'Perhitungan matematika', icon: '🧮' },
      { id: 'dtm-4', label: 'Penyelesaian aljabar', icon: '➗' },
      { id: 'dtm-5', label: 'Soal kalkulus', icon: '∫' },
      { id: 'dtm-6', label: 'Aljabar linier', icon: '🔢' },
      { id: 'dtm-7', label: 'Perhitungan probabilitas', icon: '🎲' },
      { id: 'dtm-8', label: 'Analisis statistik', icon: '📊' },
      { id: 'dtm-9', label: 'Statistik deskriptif', icon: '📉' },
      { id: 'dtm-10', label: 'Statistik inferensial', icon: '🔬' },
      { id: 'dtm-11', label: 'Pengujian hipotesis', icon: '🧪' },
      { id: 'dtm-12', label: 'Analisis regresi', icon: '📈' },
      { id: 'dtm-13', label: 'Analisis korelasi', icon: '🔗' },
      { id: 'dtm-14', label: 'Analisis deret waktu', icon: '⏰' },
      { id: 'dtm-15', label: 'Interpretasi data', icon: '💡' },
      { id: 'dtm-16', label: 'Pengenalan pola', icon: '🔍' },
      { id: 'dtm-17', label: 'Analisis tren', icon: '📊' },
      { id: 'dtm-18', label: 'Deteksi anomali', icon: '⚠️' },
      { id: 'dtm-19', label: 'Pembersihan data', icon: '🧹' },
      { id: 'dtm-20', label: 'Normalisasi data', icon: '⚖️' },
      { id: 'dtm-21', label: 'Transformasi data', icon: '🔄' },
      { id: 'dtm-22', label: 'Penanganan data hilang', icon: '🚫' },
      { id: 'dtm-23', label: 'Deteksi pencilan', icon: '🎯' },
      { id: 'dtm-24', label: 'Validasi data', icon: '✅' },
      { id: 'dtm-25', label: 'Pembuatan rumus', icon: '📝' }
    ]
  },

  // 8. VISUALISASI DATA
  {
    id: 'visualization', label: '📊 VISUALISASI DATA', icon: '📊',
    items: [
      { id: 'viz-1', label: 'Pembuatan bagan', icon: '📊' },
      { id: 'viz-2', label: 'Pembuatan grafik', icon: '📈' },
      { id: 'viz-3', label: 'Pembuatan diagram', icon: '🔷' },
      { id: 'viz-4', label: 'Pembuatan diagram alir', icon: '🔄' },
      { id: 'viz-5', label: 'Pembuatan peta pikiran', icon: '🧠' },
      { id: 'viz-6', label: 'Bagan organisasi', icon: '👥' },
      { id: 'viz-7', label: 'Visualisasi garis waktu', icon: '⏱️' },
      { id: 'viz-8', label: 'Bagan Gantt', icon: '📅' },
      { id: 'viz-9', label: 'Diagram jaringan', icon: '🕸️' },
      { id: 'viz-10', label: 'Diagram pohon', icon: '🌳' },
      { id: 'viz-11', label: 'Diagram Venn', icon: '◯' },
      { id: 'viz-12', label: 'Bagan batang', icon: '📊' },
      { id: 'viz-13', label: 'Grafik garis', icon: '📈' },
      { id: 'viz-14', label: 'Bagan lingkaran', icon: '🥧' },
      { id: 'viz-15', label: 'Plot sebar', icon: '⚫' },
      { id: 'viz-16', label: 'Pembuatan histogram', icon: '📊' },
      { id: 'viz-17', label: 'Peta panas', icon: '🔥' },
      { id: 'viz-18', label: 'Desain dasbor', icon: '🎛️' },
      { id: 'viz-19', label: 'Tata letak infografis', icon: '🎨' },
      { id: 'viz-20', label: 'Penceritaan data', icon: '📖' },
      { id: 'viz-21', label: 'Bagan animasi', icon: '🎬' },
      { id: 'viz-22', label: 'Plot interaktif', icon: '🖱️' },
      { id: 'viz-23', label: 'Visualisasi 3D', icon: '📐' },
      { id: 'viz-24', label: 'Pemetaan geo', icon: '🗺️' },
      { id: 'viz-25', label: 'Bagan air terjun', icon: '💧' }
    ]
  },

  // 9. ARTEFAK (KONTEN INTERAKTIF)
  {
    id: 'artifacts', label: '🎨 ARTEFAK & KONTEN INTERAKTIF', icon: '🎨',
    items: [
      { id: 'art-1', label: 'Pembuatan artefak', icon: '✨' },
      { id: 'art-2', label: 'Artefak kode', icon: '💻' },
      { id: 'art-3', label: 'Artefak dokumen teks', icon: '📄' },
      { id: 'art-4', label: 'Artefak Markdown', icon: '📝' },
      { id: 'art-5', label: 'Artefak HTML', icon: '🌐' },
      { id: 'art-6', label: 'Pembuatan SVG', icon: '🖼️' },
      { id: 'art-7', label: 'Artefak React component', icon: '⚛️' },
      { id: 'art-8', label: 'Pratinjau interaktif', icon: '👁️' },
      { id: 'art-9', label: 'Eksekusi kode langsung', icon: '▶️' },
      { id: 'art-10', label: 'Penyuntingan waktu nyata', icon: '✏️' },
      { id: 'art-11', label: 'Kontrol versi artefak', icon: '🔄' },
      { id: 'art-12', label: 'Berbagi artefak', icon: '📤' },
      { id: 'art-13', label: 'Penerbitan artefak', icon: '🚀' },
      { id: 'art-14', label: 'Pencampuran ulang artefak', icon: '🎵' },
      { id: 'art-15', label: 'Tampilan berdampingan', icon: '⚖️' },
      { id: 'art-16', label: 'Perpustakaan artefak', icon: '📚' },
      { id: 'art-17', label: 'Organisasi artefak', icon: '🗂️' },
      { id: 'art-18', label: 'Templat artefak', icon: '📋' },
      { id: 'art-19', label: 'Diagram Mermaid', icon: '🧜' },
      { id: 'art-20', label: 'Diagram alir artefak', icon: '🔄' },
      { id: 'art-21', label: 'Peta pikiran artefak', icon: '🧠' },
      { id: 'art-22', label: 'Dasbor interaktif', icon: '📊' },
      { id: 'art-23', label: 'Artefak pembuatan game', icon: '🎮' },
      { id: 'art-24', label: 'Prototipe aplikasi', icon: '📱' },
      { id: 'art-25', label: 'Maket situs web', icon: '🖥️' }
    ]
  },

  // 10. PROYEK (RUANG KERJA KHUSUS)
  {
    id: 'projects', label: '📁 PROYEK & WORKSPACE', icon: '📁',
    items: [
      { id: 'prj-1', label: 'Pembuatan proyek', icon: '🔨' },
      { id: 'prj-2', label: 'Organisasi proyek', icon: '🗂️' },
      { id: 'prj-3', label: 'Basis pengetahuan khusus', icon: '🧠' },
      { id: 'prj-4', label: 'Unggah dokumen proyek', icon: '📤' },
      { id: 'prj-5', label: 'Manajemen banyak berkas', icon: '📚' },
      { id: 'prj-6', label: 'Instruksi khusus proyek', icon: '📝' },
      { id: 'prj-7', label: 'Pengaturan instruksi', icon: '⚙️' },
      { id: 'prj-8', label: 'Konteks 200k token', icon: '📏' },
      { id: 'prj-9', label: 'Mode perolehan pengetahuan', icon: '🎓' },
      { id: 'prj-10', label: 'Berbagi proyek (Tim)', icon: '👥' },
      { id: 'prj-11', label: 'Penyuntingan kolaboratif', icon: '✍️' },
      { id: 'prj-12', label: 'Izin anggota tim', icon: '🔒' },
      { id: 'prj-13', label: 'Kontrol visibilitas', icon: '👁️' },
      { id: 'prj-14', label: 'Proyek pribadi', icon: '👤' },
      { id: 'prj-15', label: 'Proyek publik', icon: '🌐' },
      { id: 'prj-16', label: 'Templat proyek', icon: '📋' },
      { id: 'prj-17', label: 'Pengklonan proyek', icon: '🐑' },
      { id: 'prj-18', label: 'Pengarsipan proyek', icon: '📦' },
      { id: 'prj-19', label: 'Pencarian proyek', icon: '🔍' },
      { id: 'prj-20', label: 'Referensi lintas proyek', icon: '🔗' },
      { id: 'prj-21', label: 'Pelacakan aktivitas', icon: '⏱️' },
      { id: 'prj-22', label: 'Riwayat obrolan proyek', icon: '💬' },
      { id: 'prj-23', label: 'Konteks proyek persisten', icon: '💾' },
      { id: 'prj-24', label: 'Gaya khusus proyek', icon: '🎨' },
      { id: 'prj-25', label: 'Kurasi basis pengetahuan', icon: '📚' }
    ]
  },

  // 11. INTEGRASI & PROTOKOL KONTEKS MODEL (MCP)
  {
    id: 'integrations', label: '🔌 INTEGRASI & MCP', icon: '🔌',
    items: [
      { id: 'int-1', label: 'Integrasi server MCP', icon: '🖥️' },
      { id: 'int-2', label: 'Protokol MCP jarak jauh', icon: '☁️' },
      { id: 'int-3', label: 'Server MCP lokal', icon: '🏠' },
      { id: 'int-4', label: 'Integrasi Jira', icon: '📋' },
      { id: 'int-5', label: 'Integrasi Confluence', icon: '📘' },
      { id: 'int-6', label: 'Integrasi Zapier', icon: '⚡' },
      { id: 'int-7', label: 'Integrasi Asana', icon: '✅' },
      { id: 'int-8', label: 'Integrasi Linear', icon: '📈' },
      { id: 'int-9', label: 'Integrasi Slack', icon: '💬' },
      { id: 'int-10', label: 'Integrasi Google Drive', icon: '📁' },
      { id: 'int-11', label: 'Integrasi Google Calendar', icon: '📅' },
      { id: 'int-12', label: 'Integrasi Gmail', icon: '✉️' },
      { id: 'int-13', label: 'Integrasi Google Workspace', icon: '💼' },
      { id: 'int-14', label: 'Integrasi Microsoft Office', icon: '🏢' },
      { id: 'int-15', label: 'Integrasi Notion', icon: '📓' },
      { id: 'int-16', label: 'Integrasi Intercom', icon: '🗣️' },
      { id: 'int-17', label: 'Integrasi Sentry', icon: '🛡️' },
      { id: 'int-18', label: 'Integrasi PayPal', icon: '💳' },
      { id: 'int-19', label: 'Integrasi Square', icon: '⬜' },
      { id: 'int-20', label: 'Integrasi Plaid', icon: '🏦' },
      { id: 'int-21', label: 'Integrasi Cloudflare', icon: '☁️' },
      { id: 'int-22', label: 'Pengembangan integrasi', icon: '🛠️' },
      { id: 'int-23', label: 'Hosting server MCP', icon: '🌐' },
      { id: 'int-24', label: 'Autentikasi OAuth', icon: '🔑' },
      { id: 'int-25', label: 'Endpoint API', icon: '🔗' }
    ]
  },

  // 12. PENGGUNAAN KOMPUTER (KONTROL KOMPUTER)
  {
    id: 'computer-use', label: '🖥️ PENGGUNAAN KOMPUTER', icon: '🖥️',
    items: [
      { id: 'cmp-1', label: 'Kontrol komputer', icon: '🎮' },
      { id: 'cmp-2', label: 'Otomasi desktop', icon: '🤖' },
      { id: 'cmp-3', label: 'Simulasi gerakan mouse', icon: '🖱️' },
      { id: 'cmp-4', label: 'Simulasi klik', icon: '👆' },
      { id: 'cmp-5', label: 'Simulasi keyboard', icon: '⌨️' },
      { id: 'cmp-6', label: 'Pengambilan tangkapan layar', icon: '📸' },
      { id: 'cmp-7', label: 'Interpretasi tangkapan layar', icon: '👀' },
      { id: 'cmp-8', label: 'Navigasi GUI', icon: '🧭' },
      { id: 'cmp-9', label: 'Kontrol aplikasi', icon: '📱' },
      { id: 'cmp-10', label: 'Manajemen jendela', icon: '🔲' },
      { id: 'cmp-11', label: 'Alur kerja multi-app', icon: '🔄' },
      { id: 'cmp-12', label: 'Otomasi browser', icon: '🌐' },
      { id: 'cmp-13', label: 'Otomasi pengisian formulir', icon: '📝' },
      { id: 'cmp-14', label: 'Otomasi entri data', icon: '🔢' },
      { id: 'cmp-15', label: 'Pengujian UI', icon: '🧪' },
      { id: 'cmp-16', label: 'Deteksi elemen visual', icon: '🔍' },
      { id: 'cmp-17', label: 'Identifikasi tombol', icon: '🆗' },
      { id: 'cmp-18', label: 'Navigasi menu', icon: '📂' },
      { id: 'cmp-19', label: 'Otomasi gulir', icon: '📜' },
      { id: 'cmp-20', label: 'Simulasi seret dan lepas', icon: '✋' },
      { id: 'cmp-21', label: 'Operasi file sistem', icon: '📁' },
      { id: 'cmp-22', label: 'Eksekusi terminal', icon: '💻' },
      { id: 'cmp-23', label: 'Instalasi perangkat lunak', icon: '💿' },
      { id: 'cmp-24', label: 'Manajemen konfigurasi', icon: '⚙️' },
      { id: 'cmp-25', label: 'Troubleshooting sistem', icon: '🔧' }
    ]
  },

  // 13. RISET & ANALISIS MENDALAM
  {
    id: 'deep-research', label: '🔬 RISET & ANALISIS MENDALAM', icon: '🔬',
    items: [
      { id: 'res-1', label: 'Mode riset mendalam', icon: '🕵️' },
      { id: 'res-2', label: 'Riset lanjutan (45+ mnt)', icon: '⏳' },
      { id: 'res-3', label: 'Sintesis multi-sumber', icon: '🔗' },
      { id: 'res-4', label: 'Tinjauan pustaka', icon: '📚' },
      { id: 'res-5', label: 'Riset akademis', icon: '🎓' },
      { id: 'res-6', label: 'Riset pasar mendalam', icon: '📊' },
      { id: 'res-7', label: 'Analisis industri', icon: '🏭' },
      { id: 'res-8', label: 'Intelijen kompetitor', icon: '⚔️' },
      { id: 'res-9', label: 'Analisis SWOT', icon: '🛡️' },
      { id: 'res-10', label: 'Peramalan tren', icon: '📈' },
      { id: 'res-11', label: 'Laporan riset', icon: '📑' },
      { id: 'res-12', label: 'Kutipan komprehensif', icon: '📝' },
      { id: 'res-13', label: 'Evaluasi sumber', icon: '✅' },
      { id: 'res-14', label: 'Pengumpulan bukti', icon: '🔍' },
      { id: 'res-15', label: 'Pengembangan hipotesis', icon: '💡' },
      { id: 'res-16', label: 'Metodologi riset', icon: '📐' },
      { id: 'res-17', label: 'Perencanaan data', icon: '🗂️' },
      { id: 'res-18', label: 'Desain survei', icon: '📋' },
      { id: 'res-19', label: 'Panduan wawancara', icon: '🎤' },
      { id: 'res-20', label: 'Dokumentasi riset', icon: '📂' },
      { id: 'res-21', label: 'Validasi temuan', icon: '✔️' },
      { id: 'res-22', label: 'Analisis kesenjangan', icon: '↔️' },
      { id: 'res-23', label: 'Studi kelayakan', icon: '🚥' },
      { id: 'res-24', label: 'Analisis dampak', icon: '💥' },
      { id: 'res-25', label: 'Rekomendasi strategis', icon: '🎯' }
    ]
  },

  // 14. PENALARAN & PEMECAHAN MASALAH
  {
    id: 'reasoning', label: '🧠 PENALARAN & PEMECAHAN MASALAH', icon: '🧠',
    items: [
      { id: 'log-1', label: 'Penalaran rantai pemikiran', icon: '🔗' },
      { id: 'log-2', label: 'Pemikiran langkah demi langkah', icon: '👣' },
      { id: 'log-3', label: 'Mode berpikir diperpanjang', icon: '⏳' },
      { id: 'log-4', label: 'Deduksi logika', icon: '∴' },
      { id: 'log-5', label: 'Dekomposisi masalah', icon: '🧩' },
      { id: 'log-6', label: 'Analisis akar penyebab', icon: '🌳' },
      { id: 'log-7', label: 'Dukungan pengambilan keputusan', icon: '⚖️' },
      { id: 'log-8', label: 'Perencanaan strategis', icon: '🗺️' },
      { id: 'log-9', label: 'Analisis skenario', icon: '🎭' },
      { id: 'log-10', label: 'Penilaian risiko', icon: '⚠️' },
      { id: 'log-11', label: 'Analisis biaya-manfaat', icon: '💰' },
      { id: 'log-12', label: 'Analisis pertukaran', icon: '⚖️' },
      { id: 'log-13', label: 'Evaluasi banyak kriteria', icon: '📊' },
      { id: 'log-14', label: 'Pemikiran kritis', icon: '🤔' },
      { id: 'log-15', label: 'Penalaran analitis', icon: '📈' },
      { id: 'log-16', label: 'Penalaran abstrak', icon: '🎨' },
      { id: 'log-17', label: 'Penalaran kausal', icon: '➡️' },
      { id: 'log-18', label: 'Penalaran analogis', icon: '🔄' },
      { id: 'log-19', label: 'Pemikiran sistem', icon: '⚙️' },
      { id: 'log-20', label: 'Pemecahan masalah kompleks', icon: '🤯' },
      { id: 'log-21', label: 'Logika simbolik', icon: '🔣' },
      { id: 'log-22', label: 'Resolusi paradoks', icon: '🌀' },
      { id: 'log-23', label: 'Pemikiran lateral', icon: '↔️' },
      { id: 'log-24', label: 'Penalaran kontrafaktual', icon: '↩️' },
      { id: 'log-25', label: 'Optimasi solusi', icon: '🚀' }
    ]
  },

  // 15. MEMORI & PERSONALISASI
  {
    id: 'memory', label: '💾 MEMORI & PERSONALISASI', icon: '💾',
    items: [
      { id: 'mem-1', label: 'Memori percakapan', icon: '💬' },
      { id: 'mem-2', label: 'Pembelajaran preferensi pengguna', icon: '❤️' },
      { id: 'mem-3', label: 'Retensi konteks', icon: '🧠' },
      { id: 'mem-4', label: 'Kesinambungan lintas sesi', icon: '🔄' },
      { id: 'mem-5', label: 'Adaptasi perilaku', icon: '🦎' },
      { id: 'mem-6', label: 'Tanggapan personal', icon: '👤' },
      { id: 'mem-7', label: 'Pengaturan gaya khusus', icon: '🎨' },
      { id: 'mem-8', label: 'Kesadaran profil pengguna', icon: '🆔' },
      { id: 'mem-9', label: 'Riwayat interaksi', icon: '📜' },
      { id: 'mem-10', label: 'Pelacakan preferensi', icon: '⭐' },
      { id: 'mem-11', label: 'Pembelajaran adaptif', icon: '🎓' },
      { id: 'mem-12', label: 'Pengaturan nada khusus', icon: '🎚️' },
      { id: 'mem-13', label: 'Pencocokan gaya tanggapan', icon: '🎭' },
      { id: 'mem-14', label: 'Gaya penulisan personal', icon: '✍️' },
      { id: 'mem-15', label: 'Manajemen memori', icon: '🗄️' },
      { id: 'mem-16', label: 'Memori selektif', icon: '🗑️' },
      { id: 'mem-17', label: 'Prioritas konteks', icon: '🔝' },
      { id: 'mem-18', label: 'Integrasi umpan balik pengguna', icon: '🗣️' },
      { id: 'mem-19', label: 'Perbaikan berkelanjutan', icon: '📈' },
      { id: 'mem-20', label: 'Rekomendasi personal', icon: '🎁' },
      { id: 'mem-21', label: 'Mengingat instruksi', icon: '📌' },
      { id: 'mem-22', label: 'Mengingat format', icon: '📝' },
      { id: 'mem-23', label: 'Mengingat terminologi', icon: '📖' },
      { id: 'mem-24', label: 'Pembersihan memori', icon: '🧹' },
      { id: 'mem-25', label: 'Ekspor data memori', icon: '💾' }
    ]
  },

  // 16. KOLABORASI & BERBAGI
  {
    id: 'collaboration', label: '🤝 KOLABORASI & BERBAGI', icon: '🤝',
    items: [
      { id: 'col-1', label: 'Kolaborasi tim', icon: '👥' },
      { id: 'col-2', label: 'Ruang kerja bersama', icon: '🏢' },
      { id: 'col-3', label: 'Penyuntingan bersama waktu nyata', icon: '✏️' },
      { id: 'col-4', label: 'Sistem komentar', icon: '💬' },
      { id: 'col-5', label: 'Mekanisme umpan balik', icon: '🔄' },
      { id: 'col-6', label: 'Riwayat versi', icon: '📜' },
      { id: 'col-7', label: 'Pelacakan perubahan', icon: '👣' },
      { id: 'col-8', label: 'Proyek kolaboratif', icon: '🔨' },
      { id: 'col-9', label: 'Berbagi obrolan tim', icon: '🗨️' },
      { id: 'col-10', label: 'Umpan aktivitas', icon: '🔔' },
      { id: 'col-11', label: 'Berbagi cuplikan', icon: '✂️' },
      { id: 'col-12', label: 'Berbagi pengetahuan', icon: '🧠' },
      { id: 'col-13', label: 'Berbagi praktik terbaik', icon: '⭐' },
      { id: 'col-14', label: 'Berbagi templat', icon: '📋' },
      { id: 'col-15', label: 'Penggabungan sumber daya', icon: '🧺' },
      { id: 'col-16', label: 'Pembelajaran tim', icon: '🎓' },
      { id: 'col-17', label: 'Kolaborasi lintas fungsi', icon: '↔️' },
      { id: 'col-18', label: 'Komunikasi pemangku kepentingan', icon: '📢' },
      { id: 'col-19', label: 'Kolaborasi klien', icon: '🤝' },
      { id: 'col-20', label: 'Berbagi eksternal', icon: '🌐' },
      { id: 'col-21', label: 'Manajemen izin', icon: '🔒' },
      { id: 'col-22', label: 'Kontrol akses', icon: '🔑' },
      { id: 'col-23', label: 'Undangan anggota', icon: '📩' },
      { id: 'col-24', label: 'Peran pengguna', icon: '🎭' },
      { id: 'col-25', label: 'Grup pengguna', icon: '👥' }
    ]
  },

  // 17. PENDIDIKAN & PEMBELAJARAN
  {
    id: 'education', label: '🎓 PENDIDIKAN & PEMBELAJARAN', icon: '🎓',
    items: [
      { id: 'edu-1', label: 'Dukungan bimbingan belajar', icon: '👨‍🏫' },
      { id: 'edu-2', label: 'Penjelasan konsep', icon: '💡' },
      { id: 'edu-3', label: 'Pengajaran langkah demi langkah', icon: '👣' },
      { id: 'edu-4', label: 'Pembuatan konten pendidikan', icon: '📚' },
      { id: 'edu-5', label: 'Pembuatan panduan belajar', icon: '📖' },
      { id: 'edu-6', label: 'Pembuatan kartu kilat', icon: '🃏' },
      { id: 'edu-7', label: 'Pembuatan kuis', icon: '❓' },
      { id: 'edu-8', label: 'Pembuatan soal latihan', icon: '📝' },
      { id: 'edu-9', label: 'Bantuan pekerjaan rumah', icon: '🏠' },
      { id: 'edu-10', label: 'Bantuan tugas', icon: '📋' },
      { id: 'edu-11', label: 'Umpan balik esai', icon: '✍️' },
      { id: 'edu-12', label: 'Panduan riset', icon: '🔍' },
      { id: 'edu-13', label: 'Desain jalur pembelajaran', icon: '🛣️' },
      { id: 'edu-14', label: 'Perencanaan kurikulum', icon: '📅' },
      { id: 'edu-15', label: 'Pembuatan rencana pelajaran', icon: '🗓️' },
      { id: 'edu-16', label: 'Pengembangan materi pendidikan', icon: '📦' },
      { id: 'edu-17', label: 'Penilaian siswa', icon: '📊' },
      { id: 'edu-18', label: 'Pelacakan kemajuan', icon: '📈' },
      { id: 'edu-19', label: 'Pembelajaran personal', icon: '👤' },
      { id: 'edu-20', label: 'Bimbingan adaptif', icon: '🦎' },
      { id: 'edu-21', label: 'Rekomendasi sumber belajar', icon: '🔗' },
      { id: 'edu-22', label: 'Latihan bahasa', icon: '🗣️' },
      { id: 'edu-23', label: 'Simulasi konsep', icon: '🎮' },
      { id: 'edu-24', label: 'Diskusi akademis', icon: '💬' },
      { id: 'edu-25', label: 'Persiapan ujian', icon: '📝' }
    ]
  },

  // 18. BISNIS & PROFESIONAL
  {
    id: 'business', label: '💼 BISNIS & PROFESIONAL', icon: '💼',
    items: [
      { id: 'biz-1', label: 'Penulisan rencana bisnis', icon: '📄' },
      { id: 'biz-2', label: 'Analisis keuangan', icon: '💰' },
      { id: 'biz-3', label: 'Riset investasi', icon: '📈' },
      { id: 'biz-4', label: 'Analisis pasar', icon: '📊' },
      { id: 'biz-5', label: 'Strategi bisnis', icon: '♟️' },
      { id: 'biz-6', label: 'Analisis persaingan', icon: '🥊' },
      { id: 'biz-7', label: 'Riset industri', icon: '🏭' },
      { id: 'biz-8', label: 'Pembuatan promosi penjualan', icon: '🎤' },
      { id: 'biz-9', label: 'Strategi pemasaran', icon: '📣' },
      { id: 'biz-10', label: 'Perencanaan kampanye', icon: '📅' },
      { id: 'biz-11', label: 'Pengembangan merek', icon: '🏷️' },
      { id: 'biz-12', label: 'Pembuatan persona pelanggan', icon: '👤' },
      { id: 'biz-13', label: 'Desain proposisi nilai', icon: '💎' },
      { id: 'biz-14', label: 'Posisi produk', icon: '📍' },
      { id: 'biz-15', label: 'Strategi ke pasar', icon: '🚀' },
      { id: 'biz-16', label: 'Kanvas model bisnis', icon: '🖼️' },
      { id: 'biz-17', label: 'Desain model pendapatan', icon: '💵' },
      { id: 'biz-18', label: 'Strategi penetapan harga', icon: '🏷️' },
      { id: 'biz-19', label: 'Strategi distribusi', icon: '🚚' },
      { id: 'biz-20', label: 'Evaluasi kemitraan', icon: '🤝' },
      { id: 'biz-21', label: 'Penilaian vendor', icon: '📋' },
      { id: 'biz-22', label: 'Analisis kontrak', icon: '⚖️' },
      { id: 'biz-23', label: 'Tinjauan dokumen hukum', icon: '📜' },
      { id: 'biz-24', label: 'Pemeriksaan kepatuhan', icon: '✅' },
      { id: 'biz-25', label: 'Manajemen risiko', icon: '⚠️' }
    ]
  },

  // 19. PEMBUATAN KONTEN & PEMASARAN
  {
    id: 'marketing', label: '📣 PEMBUATAN KONTEN & PEMASARAN', icon: '📣',
    items: [
      { id: 'mkt-1', label: 'Strategi konten', icon: '📝' },
      { id: 'mkt-2', label: 'Pembuatan kalender konten', icon: '📅' },
      { id: 'mkt-3', label: 'Kalender editorial', icon: '📰' },
      { id: 'mkt-4', label: 'Strategi blog', icon: '💻' },
      { id: 'mkt-5', label: 'Strategi media sosial', icon: '📱' },
      { id: 'mkt-6', label: 'Penulisan skrip video', icon: '🎬' },
      { id: 'mkt-7', label: 'Penulisan skrip podcast', icon: '🎙️' },
      { id: 'mkt-8', label: 'Pembuatan nawala', icon: '📧' },
      { id: 'mkt-9', label: 'Penulisan kampanye email', icon: '✉️' },
      { id: 'mkt-10', label: 'Desain kampanye tetes', icon: '💧' },
      { id: 'mkt-11', label: 'Salinan halaman arahan', icon: '📄' },
      { id: 'mkt-12', label: 'Penulisan halaman penjualan', icon: '💰' },
      { id: 'mkt-13', label: 'Konten peluncuran produk', icon: '🚀' },
      { id: 'mkt-14', label: 'Pembuatan kit pers', icon: '📦' },
      { id: 'mkt-15', label: 'Penulisan promosi media', icon: '📢' },
      { id: 'mkt-16', label: 'Penjangkauan influencer', icon: '🤝' },
      { id: 'mkt-17', label: 'Proposal kemitraan', icon: '💍' },
      { id: 'mkt-18', label: 'Dek sponsor', icon: '💳' },
      { id: 'mkt-19', label: 'Penceritaan merek', icon: '📖' },
      { id: 'mkt-20', label: 'Penulisan studi kasus', icon: '🔬' },
      { id: 'mkt-21', label: 'Pengumpulan testimoni', icon: '⭐' },
      { id: 'mkt-22', label: 'Kisah sukses pelanggan', icon: '🏆' },
      { id: 'mkt-23', label: 'Kurasi konten pengguna', icon: '👥' },
      { id: 'mkt-24', label: 'Manajemen komunitas', icon: '🏘️' },
      { id: 'mkt-25', label: 'Ide konten viral', icon: '🦠' }
    ]
  },

  // 20. PENULISAN KREATIF
  {
    id: 'creative-writing', label: '✍️ PENULISAN KREATIF', icon: '✍️',
    items: [
      { id: 'wrt-1', label: 'Penulisan fiksi', icon: '🧚' },
      { id: 'wrt-2', label: 'Pembuatan cerita pendek', icon: '📝' },
      { id: 'wrt-3', label: 'Perencanaan novel', icon: '📕' },
      { id: 'wrt-4', label: 'Pengembangan karakter', icon: '👤' },
      { id: 'wrt-5', label: 'Pembangunan dunia', icon: '🌍' },
      { id: 'wrt-6', label: 'Penulisan dialog', icon: '💬' },
      { id: 'wrt-7', label: 'Deskripsi adegan', icon: '🌄' },
      { id: 'wrt-8', label: 'Struktur plot', icon: '📈' },
      { id: 'wrt-9', label: 'Pengembangan busur cerita', icon: '🌈' },
      { id: 'wrt-10', label: 'Pembuatan konflik', icon: '⚔️' },
      { id: 'wrt-11', label: 'Perencanaan resolusi', icon: '🏁' },
      { id: 'wrt-12', label: 'Pengembangan latar belakang', icon: '📜' },
      { id: 'wrt-13', label: 'Profil karakter', icon: '🆔' },
      { id: 'wrt-14', label: 'Deskripsi latar', icon: '🏞️' },
      { id: 'wrt-15', label: 'Penciptaan suasana', icon: '🎭' },
      { id: 'wrt-16', label: 'Panduan kecepatan', icon: '⏱️' },
      { id: 'wrt-17', label: 'Konvensi genre', icon: '📚' },
      { id: 'wrt-18', label: 'Identifikasi kiasan', icon: '🧐' },
      { id: 'wrt-19', label: 'Curah pendapat kreatif', icon: '💡' },
      { id: 'wrt-20', label: 'Solusi blokade penulis', icon: '🔓' },
      { id: 'wrt-21', label: 'Penulisan lirik lagu', icon: '🎵' },
      { id: 'wrt-22', label: 'Menulis puisi', icon: '📜' },
      { id: 'wrt-23', label: 'Penulisan naskah drama', icon: '🎭' },
      { id: 'wrt-24', label: 'Penulisan komedi', icon: '😂' },
      { id: 'wrt-25', label: 'Adaptasi cerita', icon: '🔄' }
    ]
  },

  // 21. DOKUMENTASI TEKNIS
  {
    id: 'tech-docs', label: '📘 DOKUMENTASI TEKNIS', icon: '📘',
    items: [
      { id: 'tdc-1', label: 'Dokumentasi API', icon: '🔌' },
      { id: 'tdc-2', label: 'Spesifikasi teknis', icon: '📏' },
      { id: 'tdc-3', label: 'Dokumentasi arsitektur', icon: '🏛️' },
      { id: 'tdc-4', label: 'Dokumentasi basis data', icon: '🗄️' },
      { id: 'tdc-5', label: 'Dokumentasi infrastruktur', icon: '🧱' },
      { id: 'tdc-6', label: 'Panduan penerapan', icon: '🚀' },
      { id: 'tdc-7', label: 'Panduan konfigurasi', icon: '⚙️' },
      { id: 'tdc-8', label: 'Instruksi pemasangan', icon: '💿' },
      { id: 'tdc-9', label: 'Panduan pemecahan masalah', icon: '🔧' },
      { id: 'tdc-10', label: 'Pembuatan FAQ teknis', icon: '❓' },
      { id: 'tdc-11', label: 'Artikel basis pengetahuan', icon: '🧠' },
      { id: 'tdc-12', label: 'Manual pengguna', icon: '📖' },
      { id: 'tdc-13', label: 'Panduan administrator', icon: '👮' },
      { id: 'tdc-14', label: 'Panduan pengembang', icon: '👨‍💻' },
      { id: 'tdc-15', label: 'Panduan integrasi', icon: '🔗' },
      { id: 'tdc-16', label: 'Dokumentasi SDK', icon: '📦' },
      { id: 'tdc-17', label: 'Dokumentasi CLI', icon: '💻' },
      { id: 'tdc-18', label: 'Catatan rilis', icon: '📢' },
      { id: 'tdc-19', label: 'Pembuatan changelog', icon: '📜' },
      { id: 'tdc-20', label: 'Panduan migrasi', icon: '🚚' },
      { id: 'tdc-21', label: 'Dokumentasi keamanan', icon: '🔒' },
      { id: 'tdc-22', label: 'Standar pengkodean', icon: '📏' },
      { id: 'tdc-23', label: 'Dokumentasi pengujian', icon: '🧪' },
      { id: 'tdc-24', label: 'Glosarium teknis', icon: '📖' },
      { id: 'tdc-25', label: 'Diagram sistem', icon: '📊' }
    ]
  },

  // 22. DUKUNGAN PELANGGAN
  {
    id: 'support', label: '🎧 DUKUNGAN PELANGGAN', icon: '🎧',
    items: [
      { id: 'sup-1', label: 'Tanggapan pertanyaan', icon: '💬' },
      { id: 'sup-2', label: 'Penyusunan tiket dukungan', icon: '🎫' },
      { id: 'sup-3', label: 'Tanggapan meja bantuan', icon: '💁' },
      { id: 'sup-4', label: 'Penanganan keluhan', icon: '😠' },
      { id: 'sup-5', label: 'Resolusi masalah', icon: '✅' },
      { id: 'sup-6', label: 'Penjelasan produk', icon: '📦' },
      { id: 'sup-7', label: 'Demonstrasi fitur', icon: '✨' },
      { id: 'sup-8', label: 'Pembuatan tutorial', icon: '🎓' },
      { id: 'sup-9', label: 'Konten orientasi', icon: '🛫' },
      { id: 'sup-10', label: 'Materi pelatihan', icon: '📚' },
      { id: 'sup-11', label: 'Langkah pemecahan masalah', icon: '👣' },
      { id: 'sup-12', label: 'Analisis laporan bug', icon: '🐛' },
      { id: 'sup-13', label: 'Penanganan permintaan fitur', icon: '💡' },
      { id: 'sup-14', label: 'Analisis umpan balik', icon: '📊' },
      { id: 'sup-15', label: 'Desain survei kepuasan', icon: '😊' },
      { id: 'sup-16', label: 'Dokumentasi dukungan', icon: '📄' },
      { id: 'sup-17', label: 'Manajemen SLA', icon: '⏱️' },
      { id: 'sup-18', label: 'Prosedur eskalasi', icon: '⬆️' },
      { id: 'sup-19', label: 'Komunikasi pelanggan', icon: '🗣️' },
      { id: 'sup-20', label: 'Strategi retensi', icon: '🧲' },
      { id: 'sup-21', label: 'Template balasan cepat', icon: '⚡' },
      { id: 'sup-22', label: 'Analisis sentimen', icon: '🎭' },
      { id: 'sup-23', label: 'Chatbot scripts', icon: '🤖' },
      { id: 'sup-24', label: 'Panduan layanan mandiri', icon: '🤳' },
      { id: 'sup-25', label: 'Manajemen krisis', icon: '🚨' }
    ]
  },

  // 23. SAINS DATA & PEMBELAJARAN MESIN
  {
    id: 'datascience', label: '🤖 SAINS DATA & ML', icon: '🤖',
    items: [
      { id: 'dsc-1', label: 'Pra pemrosesan data', icon: '🧹' },
      { id: 'dsc-2', label: 'Rekayasa fitur', icon: '⚙️' },
      { id: 'dsc-3', label: 'Saran pemilihan model', icon: '🧠' },
      { id: 'dsc-4', label: 'Penjelasan algoritma', icon: '📖' },
      { id: 'dsc-5', label: 'Desain jalur ML', icon: '🛤️' },
      { id: 'dsc-6', label: 'Strategi visualisasi data', icon: '📊' },
      { id: 'dsc-7', label: 'Analisis data eksploratori', icon: '🔍' },
      { id: 'dsc-8', label: 'Pemodelan statistik', icon: '📈' },
      { id: 'dsc-9', label: 'Analitik prediktif', icon: '🔮' },
      { id: 'dsc-10', label: 'Konsep Machine Learning', icon: '🤖' },
      { id: 'dsc-11', label: 'Penjelasan Deep Learning', icon: '🧠' },
      { id: 'dsc-12', label: 'Arsitektur jaringan saraf', icon: '🕸️' },
      { id: 'dsc-13', label: 'Panduan tugas NLP', icon: '🗣️' },
      { id: 'dsc-14', label: 'Saran Computer Vision', icon: '👁️' },
      { id: 'dsc-15', label: 'Pembelajaran penguatan', icon: '🎮' },
      { id: 'dsc-16', label: 'Evaluasi model', icon: '📏' },
      { id: 'dsc-17', label: 'Penyetelan hyperparameter', icon: '🎛️' },
      { id: 'dsc-18', label: 'Strategi validasi silang', icon: '🔄' },
      { id: 'dsc-19', label: 'Deteksi bias', icon: '⚖️' },
      { id: 'dsc-20', label: 'Interpretasi model', icon: '💡' },
      { id: 'dsc-21', label: 'Penerapan model', icon: '🚀' },
      { id: 'dsc-22', label: 'MLOps', icon: '⚙️' },
      { id: 'dsc-23', label: 'Big Data technologies', icon: '🐘' },
      { id: 'dsc-24', label: 'Data mining', icon: '⛏️' },
      { id: 'dsc-25', label: 'Clustering analysis', icon: '🌌' }
    ]
  },

  // 24. KEAMANAN & KEPATUHAN
  {
    id: 'security', label: '🛡️ KEAMANAN & KEPATUHAN', icon: '🛡️',
    items: [
      { id: 'sec-1', label: 'Praktik terbaik keamanan', icon: '🏆' },
      { id: 'sec-2', label: 'Penilaian kerentanan', icon: '🔓' },
      { id: 'sec-3', label: 'Pemodelan ancaman', icon: '⚠️' },
      { id: 'sec-4', label: 'Dukungan audit keamanan', icon: '📋' },
      { id: 'sec-5', label: 'Pemeriksaan kepatuhan', icon: '✅' },
      { id: 'sec-6', label: 'Kepatuhan GDPR', icon: '🇪🇺' },
      { id: 'sec-7', label: 'Panduan HIPAA', icon: '🏥' },
      { id: 'sec-8', label: 'Persyaratan SOC 2', icon: '🏢' },
      { id: 'sec-9', label: 'Panduan ISO 27001', icon: '🌐' },
      { id: 'sec-10', label: 'Kebijakan privasi', icon: '🕵️' },
      { id: 'sec-11', label: 'Ketentuan layanan', icon: '📜' },
      { id: 'sec-12', label: 'Strategi perlindungan data', icon: '🛡️' },
      { id: 'sec-13', label: 'Panduan enkripsi', icon: '🔐' },
      { id: 'sec-14', label: 'Implementasi autentikasi', icon: '🔑' },
      { id: 'sec-15', label: 'Desain otorisasi', icon: '👮' },
      { id: 'sec-16', label: 'Kebijakan kontrol akses', icon: '🚪' },
      { id: 'sec-17', label: 'Dokumentasi keamanan', icon: '📄' },
      { id: 'sec-18', label: 'Tanggapan insiden', icon: '🚨' },
      { id: 'sec-19', label: 'Pemulihan bencana', icon: '🔥' },
      { id: 'sec-20', label: 'Kesinambungan bisnis', icon: '🔄' },
      { id: 'sec-21', label: 'Pengujian penetrasi', icon: '💉' },
      { id: 'sec-22', label: 'Keamanan jaringan', icon: '🕸️' },
      { id: 'sec-23', label: 'Keamanan aplikasi', icon: '📱' },
      { id: 'sec-24', label: 'Keamanan cloud', icon: '☁️' },
      { id: 'sec-25', label: 'Kesadaran keamanan', icon: '🧠' }
    ]
  },

  // 25. PRODUKTIVITAS & ALUR KERJA
  {
    id: 'productivity', label: '⚡ PRODUKTIVITAS & ALUR KERJA', icon: '⚡',
    items: [
      { id: 'prd-1', label: 'Manajemen tugas', icon: '✅' },
      { id: 'prd-2', label: 'Pembuatan daftar tugas', icon: '📝' },
      { id: 'prd-3', label: 'Penetapan prioritas', icon: '🔝' },
      { id: 'prd-4', label: 'Manajemen waktu', icon: '⏳' },
      { id: 'prd-5', label: 'Optimasi jadwal', icon: '📅' },
      { id: 'prd-6', label: 'Pembuatan agenda rapat', icon: '🗓️' },
      { id: 'prd-7', label: 'Notulen rapat', icon: '✍️' },
      { id: 'prd-8', label: 'Pelacakan item tindakan', icon: '👣' },
      { id: 'prd-9', label: 'Manajemen tindak lanjut', icon: '🔄' },
      { id: 'prd-10', label: 'Manajemen email', icon: '📧' },
      { id: 'prd-11', label: 'Organisasi kotak masuk', icon: '📥' },
      { id: 'prd-12', label: 'Templat email', icon: '📋' },
      { id: 'prd-13', label: 'Penyusunan balasan otomatis', icon: '🤖' },
      { id: 'prd-14', label: 'Manajemen kalender', icon: '📆' },
      { id: 'prd-15', label: 'Pembuatan pengingat', icon: '⏰' },
      { id: 'prd-16', label: 'Pelacakan tenggat waktu', icon: '🛑' },
      { id: 'prd-17', label: 'Perencanaan tonggak', icon: '🚩' },
      { id: 'prd-18', label: 'Penetapan tujuan', icon: '🎯' },
      { id: 'prd-19', label: 'Pembuatan OKR', icon: '📈' },
      { id: 'prd-20', label: 'Pelacakan KPI', icon: '📊' },
      { id: 'prd-21', label: 'Kiat produktivitas', icon: '💡' },
      { id: 'prd-22', label: 'Otomasi alur kerja', icon: '⚙️' },
      { id: 'prd-23', label: 'Dokumentasi proses', icon: '📄' },
      { id: 'prd-24', label: 'SOP (Prosedur Operasi)', icon: '📘' },
      { id: 'prd-25', label: 'Pembuatan daftar periksa', icon: '✅' }
    ]
  },

  // 26. DUKUNGAN DESAIN KREATIF
  {
    id: 'design', label: '🎨 DUKUNGAN DESAIN KREATIF', icon: '🎨',
    items: [
      { id: 'des-1', label: 'Pembuatan briefing desain', icon: '📄' },
      { id: 'des-2', label: 'Deskripsi mood board', icon: '🖼️' },
      { id: 'des-3', label: 'Saran palet warna', icon: '🎨' },
      { id: 'des-4', label: 'Rekomendasi tipografi', icon: '🔤' },
      { id: 'des-5', label: 'Saran tata letak', icon: '📐' },
      { id: 'des-6', label: 'Umpan balik UI/UX', icon: '🖱️' },
      { id: 'des-7', label: 'Kritik desain', icon: '🧐' },
      { id: 'des-8', label: 'Tinjauan aksesibilitas', icon: '♿' },
      { id: 'des-9', label: 'Saran desain responsif', icon: '📱' },
      { id: 'des-10', label: 'Perencanaan sistem desain', icon: '🏗️' },
      { id: 'des-11', label: 'Perpustakaan komponen', icon: '📚' },
      { id: 'des-12', label: 'Pembuatan panduan gaya', icon: '📖' },
      { id: 'des-13', label: 'Pedoman merek', icon: '🏷️' },
      { id: 'des-14', label: 'Saran hierarki visual', icon: '👀' },
      { id: 'des-15', label: 'Analisis ruang putih', icon: '⬜' },
      { id: 'des-16', label: 'Rekomendasi sistem grid', icon: '📏' },
      { id: 'des-17', label: 'Pola desain', icon: '🧩' },
      { id: 'des-18', label: 'Panduan ikonografi', icon: '🔶' },
      { id: 'des-19', label: 'Deskripsi ilustrasi', icon: '🖌️' },
      { id: 'des-20', label: 'Konsep motion design', icon: '🎬' },
      { id: 'des-21', label: 'Desain logo', icon: '🆔' },
      { id: 'des-22', label: 'Desain kemasan', icon: '📦' },
      { id: 'des-23', label: 'Desain cetak', icon: '🖨️' },
      { id: 'des-24', label: 'Teori warna', icon: '🌈' },
      { id: 'des-25', label: 'Tren desain', icon: '📈' }
    ]
  },

  // 27. KOMUNIKASI
  {
    id: 'communication', label: '💬 KOMUNIKASI', icon: '💬',
    items: [
      { id: 'com-1', label: 'Penulisan pidato', icon: '🎤' },
      { id: 'com-2', label: 'Naskah presentasi', icon: '📽️' },
      { id: 'com-3', label: 'Konten pitch deck', icon: '💡' },
      { id: 'com-4', label: 'Presentasi investor', icon: '💰' },
      { id: 'com-5', label: 'Persiapan konferensi', icon: '🏟️' },
      { id: 'com-6', label: 'Fasilitasi lokakarya', icon: '🛠️' },
      { id: 'com-7', label: 'Perencanaan pelatihan', icon: '🎓' },
      { id: 'com-8', label: 'Konten webinar', icon: '💻' },
      { id: 'com-9', label: 'Kerangka podcast', icon: '🎙️' },
      { id: 'com-10', label: 'Persiapan wawancara', icon: '👔' },
      { id: 'com-11', label: 'Persiapan tanya jawab', icon: '❓' },
      { id: 'com-12', label: 'Persiapan debat', icon: '🗣️' },
      { id: 'com-13', label: 'Strategi negosiasi', icon: '🤝' },
      { id: 'com-14', label: 'Resolusi konflik', icon: '🕊️' },
      { id: 'com-15', label: 'Panduan percakapan sulit', icon: '😬' },
      { id: 'com-16', label: 'Penyampaian umpan balik', icon: '🔄' },
      { id: 'com-17', label: 'Tinjauan kinerja', icon: '📊' },
      { id: 'com-18', label: 'Surat rekomendasi', icon: '👍' },
      { id: 'com-19', label: 'Surat referensi', icon: '📜' },
      { id: 'com-20', label: 'Catatan terima kasih', icon: '🙏' },
      { id: 'com-21', label: 'Komunikasi internal', icon: '🏢' },
      { id: 'com-22', label: 'Komunikasi eksternal', icon: '🌐' },
      { id: 'com-23', label: 'Public speaking', icon: '📣' },
      { id: 'com-24', label: 'Storytelling bisnis', icon: '📖' },
      { id: 'com-25', label: 'Etiket komunikasi', icon: '🎩' }
    ]
  },

  // 28. PENGEMBANGAN PRIBADI
  {
    id: 'personal-dev', label: '🌱 PENGEMBANGAN PRIBADI', icon: '🌱',
    items: [
      { id: 'pdv-1', label: 'Saran karir', icon: '🚀' },
      { id: 'pdv-2', label: 'Penulisan resume', icon: '📄' },
      { id: 'pdv-3', label: 'Surat lamaran', icon: '✉️' },
      { id: 'pdv-4', label: 'Optimasi LinkedIn', icon: '💼' },
      { id: 'pdv-5', label: 'Tinjauan portofolio', icon: '📂' },
      { id: 'pdv-6', label: 'Persiapan wawancara kerja', icon: '👔' },
      { id: 'pdv-7', label: 'Negosiasi gaji', icon: '💰' },
      { id: 'pdv-8', label: 'Strategi pencarian kerja', icon: '🔍' },
      { id: 'pdv-9', label: 'Panduan networking', icon: '🕸️' },
      { id: 'pdv-10', label: 'Personal branding', icon: '🏷️' },
      { id: 'pdv-11', label: 'Penilaian keterampilan', icon: '✅' },
      { id: 'pdv-12', label: 'Jalur pembelajaran', icon: '🛤️' },
      { id: 'pdv-13', label: 'Pemilihan kursus', icon: '🏫' },
      { id: 'pdv-14', label: 'Rekomendasi buku', icon: '📚' },
      { id: 'pdv-15', label: 'Daftar bacaan', icon: '📖' },
      { id: 'pdv-16', label: 'Perencanaan studi', icon: '📅' },
      { id: 'pdv-17', label: 'Strategi pencapaian tujuan', icon: '🎯' },
      { id: 'pdv-18', label: 'Pembentukan kebiasaan', icon: '🔄' },
      { id: 'pdv-19', label: 'Teknik motivasi', icon: '🔥' },
      { id: 'pdv-20', label: 'Peningkatan produktivitas', icon: '⚡' },
      { id: 'pdv-21', label: 'Manajemen stres', icon: '🧘' },
      { id: 'pdv-22', label: 'Keseimbangan kerja-hidup', icon: '⚖️' },
      { id: 'pdv-23', label: 'Kepemimpinan', icon: '👑' },
      { id: 'pdv-24', label: 'Kecerdasan emosional', icon: '❤️' },
      { id: 'pdv-25', label: 'Berpikir kritis', icon: '🧠' }
    ]
  },

  // 29. GAYA HIDUP & PRIBADI
  {
    id: 'lifestyle', label: '🏠 GAYA HIDUP & PRIBADI', icon: '🏠',
    items: [
      { id: 'lif-1', label: 'Pembuatan resep', icon: '🍳' },
      { id: 'lif-2', label: 'Perencanaan makan', icon: '🍽️' },
      { id: 'lif-3', label: 'Daftar belanja', icon: '🛒' },
      { id: 'lif-4', label: 'Saran nutrisi', icon: '🍎' },
      { id: 'lif-5', label: 'Diet khusus', icon: '🥗' },
      { id: 'lif-6', label: 'Perencanaan olahraga', icon: '🏋️' },
      { id: 'lif-7', label: 'Rutinitas latihan', icon: '🏃' },
      { id: 'lif-8', label: 'Tujuan kebugaran', icon: '💪' },
      { id: 'lif-9', label: 'Pelacakan kesehatan', icon: '🩺' },
      { id: 'lif-10', label: 'Kiat kesejahteraan', icon: '🧘' },
      { id: 'lif-11', label: 'Perencanaan perjalanan', icon: '✈️' },
      { id: 'lif-12', label: 'Rencana perjalanan (itinerary)', icon: '🗺️' },
      { id: 'lif-13', label: 'Daftar kemasan', icon: '🧳' },
      { id: 'lif-14', label: 'Riset destinasi', icon: '📍' },
      { id: 'lif-15', label: 'Rekomendasi aktivitas', icon: '🎟️' },
      { id: 'lif-16', label: 'Rekomendasi restoran', icon: '🍴' },
      { id: 'lif-17', label: 'Tips perjalanan hemat', icon: '💸' },
      { id: 'lif-18', label: 'Saran keamanan', icon: '🛡️' },
      { id: 'lif-19', label: 'Etiket budaya', icon: '🤝' },
      { id: 'lif-20', label: 'Pembelajaran bahasa', icon: '🗣️' },
      { id: 'lif-21', label: 'Ide hadiah', icon: '🎁' },
      { id: 'lif-22', label: 'Perencanaan acara', icon: '🎉' },
      { id: 'lif-23', label: 'Perencanaan pesta', icon: '🎈' },
      { id: 'lif-24', label: 'Organisasi rumah', icon: '🧹' },
      { id: 'lif-25', label: 'Tips DIY & perbaikan', icon: '🔨' }
    ]
  },

  // 30. PERMAINAN & HIBURAN
  {
    id: 'gaming', label: '🎮 PERMAINAN & HIBURAN', icon: '🎮',
    items: [
      { id: 'gam-1', label: 'Strategi permainan', icon: '♟️' },
      { id: 'gam-2', label: 'Panduan permainan', icon: '📘' },
      { id: 'gam-3', label: 'Pembangunan karakter game', icon: '🧙' },
      { id: 'gam-4', label: 'Komposisi tim', icon: '🛡️' },
      { id: 'gam-5', label: 'Analisis meta', icon: '📊' },
      { id: 'gam-6', label: 'Mekanik permainan', icon: '⚙️' },
      { id: 'gam-7', label: 'Panduan misi', icon: '📜' },
      { id: 'gam-8', label: 'Berburu pencapaian', icon: '🏆' },
      { id: 'gam-9', label: 'Strategi speedrun', icon: '⏱️' },
      { id: 'gam-10', label: 'Taktik PvP', icon: '⚔️' },
      { id: 'gam-11', label: 'Strategi PvE', icon: '🐉' },
      { id: 'gam-12', label: 'Perencanaan raid', icon: '🏰' },
      { id: 'gam-13', label: 'Manajemen guild', icon: '🏰' },
      { id: 'gam-14', label: 'Penjelasan lore/cerita', icon: '📖' },
      { id: 'gam-15', label: 'Eksplorasi dunia', icon: '🌍' },
      { id: 'gam-16', label: 'Telur paskah (Easter eggs)', icon: '🥚' },
      { id: 'gam-17', label: 'Rekomendasi mod', icon: '🔧' },
      { id: 'gam-18', label: 'Rekomendasi game', icon: '👍' },
      { id: 'gam-19', label: 'Perbandingan platform', icon: '🖥️' },
      { id: 'gam-20', label: 'Saran pengaturan', icon: '⚙️' },
      { id: 'gam-21', label: 'Berita game', icon: '📰' },
      { id: 'gam-22', label: 'Trivia game', icon: '❓' },
      { id: 'gam-23', label: 'Analisis esports', icon: '🏅' },
      { id: 'gam-24', label: 'Streaming setup', icon: '📹' },
      { id: 'gam-25', label: 'Komunitas game', icon: '👥' }
    ]
  },

  // 31. KECERDASAN BUATAN PERCAKAPAN
  {
    id: 'conversational', label: '🤖 AI PERCAKAPAN', icon: '🤖',
    items: [
      { id: 'cnv-1', label: 'Dialog alami', icon: '🗣️' },
      { id: 'cnv-2', label: 'Kesadaran konteks', icon: '🧠' },
      { id: 'cnv-3', label: 'Pemahaman maksud', icon: '🎯' },
      { id: 'cnv-4', label: 'Deteksi sentimen', icon: '❤️' },
      { id: 'cnv-5', label: 'Pengenalan emosi', icon: '😊' },
      { id: 'cnv-6', label: 'Pencocokan nada', icon: '🎵' },
      { id: 'cnv-7', label: 'Tanggapan empatik', icon: '🤗' },
      { id: 'cnv-8', label: 'Mendengarkan aktif', icon: '👂' },
      { id: 'cnv-9', label: 'Pertanyaan klarifikasi', icon: '❓' },
      { id: 'cnv-10', label: 'Saran tindak lanjut', icon: '➡️' },
      { id: 'cnv-11', label: 'Transisi topik', icon: '🔄' },
      { id: 'cnv-12', label: 'Penguliran percakapan', icon: '🧵' },
      { id: 'cnv-13', label: 'Koherensi banyak giliran', icon: '🔁' },
      { id: 'cnv-14', label: 'Resolusi referensi', icon: '🔗' },
      { id: 'cnv-15', label: 'Penanganan ambiguitas', icon: '🌫️' },
      { id: 'cnv-16', label: 'Pemahaman nuansa', icon: '🎨' },
      { id: 'cnv-17', label: 'Deteksi sarkasme', icon: '😏' },
      { id: 'cnv-18', label: 'Pemahaman humor', icon: '😂' },
      { id: 'cnv-19', label: 'Konteks budaya', icon: '🌏' },
      { id: 'cnv-20', label: 'Kalibrasi kesopanan', icon: '🎩' },
      { id: 'cnv-21', label: 'Persona AI', icon: '🎭' },
      { id: 'cnv-22', label: 'Roleplay', icon: '🎬' },
      { id: 'cnv-23', label: 'Simulasi debat', icon: '🗣️' },
      { id: 'cnv-24', label: 'Latihan wawancara', icon: '🎤' },
      { id: 'cnv-25', label: 'Teman ngobrol', icon: '☕' }
    ]
  },

  // 32. KECERDASAN BUATAN ETIS & KEAMANAN
  {
    id: 'ethics', label: '⚖️ AI ETIS & KEAMANAN', icon: '⚖️',
    items: [
      { id: 'eth-1', label: 'Prinsip AI konstitusional', icon: '📜' },
      { id: 'eth-2', label: 'Prioritas tidak berbahaya', icon: '🛡️' },
      { id: 'eth-3', label: 'Keseimbangan kegunaan', icon: '⚖️' },
      { id: 'eth-4', label: 'Komitmen kejujuran', icon: '🤝' },
      { id: 'eth-5', label: 'Mitigasi bias', icon: '🚫' },
      { id: 'eth-6', label: 'Pertimbangan keadilan', icon: '⚖️' },
      { id: 'eth-7', label: 'Transparansi', icon: '🔍' },
      { id: 'eth-8', label: 'Kemampuan dijelaskan', icon: '📖' },
      { id: 'eth-9', label: 'Perlindungan privasi', icon: '🔒' },
      { id: 'eth-10', label: 'Keamanan data', icon: '💾' },
      { id: 'eth-11', label: 'Moderasi konten', icon: '👮' },
      { id: 'eth-12', label: 'Penyaringan konten berbahaya', icon: '🛑' },
      { id: 'eth-13', label: 'Tanggapan sesuai usia', icon: '👶' },
      { id: 'eth-14', label: 'Sensitivitas budaya', icon: '🌏' },
      { id: 'eth-15', label: 'Bahasa inklusif', icon: '🌈' },
      { id: 'eth-16', label: 'Dukungan aksesibilitas', icon: '♿' },
      { id: 'eth-17', label: 'Penalaran etis', icon: '🤔' },
      { id: 'eth-18', label: 'Penyelarasan nilai', icon: '❤️' },
      { id: 'eth-19', label: 'Pagar pembatas keamanan', icon: '🚧' },
      { id: 'eth-20', label: 'Praktik AI bertanggung jawab', icon: '✅' },
      { id: 'eth-21', label: 'Deteksi halusinasi', icon: '👻' },
      { id: 'eth-22', label: 'Verifikasi fakta', icon: '✔️' },
      { id: 'eth-23', label: 'Kutipan sumber', icon: '🔗' },
      { id: 'eth-24', label: 'Hak cipta & IP', icon: '©️' },
      { id: 'eth-25', label: 'Dampak sosial', icon: '🌍' }
    ]
  },

  // 33. ANTARMUKA PEMROGRAMAN & FITUR PENGEMBANG
  {
    id: 'api-dev', label: '🔌 API & FITUR PENGEMBANG', icon: '🔌',
    items: [
      { id: 'api-1', label: 'Akses API', icon: '🔑' },
      { id: 'api-2', label: 'Integrasi REST API', icon: '🌐' },
      { id: 'api-3', label: 'Tanggapan streaming', icon: '🌊' },
      { id: 'api-4', label: 'Pemrosesan batch', icon: '📦' },
      { id: 'api-5', label: 'Caching prompt', icon: '💾' },
      { id: 'api-6', label: 'Penghitungan token', icon: '🔢' },
      { id: 'api-7', label: 'Optimasi biaya', icon: '💰' },
      { id: 'api-8', label: 'Manajemen batas laju', icon: '⏱️' },
      { id: 'api-9', label: 'Penanganan kesalahan', icon: '⚠️' },
      { id: 'api-10', label: 'Logika coba ulang (retry)', icon: '🔄' },
      { id: 'api-11', label: 'Konfigurasi timeout', icon: '⌛' },
      { id: 'api-12', label: 'Pemformatan tanggapan', icon: '📝' },
      { id: 'api-13', label: 'Mode JSON', icon: '📋' },
      { id: 'api-14', label: 'Keluaran terstruktur', icon: '🏗️' },
      { id: 'api-15', label: 'Kemampuan penggunaan alat', icon: '🛠️' },
      { id: 'api-16', label: 'Pemanggilan fungsi', icon: '📞' },
      { id: 'api-17', label: 'Messages API', icon: '💬' },
      { id: 'api-18', label: 'Dukungan embeddings', icon: '🧬' },
      { id: 'api-19', label: 'Pemilihan model', icon: '🤖' },
      { id: 'api-20', label: 'Kontrol suhu (temperature)', icon: '🌡️' },
      { id: 'api-21', label: 'Konfigurasi max tokens', icon: '📏' },
      { id: 'api-22', label: 'Stop sequences', icon: '🛑' },
      { id: 'api-23', label: 'Top-p sampling', icon: '🎲' },
      { id: 'api-24', label: 'Penalti frekuensi', icon: '📉' },
      { id: 'api-25', label: 'Prompt sistem', icon: '⚙️' }
    ]
  },

  // 34. PLATFORM & AKSES
  {
    id: 'platform', label: '🖥️ PLATFORM & AKSES', icon: '🖥️',
    items: [
      { id: 'plt-1', label: 'Antarmuka web', icon: '🌐' },
      { id: 'plt-2', label: 'Aplikasi desktop Windows', icon: '🪟' },
      { id: 'plt-3', label: 'Aplikasi desktop macOS', icon: '🍎' },
      { id: 'plt-4', label: 'Aplikasi desktop Linux', icon: '🐧' },
      { id: 'plt-5', label: 'Aplikasi seluler iOS', icon: '📱' },
      { id: 'plt-6', label: 'Aplikasi seluler Android', icon: '🤖' },
      { id: 'plt-7', label: 'Sinkronisasi lintas platform', icon: '🔄' },
      { id: 'plt-8', label: 'Akses berbasis awan', icon: '☁️' },
      { id: 'plt-9', label: 'Kompatibilitas peramban', icon: '🧭' },
      { id: 'plt-10', label: 'Responsivitas seluler', icon: '📲' },
      { id: 'plt-11', label: 'Mode luring (terbatas)', icon: '🔌' },
      { id: 'plt-12', label: 'Dukungan PWA', icon: '📱' },
      { id: 'plt-13', label: 'Akses banyak perangkat', icon: '💻' },
      { id: 'plt-14', label: 'Manajemen sesi', icon: '⏱️' },
      { id: 'plt-15', label: 'Manajemen akun', icon: '👤' },
      { id: 'plt-16', label: 'Kustomisasi profil', icon: '🎨' },
      { id: 'plt-17', label: 'Konfigurasi pengaturan', icon: '⚙️' },
      { id: 'plt-18', label: 'Manajemen preferensi', icon: '❤️' },
      { id: 'plt-19', label: 'Pengaturan notifikasi', icon: '🔔' },
      { id: 'plt-20', label: 'Konfigurasi peringatan', icon: '⚠️' },
      { id: 'plt-21', label: 'Tema gelap/terang', icon: '🌓' },
      { id: 'plt-22', label: 'Pintasan keyboard', icon: '⌨️' },
      { id: 'plt-23', label: 'Ekstensi browser', icon: '🧩' },
      { id: 'plt-24', label: 'Widget', icon: '🔲' },
      { id: 'plt-25', label: 'Aksesibilitas (screen reader)', icon: '🔊' }
    ]
  },

  // 35. LANGGANAN & PAKET
  {
    id: 'subscriptions', label: '💳 LANGGANAN & PAKET', icon: '💳',
    items: [
      { id: 'sub-1', label: 'Paket gratis', icon: '🆓' },
      { id: 'sub-2', label: 'Langganan profesional', icon: '💼' },
      { id: 'sub-3', label: 'Langganan maksimal', icon: '🚀' },
      { id: 'sub-4', label: 'Langganan tim', icon: '👥' },
      { id: 'sub-5', label: 'Langganan perusahaan', icon: '🏢' },
      { id: 'sub-6', label: 'Batas penggunaan', icon: '📊' },
      { id: 'sub-7', label: 'Batas pesan', icon: '💬' },
      { id: 'sub-8', label: 'Batas laju', icon: '⏱️' },
      { id: 'sub-9', label: 'Akses prioritas', icon: '⚡' },
      { id: 'sub-10', label: 'Akses fitur lanjutan', icon: '🌟' },
      { id: 'sub-11', label: 'Akses integrasi', icon: '🔌' },
      { id: 'sub-12', label: 'Akses server MCP', icon: '🖥️' },
      { id: 'sub-13', label: 'Akses penggunaan komputer', icon: '💻' },
      { id: 'sub-14', label: 'Akses mode riset', icon: '🔬' },
      { id: 'sub-15', label: 'Akses pencarian web', icon: '🌐' },
      { id: 'sub-16', label: 'Penagihan khusus', icon: '🧾' },
      { id: 'sub-17', label: 'Diskon volume', icon: '📉' },
      { id: 'sub-18', label: 'Harga pendidikan', icon: '🎓' },
      { id: 'sub-19', label: 'Harga nirlaba', icon: '🎗️' },
      { id: 'sub-20', label: 'Opsi pembayaran fleksibel', icon: '💳' },
      { id: 'sub-21', label: 'Riwayat penagihan', icon: '📜' },
      { id: 'sub-22', label: 'Manajemen faktur', icon: '📄' },
      { id: 'sub-23', label: 'Upgrade/Downgrade', icon: '↕️' },
      { id: 'sub-24', label: 'Uji coba gratis', icon: '⏳' },
      { id: 'sub-25', label: 'Program referral', icon: '🤝' }
    ]
  },

  // 36. MODEL & VERSI
  {
    id: 'models', label: '🤖 MODEL & VERSI', icon: '🤖',
    items: [
      { id: 'mod-1', label: 'Pemilihan model', icon: '👆' },
      { id: 'mod-2', label: 'Pergantian versi', icon: '🔄' },
      { id: 'mod-3', label: 'Optimasi kinerja', icon: '🚀' },
      { id: 'mod-4', label: 'Trade-off kecepatan/kualitas', icon: '⚖️' },
      { id: 'mod-5', label: 'Jendela konteks besar', icon: '🧠' },
      { id: 'mod-6', label: 'Pemikiran diperpanjang', icon: '🤔' },
      { id: 'mod-7', label: 'Kemampuan penalaran', icon: '🧩' },
      { id: 'mod-8', label: 'Kemampuan penglihatan', icon: '👁️' },
      { id: 'mod-9', label: 'Masukan multimodal', icon: '🎥' },
      { id: 'mod-10', label: 'Keluaran teks', icon: '📝' },
      { id: 'mod-11', label: 'Fokus pembuatan kode', icon: '💻' },
      { id: 'mod-12', label: 'Kemampuan agentik', icon: '🤖' },
      { id: 'mod-13', label: 'Kinerja tolok ukur', icon: '📊' },
      { id: 'mod-14', label: 'Model Flash', icon: '⚡' },
      { id: 'mod-15', label: 'Model Pro', icon: '🏆' },
      { id: 'mod-16', label: 'Model Ultra/Max', icon: '🚀' },
      { id: 'mod-17', label: 'Model Legacy', icon: '🕰️' },
      { id: 'mod-18', label: 'Model eksperimental', icon: '🧪' },
      { id: 'mod-19', label: 'Pembaruan model', icon: '🆕' },
      { id: 'mod-20', label: 'Catatan rilis model', icon: '📜' },
      { id: 'mod-21', label: 'Fine-tuning', icon: '🔧' },
      { id: 'mod-22', label: 'Custom models', icon: '🛠️' },
      { id: 'mod-23', label: 'Parameter count', icon: '🔢' },
      { id: 'mod-24', label: 'Training data cutoff', icon: '📅' },
      { id: 'mod-25', label: 'Multilingual support', icon: '🌍' }
    ]
  },

  // 37. KUALITAS & AKURASI
  {
    id: 'quality', label: '⭐ KUALITAS & AKURASI', icon: '⭐',
    items: [
      { id: 'qua-1', label: 'Tanggapan akurasi tinggi', icon: '🎯' },
      { id: 'qua-2', label: 'Konsistensi faktual', icon: '✅' },
      { id: 'qua-3', label: 'Verifikasi sumber', icon: '🔍' },
      { id: 'qua-4', label: 'Akurasi kutipan', icon: '🔗' },
      { id: 'qua-5', label: 'Pengurangan halusinasi', icon: '💊' },
      { id: 'qua-6', label: 'Metrik keandalan', icon: '📏' },
      { id: 'qua-7', label: 'Jaminan kualitas', icon: '🛡️' },
      { id: 'qua-8', label: 'Deteksi kesalahan', icon: '⚠️' },
      { id: 'qua-9', label: 'Koreksi diri', icon: '🔄' },
      { id: 'qua-10', label: 'Kalibrasi kepercayaan', icon: '⚖️' },
      { id: 'qua-11', label: 'Ekspresi ketidakpastian', icon: '🤷' },
      { id: 'qua-12', label: 'Batasan pengetahuan', icon: '🚧' },
      { id: 'qua-13', label: 'Informasi diperbarui', icon: '🆕' },
      { id: 'qua-14', label: 'Keahlian domain', icon: '🎓' },
      { id: 'qua-15', label: 'Akurasi teknis', icon: '⚙️' },
      { id: 'qua-16', label: 'Ketelitian ilmiah', icon: '🔬' },
      { id: 'qua-17', label: 'Presisi matematis', icon: '🧮' },
      { id: 'qua-18', label: 'Konsistensi logis', icon: '🧩' },
      { id: 'qua-19', label: 'Penalaran koheren', icon: '🧠' },
      { id: 'qua-20', label: 'Perhatian terhadap detail', icon: '🔍' },
      { id: 'qua-21', label: 'User feedback loop', icon: '🔄' },
      { id: 'qua-22', label: 'Expert review', icon: '👨‍🏫' },
      { id: 'qua-23', label: 'Benchmark testing', icon: '📊' },
      { id: 'qua-24', label: 'Adversarial testing', icon: '⚔️' },
      { id: 'qua-25', label: 'Continuous improvement', icon: '📈' }
    ]
  },

  // 38. PENGALAMAN PENGGUNA
  {
    id: 'ux', label: '✨ PENGALAMAN PENGGUNA', icon: '✨',
    items: [
      { id: 'ux-1', label: 'Antarmuka intuitif', icon: '🖱️' },
      { id: 'ux-2', label: 'Desain bersih', icon: '🧼' },
      { id: 'ux-3', label: 'Navigasi mudah', icon: '🧭' },
      { id: 'ux-4', label: 'Waktu tanggapan cepat', icon: '⚡' },
      { id: 'ux-5', label: 'Interaksi mulus', icon: '🌊' },
      { id: 'ux-6', label: 'Latensi minimal', icon: '⏱️' },
      { id: 'ux-7', label: 'Indikator pemuatan', icon: '⏳' },
      { id: 'ux-8', label: 'Pelacakan kemajuan', icon: '👣' },
      { id: 'ux-9', label: 'Pembaruan status', icon: '📢' },
      { id: 'ux-10', label: 'Pesan kesalahan jelas', icon: '⚠️' },
      { id: 'ux-11', label: 'Dokumentasi bantuan', icon: '❓' },
      { id: 'ux-12', label: 'Tooltip', icon: 'ℹ️' },
      { id: 'ux-13', label: 'Tutorial orientasi', icon: '👋' },
      { id: 'ux-14', label: 'Penemuan fitur', icon: '🔍' },
      { id: 'ux-15', label: 'Pintasan papan ketik', icon: '⌨️' },
      { id: 'ux-16', label: 'Fungsionalitas pencarian', icon: '🔎' },
      { id: 'ux-17', label: 'Opsi penyaringan', icon: '🌪️' },
      { id: 'ux-18', label: 'Kemampuan pengurutan', icon: '⬇️' },
      { id: 'ux-19', label: 'Opsi ekspor', icon: '📤' },
      { id: 'ux-20', label: 'Fitur unduh', icon: '💾' },
      { id: 'ux-21', label: 'Drag and drop', icon: '✋' },
      { id: 'ux-22', label: 'Copy to clipboard', icon: '📋' },
      { id: 'ux-23', label: 'Voice input', icon: '🎤' },
      { id: 'ux-24', label: 'Text-to-speech', icon: '🔊' },
      { id: 'ux-25', label: 'Haptic feedback (mobile)', icon: '📳' }
    ]
  },

  // 39. FITUR LANJUTAN
  {
    id: 'advanced', label: '🚀 FITUR LANJUTAN', icon: '🚀',
    items: [
      { id: 'adv-1', label: 'Pemrosesan konteks diperpanjang', icon: '🧠' },
      { id: 'adv-2', label: 'Konten bentuk panjang', icon: '📜' },
      { id: 'adv-3', label: 'Analisis banyak dokumen', icon: '📚' },
      { id: 'adv-4', label: 'Referensi silang', icon: '🔗' },
      { id: 'adv-5', label: 'Integrasi mendalam', icon: '🔌' },
      { id: 'adv-6', label: 'Otomasi lanjutan', icon: '🤖' },
      { id: 'adv-7', label: 'Orkestrasi alur kerja', icon: '🎼' },
      { id: 'adv-8', label: 'Integrasi pipeline', icon: '🛤️' },
      { id: 'adv-9', label: 'Tindakan berbasis peristiwa', icon: '🔔' },
      { id: 'adv-10', label: 'Logika kondisional', icon: '🔀' },
      { id: 'adv-11', label: 'Penanganan loop', icon: '🔄' },
      { id: 'adv-12', label: 'Manajemen pengecualian', icon: '⚠️' },
      { id: 'adv-13', label: 'Manajemen state', icon: '💾' },
      { id: 'adv-14', label: 'Persistensi sesi', icon: '⏱️' },
      { id: 'adv-15', label: 'Optimasi cache', icon: '⚡' },
      { id: 'adv-16', label: 'Pemantauan kinerja', icon: '📊' },
      { id: 'adv-17', label: 'Pelacakan analitik', icon: '📈' },
      { id: 'adv-18', label: 'Wawasan penggunaan', icon: '💡' },
      { id: 'adv-19', label: 'Saran optimasi', icon: '🚀' },
      { id: 'adv-20', label: 'Rekomendasi best practice', icon: '🏆' },
      { id: 'adv-21', label: 'Custom instructions', icon: '📝' },
      { id: 'adv-22', label: 'Plugin support', icon: '🧩' },
      { id: 'adv-23', label: 'Scripting capability', icon: '📜' },
      { id: 'adv-24', label: 'Sandbox environment', icon: '📦' },
      { id: 'adv-25', label: 'API webhooks', icon: '🎣' }
    ]
  },

  // 40. TUGAS KHUSUS
  {
    id: 'special-tasks', label: '🛠️ TUGAS KHUSUS', icon: '🛠️',
    items: [
      { id: 'tsk-1', label: 'Analisis dokumen hukum', icon: '⚖️' },
      { id: 'tsk-2', label: 'Informasi medis (edukasi)', icon: '⚕️' },
      { id: 'tsk-3', label: 'Analisis makalah ilmiah', icon: '🔬' },
      { id: 'tsk-4', label: 'Dukungan pencarian paten', icon: '💡' },
      { id: 'tsk-5', label: 'Kepatuhan regulasi', icon: '📋' },
      { id: 'tsk-6', label: 'Dokumentasi pajak', icon: '💰' },
      { id: 'tsk-7', label: 'Dukungan akuntansi', icon: '🧮' },
      { id: 'tsk-8', label: 'Pelaporan keuangan', icon: '📊' },
      { id: 'tsk-9', label: 'Persiapan audit', icon: '🧐' },
      { id: 'tsk-10', label: 'Dokumentasi HR', icon: '👥' },
      { id: 'tsk-11', label: 'Penyaringan rekrutmen', icon: '🔎' },
      { id: 'tsk-12', label: 'Pertanyaan wawancara', icon: '❓' },
      { id: 'tsk-13', label: 'Metrik kinerja', icon: '📈' },
      { id: 'tsk-14', label: 'Buku pegangan karyawan', icon: '📘' },
      { id: 'tsk-15', label: 'Dokumentasi kebijakan', icon: '📜' },
      { id: 'tsk-16', label: 'Penulisan prosedur', icon: '📝' },
      { id: 'tsk-17', label: 'Penilaian risiko', icon: '⚠️' },
      { id: 'tsk-18', label: 'Kontrol kualitas', icon: '✅' },
      { id: 'tsk-19', label: 'Peningkatan proses', icon: '🚀' },
      { id: 'tsk-20', label: 'Metodologi lean', icon: '📉' },
      { id: 'tsk-21', label: 'Dukungan Six Sigma', icon: '6️⃣' },
      { id: 'tsk-22', label: 'Pembinaan Agile', icon: '🏃' },
      { id: 'tsk-23', label: 'Fasilitasi Scrum', icon: '🏉' },
      { id: 'tsk-24', label: 'Perencanaan Kanban', icon: '📋' },
      { id: 'tsk-25', label: 'Manajemen backlog', icon: '🗂️' }
    ]
  }
];
