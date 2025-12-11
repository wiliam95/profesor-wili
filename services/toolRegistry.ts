type Schema = { required?: string[] };
type Tool = { name: string; run: (args: any) => Promise<string>; schema?: Schema };
const tools: Record<string, Tool> = {};

const validate = (schema: Schema | undefined, args: any): string | null => {
  if (!schema) return null;
  if (schema.required) {
    for (const k of schema.required) { if (!(k in (args||{}))) return `Arg '${k}' wajib`; }
  }
  return null;
};

export const registerDefaultTools = () => {
  tools['calc'] = { name: 'calc', schema: { required: ['expr'] }, run: async (args) => {
    const expr = String(args?.expr || '0');
    const result = Function(`return (${expr.replace(/\^/g,'**')})`)();
    return String(result);
  }};
  tools['web'] = { name: 'web', schema: { required: ['q'] }, run: async (args) => {
    const q = String(args?.q || '');
    const { searchWeb } = await import('./webSearch');
    const items = await searchWeb(q, 5);
    return items.map((it:any)=>`- [${it.title}](${it.link}) — ${it.source}`).join('\n') || 'Tidak ada hasil';
  }};
};

export const runTool = async (name: string, args: any): Promise<string> => {
  if (!Object.keys(tools).length) registerDefaultTools();
  const t = tools[name];
  if (!t) throw new Error(`Tool tidak ditemukan: ${name}`);
  const err = validate(t.schema, args);
  if (err) throw new Error(err);
  return await t.run(args);
};
