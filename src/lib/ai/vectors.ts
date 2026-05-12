/** Cosine similarity for embedding arrays (JSON-stored vectors). */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

export function parseEmbedding(json: unknown): number[] | null {
  if (!Array.isArray(json)) return null;
  const nums = json.filter((x): x is number => typeof x === "number");
  return nums.length === json.length ? nums : null;
}
