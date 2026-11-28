# Sine Fallaciis

Web sobre pensamiento crítico: **sinefallaciis.com**

Falacias, sesgos, historias reales, libros, cuentos para niños y recursos descargables para aprender a
pensar mejor.

## Cómo está organizada

Todo el contenido está en `src/content/`, una carpeta por sección. Cada ficha es un archivo Markdown (`.md`),
el mismo formato que Obsidian.

| Carpeta | Sección |
|---|---|
| `src/content/falacias/` | Falacias |
| `src/content/sesgos/` | Sesgos cognitivos |
| `src/content/historias/` | Historias y casos reales |
| `src/content/libros/` | Libros recomendados |
| `src/content/cuentos/` | Minicuentos para niños |
| `src/content/recursos/` | Fichas y descargables |

Los archivos para descargar (PDF, imágenes…) van en `public/descargables/`.

## Añadir una ficha

Crea un archivo `.md` en la carpeta de la sección. El nombre del archivo será la dirección de la página
(`hombre-de-paja.md` → `sinefallaciis.com/falacias/hombre-de-paja/`). Empieza con esta cabecera:

```markdown
---
titulo: Título de la ficha
resumen: Una o dos frases que aparecen en los listados.
fecha: 2026-11-25
etiquetas: [etiqueta1, etiqueta2]
borrador: false   # true = no se publica todavía
---

Aquí va el texto.
```

Campos comunes opcionales: `publico` (edades: `ninos`, `mayores`, `jovenes`, `adultos`, `educadores`) y
`fuentes` (lista de referencias).

Campos extra según la sección: `nombreLatin` y `tambienLlamada` (falacias), `autor` y `anio` (libros),
`edad` (cuentos), `epoca` (historias), `archivo` y `formato` (recursos).

## Para desarrolladores

Hecha con [Astro](https://astro.build).

```bash
npm install      # instalar dependencias (solo la primera vez)
npm run dev      # ver la web en local: http://localhost:4321
npm run build    # generar la web final en dist/
npm run kpis     # medir los KPIs (después de build)
npm run lighthouse  # auditoría de calidad técnica
```

## Mejora continua

La web se revisa a diario siguiendo `CLAUDE.md`. Estrategia en `docs/ESTRATEGIA.md`, indicadores en
`docs/KPIS.md`, pendientes en `docs/BACKLOG.md` e historial en `docs/DIARIO.md`.
