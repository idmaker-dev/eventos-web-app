// Simula la carga del formulario de registro de boletos desde la base de datos
export function fetchRegistroBoletosMock() {
  return Promise.resolve({
    formId: "evento_boletos_2025", // usando eventoId como formId
    tipo: "registro",
    title: "Registro de Boletos UNAM",
    description: "Por favor completa los datos de los asistentes",
    fields: [
      {
        name: "nombre_asistente",
        label: "Nombre del asistente",
        type: "string",
        inputType: "text",
        required: true,
        placeholder: "Ej. Juan Pérez",
      },
      {
        name: "telefono",
        label: "Teléfono de contacto",
        type: "string",
        inputType: "tel",
        required: true,
        verificar: true,
        placeholder: "Ej. 5512345678",
      },
      {
        name: "cantidad_boletos",
        label: "Cantidad de boletos",
        type: "number",
        inputType: "number",
        required: true,
        min: 1,
        placeholder: "Número de boletos",
      },
      {
        name: "restricciones_alimenticias",
        label: "Restricciones alimenticias",
        type: "string",
        inputType: "text",
        required: false,
        placeholder: "Especifique si aplica",
      },
      {
        name: "invitados_veganos",
        label: "¿Hay invitados veganos?",
        type: "boolean",
        inputType: "checkbox",
        required: false,
        options: [
          {
            value: "si",
            label: "Sí",
          },
        ],
      },
    ],
    activo: true,
    id: "mfoi7j7vbe0ffnpfm",
    createdAt: "2025-09-17T21:38:37.963Z",
    updatedAt: "2025-09-17T21:38:37.963Z",
  });
}
