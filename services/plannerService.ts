import { runTool } from './toolRegistry';

export const planAndRun = async (goal: string): Promise<string> => {
  const steps: string[] = [];
  if (/\bsearch\b|\bcari\b/i.test(goal)) steps.push('web');
  if (/\bcalc\b|\bhitung\b/i.test(goal)) steps.push('calc');
  if (!steps.length) steps.push('web');
  const outputs: string[] = [];
  for (const s of steps) {
    try {
      const out = await runTool(s, s === 'web' ? { q: goal } : { expr: '2+2' });
      outputs.push(`Step(${s}):\n${out}`);
    } catch (e: any) {
      outputs.push(`Step(${s}) gagal: ${e?.message || 'error'}`);
    }
  }
  return `### 🧭 Planner\n\nGoal: ${goal}\n\n${outputs.join('\n\n')}`;
};

