// Simula la carga de un formulario desde la base de datos
export function fetchCuestionarioMock() {
  // Este JSON es el que se recibirá de la base de datos
  return Promise.resolve({
    formId: "registro_evento_001",
    title: "Formulario de Registro al Evento",
    description: "Por favor llena tus datos para registrarte al evento.",
    fields: [
      {
        name: "nombre_completo",
        label: "Nombre completo",
        type: "string",
        inputType: "text",
        required: true,
        placeholder: "Ingresa tu nombre completo"
      },
      {
        name: "correo_electronico",
        label: "Correo electrónico",
        type: "string",
        inputType: "email",
        required: true,
        placeholder: "correo@ejemplo.com"
      },
      {
        name: "edad",
        label: "Edad",
        type: "number",
        inputType: "number",
        required: false,
        min: 0,
        max: 120
      },
      {
        name: "genero",
        label: "Género",
        type: "string",
        inputType: "radio",
        required: true,
        options: [
          { value: "masculino", label: "Masculino" },
          { value: "femenino", label: "Femenino" },
          { value: "otro", label: "Otro" }
        ]
      },
      {
        name: "intereses",
        label: "Áreas de interés",
        type: "array",
        inputType: "checkbox",
        required: false,
        options: [
          { value: "tecnologia", label: "Tecnología" },
          { value: "arte", label: "Arte" },
          { value: "deporte", label: "Deporte" },
          { value: "musica", label: "Música" }
        ]
      },
      {
        name: "comentarios",
        label: "Comentarios adicionales",
        type: "string",
        inputType: "textarea",
        required: false,
        placeholder: "Escribe aquí cualquier comentario..."
      },
      {
        name: "acepto_terminos",
        label: "Acepto los términos y condiciones",
        type: "boolean",
        inputType: "checkbox",
        required: true
      }
    ]
  });
}
