// Mide los KPIs internos de la web (contenido, calidad y salud técnica).
//
// Uso:
//   npm run build && node scripts/kpis.mjs            → muestra el informe
//   npm run build && node scripts/kpis.mjs --guardar  → además lo añade a data/kpis-historico.jsonl
//
// Las definiciones y objetivos de cada KPI están en docs/KPIS.md.
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CONTENIDO = path.join(RAIZ, 'src/content');
const DIST = path.join(RAIZ, 'dist');
const HOY = new Date();

// Objetivos (ver docs/KPIS.md)
const OBJ = {
  legibilidad: { ninos: 85, mayores: 75, jovenes: 65, adultos: 55, educadores: 55 },
  fichasPorPublico: 5,
  fichasNuevas30d: 8,
};
const SECCIONES_CON_FUENTES = ['falacias', 'sesgos', 'historias'];
const MARCAS_ACTIVIDAD = /para hablar despu[eé]s|para pensar|c[oó]mo responder|c[oó]mo protegerse|qu[eé] nos ense[nñ]a|actividad/i;

// ---------- utilidades ----------
const leer = (p) => fs.readFileSync(p, 'utf8');
const listar = (dir, ext) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return e.isDirectory() ? listar(p, ext) : p.endsWith(ext) ? [p] : [];
      })
    : [];

function separarFrontmatter(texto) {
  const m = texto.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  return m ? { datos: parseYaml(m[1]) ?? {}, cuerpo: m[2] } : { datos: {}, cuerpo: texto };
}

function textoPlano(md) {
  return md
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s.*$/gm, ' ') // títulos fuera
    .replace(/[*_>`#|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Sílabas en español (aproximación: grupos vocálicos, separando hiatos de vocales fuertes)
function silabas(palabra) {
  const p = palabra.toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
  if (!p) return 0;
  const grupos = p.match(/[aeiouáéíóúü]+/g) || [];
  let n = 0;
  for (const g of grupos) {
    let s = 1;
    for (let i = 1; i < g.length; i++) {
      const a = g[i - 1], b = g[i];
      const fuerte = (c) => 'aeoáéóíú'.includes(c); // í/ú acentuadas rompen diptongo
      if (fuerte(a) && fuerte(b)) s++;
    }
    n += s;
  }
  return Math.max(1, n);
}

// Índice de lectura Fernández-Huerta (0-100; más alto = más fácil)
function fernandezHuerta(texto) {
  const palabras = texto.split(/\s+/).filter((w) => /[a-záéíóúüñ]/i.test(w));
  const frases = texto.split(/[.!?¿¡…:;]+/).filter((f) => f.trim().split(/\s+/).length > 1);
  if (palabras.length < 30) return null;
  const sil = palabras.reduce((t, w) => t + silabas(w), 0);
  const P = (sil / palabras.length) * 100;
  const F = (Math.max(1, frases.length) / palabras.length) * 100;
  return Math.round((206.84 - 0.6 * P - 1.02 * F) * 10) / 10;
}

const media = (xs) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const dias = (d) => Math.floor((HOY - new Date(d)) / 86400000);

// ---------- contenido ----------
const fichas = listar(CONTENIDO, '.md')
  .map((archivo) => {
    const rel = path.relative(CONTENIDO, archivo);
    const [seccion] = rel.split(path.sep);
    const { datos, cuerpo } = separarFrontmatter(leer(archivo));
    const plano = textoPlano(cuerpo);
    return {
      id: rel.replace(/\.md$/, ''),
      seccion,
      datos,
      cuerpo,
      palabras: plano.split(/\s+/).filter(Boolean).length,
      legibilidad: fernandezHuerta(plano),
    };
  })
  .filter((f) => !f.datos.borrador);

const porSeccion = {};
const porPublico = { ninos: 0, mayores: 0, jovenes: 0, adultos: 0, educadores: 0 };
const legPorPublico = { ninos: [], mayores: [], jovenes: [], adultos: [], educadores: [] };
for (const f of fichas) {
  porSeccion[f.seccion] = (porSeccion[f.seccion] || 0) + 1;
  for (const p of f.datos.publico || []) {
    if (p in porPublico) porPublico[p]++;
    if (p in legPorPublico && f.legibilidad != null) legPorPublico[p].push(f.legibilidad);
  }
}

const conFuentesAplicables = fichas.filter((f) => SECCIONES_CON_FUENTES.includes(f.seccion));
const conFuentes = conFuentesAplicables.filter((f) => (f.datos.fuentes || []).length > 0);
const conActividad = fichas.filter((f) => MARCAS_ACTIVIDAD.test(f.cuerpo));
const conPublico = fichas.filter((f) => (f.datos.publico || []).length > 0);

// Enlaces internos entre fichas
const rutas = new Set(fichas.map((f) => `/${f.id}/`));
const enlazadas = new Set();
const enlacesPorFicha = fichas.map((f) => {
  const enlaces = [...f.cuerpo.matchAll(/\]\((\/[a-z0-9-]+\/[a-z0-9-]+\/?)\)/g)].map((m) => m[1].replace(/\/?$/, '/'));
  enlaces.forEach((e) => rutas.has(e) && e !== `/${f.id}/` && enlazadas.add(e));
  return enlaces.length;
});
const huerfanas = fichas.filter((f) => !enlazadas.has(`/${f.id}/`)).map((f) => f.id);

const fechas = fichas.map((f) => new Date(f.datos.fecha)).filter((d) => !isNaN(d));
const ultima = fechas.length ? new Date(Math.max(...fechas)) : null;

// ---------- técnico (web generada) ----------
let tecnico = { paginas: 0, enlacesRotos: [], imagenesSinAlt: 0, sinDescripcion: [] };
if (fs.existsSync(DIST)) {
  const htmls = listar(DIST, '.html');
  const existe = (href) => {
    const limpio = href.split(/[?#]/)[0];
    if (!limpio || limpio === '/') return fs.existsSync(path.join(DIST, 'index.html'));
    const p = path.join(DIST, limpio);
    return fs.existsSync(p) || fs.existsSync(path.join(p, 'index.html')) || fs.existsSync(p + '.html');
  };
  tecnico.paginas = htmls.length;
  for (const h of htmls) {
    const html = leer(h);
    const pagina = '/' + path.relative(DIST, h).replace(/index\.html$/, '');
    for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
      if (!existe(m[1])) tecnico.enlacesRotos.push(`${pagina} → ${m[1]}`);
    }
    tecnico.imagenesSinAlt += [...html.matchAll(/<img(?![^>]*\balt=)[^>]*>/g)].length;
    if (!/<meta name="description" content="[^"]{20,}"/.test(html) && !pagina.includes('404')) tecnico.sinDescripcion.push(pagina);
  }
}

// ---------- resultado ----------
const kpis = {
  fecha: HOY.toISOString().slice(0, 10),
  contenido: {
    totalFichas: fichas.length,
    porSeccion,
    porPublico,
    publicosCubiertos: Object.values(porPublico).filter((n) => n >= OBJ.fichasPorPublico).length,
    fichasNuevas7d: fechas.filter((d) => dias(d) <= 7).length,
    fichasNuevas30d: fechas.filter((d) => dias(d) <= 30).length,
    diasDesdeUltima: ultima ? dias(ultima) : null,
  },
  calidad: {
    pctConFuentes: pct(conFuentes.length, conFuentesAplicables.length),
    sinFuentes: conFuentesAplicables.filter((f) => !conFuentes.includes(f)).map((f) => f.id),
    pctConActividad: pct(conActividad.length, fichas.length),
    pctConPublico: pct(conPublico.length, fichas.length),
    legibilidadPorPublico: Object.fromEntries(Object.entries(legPorPublico).map(([k, v]) => [k, media(v)])),
    legibilidadBajaObjetivo: fichas
      .filter((f) => f.legibilidad != null && (f.datos.publico || []).some((p) => f.legibilidad < OBJ.legibilidad[p]))
      .map((f) => `${f.id} (${f.legibilidad})`),
    enlacesInternosMedios: media(enlacesPorFicha),
    fichasHuerfanas: huerfanas.length,
    palabrasMedias: media(fichas.map((f) => f.palabras)),
  },
  tecnico: {
    paginas: tecnico.paginas,
    enlacesRotos: tecnico.enlacesRotos.length,
    detalleEnlacesRotos: tecnico.enlacesRotos.slice(0, 20),
    imagenesSinAlt: tecnico.imagenesSinAlt,
    paginasSinDescripcion: tecnico.sinDescripcion,
  },
};

// Informe legible
const ok = (c) => (c ? '✅' : '⚠️');
const c = kpis.contenido, q = kpis.calidad, t = kpis.tecnico;
console.log(`# KPIs internos · ${kpis.fecha}

## Contenido
| KPI | Valor | Objetivo |
|---|---|---|
| Fichas publicadas | ${c.totalFichas} | crecer |
| Públicos con ≥${OBJ.fichasPorPublico} fichas | ${c.publicosCubiertos}/5 ${ok(c.publicosCubiertos === 5)} | 5/5 |
| Fichas nuevas (7 d / 30 d) | ${c.fichasNuevas7d} / ${c.fichasNuevas30d} ${ok(c.fichasNuevas30d >= OBJ.fichasNuevas30d)} | ≥${OBJ.fichasNuevas30d} al mes |
| Días desde la última ficha | ${c.diasDesdeUltima} ${ok(c.diasDesdeUltima <= 7)} | ≤7 |

Por sección: ${Object.entries(c.porSeccion).map(([k, v]) => `${k} ${v}`).join(' · ')}
Por público: ${Object.entries(c.porPublico).map(([k, v]) => `${k} ${v}`).join(' · ')}

## Calidad
| KPI | Valor | Objetivo |
|---|---|---|
| Fichas con fuentes (falacias, sesgos, historias) | ${q.pctConFuentes}% ${ok(q.pctConFuentes === 100)} | 100% |
| Fichas con actividad o preguntas finales | ${q.pctConActividad}% ${ok(q.pctConActividad >= 90)} | ≥90% |
| Fichas con público asignado | ${q.pctConPublico}% ${ok(q.pctConPublico === 100)} | 100% |
| Enlaces internos por ficha (media) | ${q.enlacesInternosMedios} ${ok(q.enlacesInternosMedios >= 2)} | ≥2 |
| Fichas huérfanas (nadie las enlaza) | ${q.fichasHuerfanas} ${ok(q.fichasHuerfanas === 0)} | 0 |
| Palabras por ficha (media) | ${q.palabrasMedias} | — |

Legibilidad Fernández-Huerta por público (objetivo: ninos ≥85, mayores ≥75, jovenes ≥65, adultos ≥55):
${Object.entries(q.legibilidadPorPublico).map(([k, v]) => `${k} ${v ?? '—'}`).join(' · ')}
${q.legibilidadBajaObjetivo.length ? 'Por debajo del objetivo: ' + q.legibilidadBajaObjetivo.join(', ') : ''}
${q.sinFuentes.length ? 'Sin fuentes: ' + q.sinFuentes.join(', ') : ''}

## Técnico
| KPI | Valor | Objetivo |
|---|---|---|
| Páginas generadas | ${t.paginas} | — |
| Enlaces internos rotos | ${t.enlacesRotos} ${ok(t.enlacesRotos === 0)} | 0 |
| Imágenes sin texto alternativo | ${t.imagenesSinAlt} ${ok(t.imagenesSinAlt === 0)} | 0 |
| Páginas sin meta descripción | ${t.paginasSinDescripcion.length} ${ok(t.paginasSinDescripcion.length === 0)} | 0 |
${t.detalleEnlacesRotos.length ? '\nEnlaces rotos:\n' + t.detalleEnlacesRotos.map((e) => '- ' + e).join('\n') : ''}
${t.paginas === 0 ? '\n⚠️ No hay carpeta dist/: ejecuta `npm run build` antes.' : ''}`);

if (process.argv.includes('--guardar')) {
  const historico = path.join(RAIZ, 'data/kpis-historico.jsonl');
  fs.mkdirSync(path.dirname(historico), { recursive: true });
  // Una línea por día: si ya hay una de hoy, se sustituye
  const lineas = fs.existsSync(historico) ? leer(historico).split('\n').filter(Boolean) : [];
  const resto = lineas.filter((l) => !l.startsWith(`{"fecha":"${kpis.fecha}"`));
  fs.writeFileSync(historico, [...resto, JSON.stringify(kpis)].join('\n') + '\n');
  console.log(`\nGuardado en data/kpis-historico.jsonl`);
}
