// Descarga los datos de visitas de Cloudflare Web Analytics y los guarda en data/.
// Lo ejecuta cada mañana la acción de GitHub .github/workflows/analitica.yml.
//
// Necesita dos variables de entorno (guardadas como secretos en GitHub, nunca en el código):
//   CLOUDFLARE_API_TOKEN  → token con permiso «Account Analytics: Read»
//   CLOUDFLARE_ACCOUNT_ID → identificador de la cuenta de Cloudflare
import fs from 'node:fs';
import path from 'node:path';

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CUENTA = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!TOKEN || !CUENTA) {
  console.error('Faltan CLOUDFLARE_API_TOKEN o CLOUDFLARE_ACCOUNT_ID.');
  process.exit(1);
}

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dia = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
const DESDE = dia(30);
const HASTA = dia(1); // hasta ayer (día completo)

async function consulta(grupo, limite = 50) {
  const query = `query ($cuenta: string!, $desde: Date!, $hasta: Date!) {
    viewer { accounts(filter: { accountTag: $cuenta }) {
      rumPageloadEventsAdaptiveGroups(
        filter: { date_geq: $desde, date_leq: $hasta, bot: 0 }
        limit: ${limite}
        orderBy: [count_DESC]
      ) { count sum { visits } dimensions { ${grupo} } }
    } }
  }`;
  const r = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { cuenta: CUENTA, desde: DESDE, hasta: HASTA } }),
  });
  const j = await r.json();
  if (j.errors?.length) throw new Error(`${grupo}: ${JSON.stringify(j.errors)}`);
  return (j.data?.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups || []).map((g) => ({
    ...g.dimensions,
    paginasVistas: g.count,
    visitas: g.sum?.visits ?? 0,
  }));
}

const [porDia, paginas, procedencia, paises, dispositivos] = await Promise.all([
  consulta('date', 100),
  consulta('requestPath', 50),
  consulta('refererHost', 20),
  consulta('countryName', 20),
  consulta('deviceType', 10),
]);

porDia.sort((a, b) => a.date.localeCompare(b.date));
const total = (xs, k) => xs.reduce((t, x) => t + (x[k] || 0), 0);
const ultimos = (n) => porDia.filter((d) => d.date >= dia(n));

const resumen = {
  actualizado: new Date().toISOString(),
  periodo: { desde: DESDE, hasta: HASTA },
  visitas7d: total(ultimos(7), 'visitas'),
  visitas30d: total(porDia, 'visitas'),
  paginasVistas7d: total(ultimos(7), 'paginasVistas'),
  paginasVistas30d: total(porDia, 'paginasVistas'),
  porDia,
  paginasMasVistas: paginas,
  procedencia,
  paises,
  dispositivos,
};
resumen.paginasPorVisita30d = resumen.visitas30d ? Math.round((resumen.paginasVistas30d / resumen.visitas30d) * 100) / 100 : null;

fs.mkdirSync(path.join(RAIZ, 'data'), { recursive: true });
fs.writeFileSync(path.join(RAIZ, 'data/visitas.json'), JSON.stringify(resumen, null, 2) + '\n');

// Histórico: una línea por día con los totales de ese día
const historico = path.join(RAIZ, 'data/visitas-historico.jsonl');
const previas = fs.existsSync(historico) ? fs.readFileSync(historico, 'utf8').split('\n').filter(Boolean) : [];
const porFecha = new Map(previas.map((l) => [JSON.parse(l).date, l]));
for (const d of porDia) porFecha.set(d.date, JSON.stringify({ date: d.date, visitas: d.visitas, paginasVistas: d.paginasVistas }));
fs.writeFileSync(historico, [...porFecha.keys()].sort().map((k) => porFecha.get(k)).join('\n') + '\n');

console.log(`Visitas 7 d: ${resumen.visitas7d} · 30 d: ${resumen.visitas30d} · páginas/visita: ${resumen.paginasPorVisita30d}`);
