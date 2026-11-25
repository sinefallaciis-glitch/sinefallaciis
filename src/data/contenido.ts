// Funciones para leer el contenido publicado de cada sección
import { getCollection } from 'astro:content';
import { secciones, type SeccionId } from './secciones';

/** Fichas publicadas de una sección (sin borradores), ordenadas. */
export async function fichasDe(id: SeccionId) {
  const fichas = await getCollection(id, ({ data }) => !data.borrador);
  return fichas.sort((a, b) => {
    if (a.data.orden != null && b.data.orden != null) return a.data.orden - b.data.orden;
    if (a.data.orden != null) return -1;
    if (b.data.orden != null) return 1;
    return a.data.titulo.localeCompare(b.data.titulo, 'es');
  });
}

/** Las últimas fichas publicadas de todas las secciones. */
export async function ultimasFichas(n = 6) {
  const todas = (await Promise.all(secciones.map((s) => fichasDe(s.id)))).flat();
  return todas.sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime()).slice(0, n);
}

export const formatoFecha = (d: Date) =>
  d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
