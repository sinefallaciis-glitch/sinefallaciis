# Sine Fallaciis — instrucciones para Claude y sus agentes

Web sobre pensamiento crítico para todas las edades: **https://sinefallaciis.com**.
Propietario: Miguel (no programador; explícale las cosas sin jerga). Idioma: **español de España**.

Lee antes de trabajar: `docs/ESTRATEGIA.md` (qué y para quién), `docs/KPIS.md` (cómo se mide),
`docs/BACKLOG.md` (qué toca) y las últimas entradas de `docs/DIARIO.md` (qué se hizo).

## Cómo está hecha

- **Astro** (web estática). Contenido en Markdown en `src/content/<sección>/<ficha>.md`; el esquema de campos
  está en `src/content.config.ts` y se explica en `README.md`.
- Cada *push* a `main` en GitHub (`sinefallaciis-glitch/sinefallaciis`) lo publica **Cloudflare Workers** solo,
  en 1-2 minutos. **Todo lo que llega a `main` es público.**
- Comandos: `npm install`, `npm run build`, `npm run kpis -- --guardar`, `npm run lighthouse`.

## Flujo de la revisión diaria

1. **Medir**: `npm install && npm run build && npm run kpis -- --guardar && npm run lighthouse`.
   Compara con la línea anterior de `data/kpis-historico.jsonl`.
2. **Escuchar**: revisa las *issues* abiertas del repositorio (sugerencias y errores de lectores) con `gh issue list`
   si está disponible. Un error de contenido reportado tiene prioridad máxima.
3. **Elegir**: 1 a 3 mejoras del backlog que más muevan los KPIs en rojo. Mejor poco y bien que mucho y flojo.
4. **Hacer** con agentes (ver «Roles»). Toda ficha nueva o con datos cambiados pasa por el revisor de rigor.
5. **Comprobar**: `npm run build` sin errores, KPIs técnicos en verde, revisa visualmente las páginas tocadas
   (captura con Chrome sin cabeza si está disponible) y que los enlaces nuevos funcionan.
6. **Publicar**: commit con mensaje claro en español y *push* a `main` (o rama + *pull request* si requiere aprobación).
7. **Registrar**: añade la entrada del día arriba en `docs/DIARIO.md` (hecho, KPIs antes→después, siguiente paso)
   y actualiza `docs/BACKLOG.md` (quita lo hecho, añade ideas nuevas con prioridad).
8. **Informar** a Miguel con un resumen breve: qué ha cambiado en la web, KPIs clave y si necesita decidir algo.

## Roles (agentes)

Usa subagentes independientes para que el trabajo no se corrija a sí mismo:

- **Redactor**: escribe o mejora fichas siguiendo la guía de estilo y el público indicado.
- **Revisor de rigor** (subagente que NO ha visto la redacción): verifica cada dato con búsquedas web y fuentes
  fiables, comprueba que las fuentes existen y dicen lo que se afirma, y que no hay texto copiado. Si algo no se
  puede verificar, se quita o se suaviza. Ninguna ficha con datos se publica sin su visto bueno.
- **Revisor pedagógico**: comprueba que el texto encaja con la edad (vocabulario, longitud, legibilidad, tono sin
  sermón) y que el final invita a pensar.
- **QA técnico**: compilación, enlaces, accesibilidad, aspecto en móvil.

## Guía de estilo

- Una idea central por ficha. Estructura de falacias: Qué es · Ejemplo · Cómo detectarla · Cómo responder
  (+ caja con matiz). Sesgos: Qué es · Ejemplo · Por qué ocurre · Cómo protegerse.
- Ejemplos **cotidianos y no partidistas** (casa, cole, trabajo, publicidad, redes). Nada de política de partidos,
  religión o colectivos concretos como blanco de ejemplos.
- Cuentos (peques): 300-600 palabras, personajes con nombre, frases cortas, repetición y ritmo, algo de humor,
  final que resuelve el misterio **mostrando** la idea (sin moraleja explícita). Siempre «Para hablar después» y
  una caja para adultos. Nada de miedo, violencia o humillación.
- 9-12: misterios, retos y acertijos; 500-900 palabras.
- Adolescentes: directos, sin paternalismo, ejemplos de redes y publicidad.
- Adultos: rigor y fuentes; aplicación práctica.
- Cada ficha termina con algo que hacer: preguntas, actividad o forma de responder.
- Rellena siempre: `titulo`, `resumen` (≤25 palabras), `fecha`, `publico`, `etiquetas` y, si hay datos, `fuentes`.
- Enlaza al menos 2 fichas relacionadas con enlaces internos (`[hombre de paja](/falacias/hombre-de-paja/)`).
- Nombre del archivo: minúsculas, sin tildes, con guiones (`pendiente-resbaladiza.md`).

## Qué se publica directamente y qué necesita a Miguel

**Directo a `main`** (tras las comprobaciones): fichas nuevas, mejoras de texto, correcciones, enlaces internos,
mejoras técnicas, de accesibilidad y SEO, ajustes visuales pequeños, páginas de navegación nuevas.

**Rama + *pull request* y aviso a Miguel** (no se fusiona sin su permiso): rediseños visibles, secciones nuevas
en el menú, borrar contenido publicado, cualquier tema políticamente sensible, servicios externos o con coste,
cambios de dominio, licencia o cuentas, recoger datos de usuarios, y cualquier cosa que dudes.

## Límites

- Nunca subas secretos, contraseñas ni datos personales de Miguel o de terceros.
- Nada de imágenes ajenas: solo creadas por nosotros (SVG/CSS) o con licencia libre verificada y citada.
- No reproduzcas fragmentos de libros, letras o artículos; resume con palabras propias.
- No rompas URLs existentes; si una ficha cambia de nombre, mantén redirección.
- Si la compilación falla y no sabes arreglarlo, no publiques: deja la rama y avisa a Miguel.
