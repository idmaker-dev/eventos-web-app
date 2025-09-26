// Datos de proveedores para el catálogo
export const PROVEEDORES_DATA = [
  {
    id: 1,
    nombre: "Estudio Luna",
    categoria: "Fotografía de Bodas",
    imagen: "/estudio.png",
    favorito: true,
  },
  {
    id: 2,
    nombre: "Delicias Gourmet",
    categoria: "Catering & Banquetes",
    imagen: "",
    favorito: false,
  },
  {
    id: 3,
    nombre: "Jardín Secreto",
    categoria: "Decoración Floral",
    imagen: "./jardin.png",
    favorito: true,
  },
  {
    id: 4,
    nombre: "Armonía Musical",
    categoria: "Música & DJ",
    imagen: "./armonia.png",
    favorito: false,
  },
  {
    id: 5,
    nombre: "Anemone",
    categoria: "Decoración Floral",
    imagen: "./anemone.png",
    favorito: false,
  },
  {
    id: 6,
    nombre: "Estudio Panoramics",
    categoria: "Fotografias de Bodas",
    imagen: "./studio.png",
    favorito: false,
  },
  {
    id: 7,
    nombre: "Producciones Fusión",
    categoria: "Música & DJ",
    imagen: "./producciones.png",
    favorito: false,
  },
  {
    id: 8,
    nombre: "Banquetes Jesse",
    categoria: "Catering & Banquetes",
    imagen: "",
    favorito: false,
  },
];

// Datos de tareas para el calendario
export const TAREAS_DATA = [
  {
    id: 1,
    nombre: "Seleccionar lugar de la ceremonia",
    estado: "completado",
    fecha: "15 Marzo",
  },
  {
    id: 2,
    nombre: "Contratar fotógrafo",
    estado: "completado",
    fecha: "22 Marzo",
  },
  { id: 3, nombre: "Prueba de menú", estado: "en-progreso", fecha: "5 Mayo" },
  {
    id: 4,
    nombre: "Enviar invitaciones",
    estado: "pendiente",
    fecha: "20 Mayo",
  },
  {
    id: 5,
    nombre: "Prueba de vestido final",
    estado: "en-pendiente",
    fecha: "15 Julio",
  },
  { id: 6, nombre: "¡Nuestra Boda!", estado: "pendiente", fecha: "" },
];

// Estados posibles para invitados
export const ESTADOS_INVITADOS = {
  CONFIRMADO: "Confirmado",
  PENDIENTE: "Pendiente",
  RECHAZADO: "Rechazado",
};

// Opciones de parentesco
export const OPCIONES_PARENTESCO = [
  "Familia",
  "Amigo",
  "Trabajo",
  "Universidad",
  "Otro",
];
