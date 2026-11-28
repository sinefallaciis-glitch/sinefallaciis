// Secciones de la web: nombre, descripción y orden en el menú.
// Para añadir una sección nueva: créala aquí, en src/content.config.ts
// y como carpeta en src/content/.
export const secciones = [
  {
    id: 'falacias',
    nombre: 'Falacias',
    singular: 'Falacia',
    descripcion: 'Trampas del razonamiento: qué son, cómo reconocerlas y cómo responder.',
  },
  {
    id: 'sesgos',
    nombre: 'Sesgos',
    singular: 'Sesgo',
    descripcion: 'Atajos de la mente que nos hacen equivocarnos de forma predecible.',
  },
  {
    id: 'historias',
    nombre: 'Historias',
    singular: 'Historia',
    descripcion: 'Casos reales en los que pensar bien (o mal) cambió las cosas.',
  },
  {
    id: 'libros',
    nombre: 'Libros',
    singular: 'Libro',
    descripcion: 'Lecturas recomendadas para entrenar el pensamiento crítico.',
  },
  {
    id: 'cuentos',
    nombre: 'Cuentos',
    singular: 'Cuento',
    descripcion: 'Minicuentos para leer con niños y hablar después.',
  },
  {
    id: 'recursos',
    nombre: 'Recursos',
    singular: 'Recurso',
    descripcion: 'Fichas, guías y material descargable para casa o clase.',
  },
] as const;

export type SeccionId = (typeof secciones)[number]['id'];

export const getSeccion = (id: string) => secciones.find((s) => s.id === id)!;

// Públicos (edades) a los que se dirige el contenido
export const publicos = {
  ninos: 'Peques (hasta 8 años)',
  mayores: 'Niños de 9 a 12',
  jovenes: 'Adolescentes',
  adultos: 'Adultos',
  educadores: 'Familias y docentes',
} as const;
