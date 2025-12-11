const loadScript = (src: string, globalCheck: () => boolean): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (globalCheck()) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => { setTimeout(()=>{ globalCheck() ? resolve() : reject(new Error('script not ready')); }, 50); };
      s.onerror = () => reject(new Error('script load failed'));
      document.head.appendChild(s);
    } catch (e) { reject(e as any); }
  });
};

const b64ToUint8 = (b64: string): Uint8Array => Uint8Array.from(atob(b64), c => c.charCodeAt(0));

export const parsePDF = async (base64: string): Promise<string> => {
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js', () => !!(window as any).pdfjsLib);
    const pdfjsLib = (window as any).pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    const data = b64ToUint8(base64);
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((it: any) => it.str);
      text += `\n\n# Page ${i}\n` + strings.join(' ');
    }
    return text;
  } catch { return ''; }
};

export const parseDOCX = async (base64: string): Promise<string> => {
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js', () => !!(window as any).mammoth);
    const mammoth = (window as any).mammoth;
    const arrayBuffer = b64ToUint8(base64).buffer;
    const res = await mammoth.convertToHtml({ arrayBuffer });
    const html = String(res.value || '');
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    return text;
  } catch { return ''; }
};

export const parseImageOCR = async (base64: string): Promise<string> => {
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5.0.3/dist/tesseract.min.js', () => !!(window as any).Tesseract);
    const Tesseract = (window as any).Tesseract;
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    const { data } = await Tesseract.recognize(dataUrl, 'eng');
    return String(data?.text || '');
  } catch { return ''; }
};

