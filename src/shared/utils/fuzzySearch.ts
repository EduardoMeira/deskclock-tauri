/**
 * Retorna true se todos os caracteres de `query` aparecem em ordem em `target`.
 * Exemplo: "prjx" bate em "Projeto X", "gck" bate em "Gerenciamento".
 */
export function fuzzyMatch(query: string, target: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}
