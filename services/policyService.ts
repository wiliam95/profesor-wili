export type PolicyIssue = { category: string; message: string };

const policies = [
  { re: /\b(personal data|credit card|ssn)\b/i, category: 'privacy', message: 'Jangan meminta/menyebarkan data pribadi.' },
  { re: /\b(violence|hate speech)\b/i, category: 'safety', message: 'Konten kekerasan/kebencian tidak diizinkan.' },
];

export const checkPolicy = (text: string): PolicyIssue[] => {
  const issues: PolicyIssue[] = [];
  const t = text || '';
  for (const p of policies) {
    if (p.re.test(t)) issues.push({ category: p.category, message: p.message });
  }
  return issues;
};

