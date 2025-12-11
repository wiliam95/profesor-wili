// i18n/index.ts - Internationalization Support

export type Language = 'en' | 'id';

export interface Translations {
    common: {
        send: string;
        cancel: string;
        save: string;
        delete: string;
        edit: string;
        copy: string;
        close: string;
        search: string;
        loading: string;
        error: string;
    };
    chat: {
        placeholder: string;
        newChat: string;
        stopGenerating: string;
        regenerate: string;
        thinking: string;
    };
    sidebar: {
        history: string;
        projects: string;
        tools: string;
        settings: string;
    };
    models: {
        selectModel: string;
        searchModels: string;
    };
}

const translations: Record<Language, Translations> = {
    en: {
        common: { send: 'Send', cancel: 'Cancel', save: 'Save', delete: 'Delete', edit: 'Edit', copy: 'Copy', close: 'Close', search: 'Search', loading: 'Loading...', error: 'Error' },
        chat: { placeholder: 'Message Claude...', newChat: 'New Chat', stopGenerating: 'Stop generating', regenerate: 'Regenerate', thinking: 'Thinking...' },
        sidebar: { history: 'History', projects: 'Projects', tools: 'Tools', settings: 'Settings' },
        models: { selectModel: 'Select Model', searchModels: 'Search models...' }
    },
    id: {
        common: { send: 'Kirim', cancel: 'Batal', save: 'Simpan', delete: 'Hapus', edit: 'Edit', copy: 'Salin', close: 'Tutup', search: 'Cari', loading: 'Memuat...', error: 'Error' },
        chat: { placeholder: 'Pesan ke Claude...', newChat: 'Chat Baru', stopGenerating: 'Hentikan', regenerate: 'Ulangi', thinking: 'Berpikir...' },
        sidebar: { history: 'Riwayat', projects: 'Proyek', tools: 'Alat', settings: 'Pengaturan' },
        models: { selectModel: 'Pilih Model', searchModels: 'Cari model...' }
    }
};

let currentLanguage: Language = 'en';

export function setLanguage(lang: Language): void {
    currentLanguage = lang;
    localStorage.setItem('wili_language', lang);
}

export function getLanguage(): Language {
    return (localStorage.getItem('wili_language') as Language) || 'en';
}

export function t(key: string): string {
    const keys = key.split('.');
    let result: any = translations[currentLanguage];
    for (const k of keys) {
        result = result?.[k];
    }
    return result || key;
}

export default { t, setLanguage, getLanguage, translations };
