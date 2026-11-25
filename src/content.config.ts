// Define las colecciones de contenido de la web.
// Cada colección es una carpeta dentro de src/content/ con archivos Markdown (.md).
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Campos comunes a todas las fichas
const base = z.object({
  titulo: z.string(),
  resumen: z.string(), // una o dos frases; aparece en los listados
  fecha: z.coerce.date(),
  etiquetas: z.array(z.string()).default([]),
  borrador: z.boolean().default(false), // true = no se publica
  orden: z.number().optional(), // opcional, para ordenar a mano
});

const coleccion = (carpeta: string, extra = {}) =>
  defineCollection({
    loader: glob({ pattern: '**/*.md', base: `./src/content/${carpeta}` }),
    schema: base.extend(extra),
  });

export const collections = {
  falacias: coleccion('falacias', {
    nombreLatin: z.string().optional(),
    tambienLlamada: z.array(z.string()).default([]),
  }),
  sesgos: coleccion('sesgos'),
  historias: coleccion('historias', {
    epoca: z.string().optional(),
  }),
  libros: coleccion('libros', {
    autor: z.string(),
    anio: z.number().optional(),
  }),
  cuentos: coleccion('cuentos', {
    edad: z.string().optional(), // p. ej. "4-8 años"
  }),
  recursos: coleccion('recursos', {
    archivo: z.string().optional(), // ruta a un descargable dentro de public/
    formato: z.string().optional(),
  }),
};
