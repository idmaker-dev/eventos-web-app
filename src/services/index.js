// Exportar todos los servicios HTTP desde un solo lugar
import httpService from "./httpService";
import authService from "./authService";
import eventService from "./eventService";
import guestService from "./guestService";
import userService from "./userService";
import whatsappService from "./whatsappService";
import codigoVerificacionService from "./codigoVerificacionService";
import layoutService from "./layoutService";
import layoutEventoService from "./layoutEventoService";
import asignacionService from "./asignacionService";
import ticketsService from "./ticketsService";

export {
  httpService,
  authService,
  eventService,
  guestService,
  userService,
  whatsappService,
  codigoVerificacionService,
  layoutService,
  layoutEventoService,
  asignacionService,
  ticketsService,
};

// También exportar como un objeto por conveniencia
export const services = {
  http: httpService,
  auth: authService,
  event: eventService,
  guest: guestService,
  user: userService,
  whatsapp: whatsappService,
  codigoVerificacion: codigoVerificacionService,
  layout: layoutService,
  layoutEvento: layoutEventoService,
  asignacion: asignacionService,
  tickets: ticketsService,
};

export default services;
