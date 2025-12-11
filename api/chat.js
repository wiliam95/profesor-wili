export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, attachments = [] } = req.body;

        console.log('[API] Chat request received:', {
            messageLength: message?.length,
            attachmentsCount: attachments.length
        });

        // ═══════════════════════════════════════════════════════
        // PRIORITY 1: Pollinations.ai (Default - Fast & Reliable)
        // ═══════════════════════════════════════════════════════
        try {
            console.log('[API] Trying Pollinations...');

            const pollinationsResponse = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'You are a helpful AI assistant with web search capability.' },
                        { role: 'user', content: message }
                    ],
                    model: 'openai'
                })
            });

            if (pollinationsResponse.ok) {
                const text = await pollinationsResponse.text();
                console.log('[API] ✓ Pollinations success');

                return res.status(200).json({
                    success: true,
                    text: text,
                    provider: 'pollinations',
                    model: 'openai'
                });
            }
        } catch (pollinationsError) {
            console.error('[API] Pollinations failed:', pollinationsError.message);
        }

        // ═══════════════════════════════════════════════════════
        // PRIORITY 2: DeepAI (Fallback)
        // ═══════════════════════════════════════════════════════
        try {
            console.log('[API] Trying DeepAI...');

            const deepaiResponse = await fetch('https://api.deepai.org/api/text-generator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': process.env.DEEPAI_API_KEY || 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K'
                },
                body: JSON.stringify({ text: message })
            });

            if (deepaiResponse.ok) {
                const data = await deepaiResponse.json();
                console.log('[API] ✓ DeepAI success');

                return res.status(200).json({
                    success: true,
                    text: data.output || data.text,
                    provider: 'deepai',
                    model: 'text-generator'
                });
            }
        } catch (deepaiError) {
            console.error('[API] DeepAI failed:', deepaiError.message);
        }

        // ═══════════════════════════════════════════════════════
        // ALL FAILED
        // ═══════════════════════════════════════════════════════
        console.error('[API] ✗ All providers failed');

        return res.status(503).json({
            success: false,
            error: 'ALL_PROVIDERS_FAILED',
            message: 'Semua AI provider sedang tidak tersedia. Silakan coba lagi.'
        });

    } catch (error) {
        console.error('[API] Server error:', error);
        return res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: error.message
        });
    }
}
