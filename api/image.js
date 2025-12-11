export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { image, mimeType, prompt = 'Describe this image' } = req.body;

        console.log('[API] Image analysis request received:', {
            hasImage: !!image,
            mimeType: mimeType,
            promptLength: prompt?.length
        });

        // Validate input
        if (!image) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_IMAGE',
                message: 'No image data provided'
            });
        }

        // ═══════════════════════════════════════════════════════════════
        // Vercel Cloud Limitation Notice
        // Pollinations.ai (our free fallback) doesn't support image input
        // ═══════════════════════════════════════════════════════════════

        // Check if Gemini API key is available via environment
        const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

        if (!geminiKey) {
            console.log('[API] No Gemini key - returning cloud limitation message');
            return res.status(200).json({
                success: true,
                text: `⚠️ **Batasan Mode Cloud (Vercel)**

Maaf, analisis gambar/file saat ini hanya tersedia jika Anda:
1. Menjalankan bot di **komputer sendiri** (Localhost)
2. Menggunakan **API Key Gemini** pribadi di Settings

Mode Cloud Gratis (Pollinations) belum mendukung input gambar.

💡 **Tips:** Masukkan Google Gemini API Key Anda di menu Settings → API Keys untuk mengaktifkan fitur analisis gambar.`,
                provider: 'system',
                limitation: true
            });
        }

        // ═══════════════════════════════════════════════════════════════
        // Try Gemini Vision API (if key available)
        // ═══════════════════════════════════════════════════════════════
        try {
            console.log('[API] Trying Gemini Vision...');

            const geminiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: prompt },
                                {
                                    inlineData: {
                                        mimeType: mimeType || 'image/jpeg',
                                        data: image
                                    }
                                }
                            ]
                        }]
                    })
                }
            );

            if (geminiResponse.ok) {
                const data = await geminiResponse.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
                console.log('[API] ✓ Gemini Vision success');

                return res.status(200).json({
                    success: true,
                    text: text,
                    provider: 'gemini',
                    model: 'gemini-2.0-flash'
                });
            } else {
                const errorData = await geminiResponse.json().catch(() => ({}));
                console.error('[API] Gemini Vision error:', errorData);
                throw new Error(errorData.error?.message || 'Gemini API error');
            }
        } catch (geminiError) {
            console.error('[API] Gemini Vision failed:', geminiError.message);

            return res.status(200).json({
                success: true,
                text: `⚠️ **Error Analisis Gambar**

Terjadi kesalahan saat menganalisis gambar: ${geminiError.message}

Silakan coba lagi atau periksa API key Anda di Settings.`,
                provider: 'system',
                error: geminiError.message
            });
        }

    } catch (error) {
        console.error('[API] Server error:', error);
        return res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: error.message
        });
    }
}
