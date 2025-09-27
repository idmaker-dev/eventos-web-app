// Exportar todos los servicios HTTP desde un solo lugar
import httpService from "./httpService";
import authService from "./authService";
import eventService from "./eventService";
import guestService from "./guestService";
import userService from "./userService";

export { httpService, authService, eventService, guestService, userService };

// También exportar como un objeto por conveniencia
export const services = {
  http: httpService,
  auth: authService,
  event: eventService,
  guest: guestService,
  user: userService,
};

export default services;
