export const runSandbox = async (code: string, timeoutMs: number = 1500): Promise<string> => {
  return await Promise.race<string>([
    new Promise((resolve) => setTimeout(() => resolve('Timeout'), timeoutMs)),
    new Promise((resolve) => {
      try {
        const result = Function(`"use strict"; ${code}`)();
        resolve(String(result));
      } catch (e: any) {
        resolve(`Error: ${e?.message || 'runtime error'}`);
      }
    })
  ]);
};

