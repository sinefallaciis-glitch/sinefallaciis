# KPIs de Sine Fallaciis

Los KPIs sirven para decidir **qué mejorar cada día**. Se miden con:

```bash
npm run build
npm run kpis -- --guardar   # KPIs internos → data/kpis-historico.jsonl
npm run lighthouse          # calidad técnica (si hay navegador)
```

## Indicador principal (North Star)

**Fichas de calidad disponibles por público**: nº de públicos (de 5) con al menos 5 fichas que cumplen
todos los criterios de calidad. Cuando haya analítica (fase 4), pasará a ser **lecturas semanales de fichas**.

## 1. Contenido (crecimiento)

| KPI | Objetivo | Por qué importa |
|---|---|---|
| Fichas publicadas | Crecer cada semana | Más herramientas para pensar |
| Públicos con ≥5 fichas | 5/5 | La web es para todas las edades |
| Fichas nuevas en 30 días | ≥8 | Ritmo sostenido |
| Días desde la última ficha | ≤7 | La web está viva |

## 2. Calidad

| KPI | Objetivo | Por qué importa |
|---|---|---|
| Fichas con fuentes (falacias, sesgos, historias) | 100% | Rigor: predicar con el ejemplo |
| Fichas con actividad o preguntas finales | ≥90% | Pasar de leer a pensar |
| Fichas con público asignado | 100% | Que cada cual encuentre lo suyo |
| Legibilidad Fernández-Huerta | peques ≥85 · 9-12 ≥75 · adolescentes ≥65 · adultos ≥55 | Adaptado a cada edad |
| Enlaces internos por ficha | ≥2 | Una idea lleva a otra |
| Fichas huérfanas | 0 | Ninguna ficha queda escondida |
| Errores de contenido reportados y sin resolver | 0 a los 7 días | Corregir es parte del método |

La legibilidad Fernández-Huerta (0-100) es la adaptación al español del índice de Flesch: cuanto más alto,
más fácil de leer. Es orientativa: un texto puede tener buena puntuación y ser malo. La revisión humana o
del agente revisor manda.

## 3. Técnico

| KPI | Objetivo |
|---|---|
| Compilación sin errores | Siempre |
| Enlaces internos rotos | 0 |
| Imágenes sin texto alternativo | 0 |
| Páginas sin meta descripción | 0 |
| Lighthouse: rendimiento, accesibilidad, buenas prácticas, SEO | ≥95 en todas |

## 4. Audiencia

Cloudflare Web Analytics está activo (sin cookies, respetuoso con la privacidad). Cada mañana la acción de GitHub
«Analítica diaria» (`.github/workflows/analitica.yml` + `scripts/analitica.mjs`) descarga los datos a
`data/visitas.json` y `data/visitas-historico.jsonl`, y `npm run kpis` los incluye en el informe.
Necesita los secretos `CLOUDFLARE_API_TOKEN` (solo lectura de analítica) y `CLOUDFLARE_ACCOUNT_ID` en GitHub.

| KPI | Objetivo inicial |
|---|---|
| Visitantes únicos semanales | Establecer línea base y crecer |
| Páginas vistas por visita | ≥2 |
| Fichas más y menos leídas | Revisar cada semana |
| Procedencia (buscadores, redes, directo) | Diversificar |
| Sugerencias y errores recibidos (GitHub Issues) | Responder en ≤7 días |

## Cómo se usan

1. Cada día se miden los KPIs y se comparan con el día anterior (`data/kpis-historico.jsonl`).
2. Se elige la mejora con más impacto sobre los KPIs en rojo (⚠️), siguiendo `docs/BACKLOG.md`.
3. Se apunta en `docs/DIARIO.md` qué se hizo y cómo cambió cada KPI.
4. Una vez al mes se revisan los objetivos: si alguno se cumple siempre, se sube el listón.
