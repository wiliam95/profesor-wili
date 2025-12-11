export type ModerationResult = { ok: boolean; reason?: string };

const bannedPatterns: RegExp[] = [
  /\b(hack|ddos|sql injection|xss)\b/i,
  /\b(make.*virus|malware|ransomware)\b/i,
  /\b(personal data|credit card|ssn)\b/i,
];

export const moderateText = (text: string): ModerationResult => {
  const t = (text || '').trim();
  if (!t) return { ok: true };
  for (const re of bannedPatterns) {
    if (re.test(t)) {
      return { ok: false, reason: 'Konten berisiko. Mohon ubah permintaan sesuai kebijakan.' };
    }
  }
  return { ok: true };
};

