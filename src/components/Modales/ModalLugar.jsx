import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Input,
  Textarea,
} from "@headlessui/react";
import clsx from "clsx";
import { X, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix para los iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function ModalLugar({ open, onClose, lugar, onGuardar, isLoading }) {
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    numero_contacto: "",
    latitud: null,
    longitud: null,
  });

  const [errors, setErrors] = useState({});
  const [mostrarMapa, setMostrarMapa] = useState(false);

  // Componente para manejar clics en el mapa
  function MapClickHandler({ onLocationSelect }) {
    useMapEvents({
      click: (e) => {
        onLocationSelect(e.latlng);
      },
    });
    return null;
  }

  // Cargar datos del lugar si está en modo edición
  useEffect(() => {
    if (lugar) {
      setFormData({
        nombre: lugar.nombre || "",
        direccion: lugar.direccion || "",
        numero_contacto: lugar.numero_contacto || "",
        latitud: lugar.latitud || null,
        longitud: lugar.longitud || null,
      });
    } else {
      setFormData({
        nombre: "",
        direccion: "",
        numero_contacto: "",
        latitud: null,
        longitud: null,
      });
    }
    setErrors({});
    setMostrarMapa(false);
  }, [lugar, open]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLocationSelect = (latlng) => {
    setFormData((prev) => ({
      ...prev,
      latitud: latlng.lat,
      longitud: latlng.lng,
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es requerido";
    }

    if (!formData.direccion.trim()) {
      nuevosErrores.direccion = "La dirección es requerida";
    }

    if (!formData.numero_contacto.trim()) {
      nuevosErrores.numero_contacto = "El número de contacto es requerido";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = () => {
    if (validarFormulario()) {
      onGuardar(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: "",
      direccion: "",
      numero_contacto: "",
      latitud: null,
      longitud: null,
    });
    setErrors({});
    setMostrarMapa(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      as="div"
      className="relative z-50 focus:outline-none"
      onClose={handleClose}
    >
      <div className="fixed inset-0 z-50 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-3xl rounded-xl bg-white dark:bg-[#1a1a1a] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-2xl font-semibold text-[#246370] dark:text-[#2a9d8f]">
              {lugar ? "Editar lugar" : "Crear nuevo lugar"}
            </DialogTitle>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <DialogTitle className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-4">
            {lugar
              ? "Actualiza la información del lugar"
              : "Completa los datos para registrar un nuevo lugar"}
          </DialogTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Columna izquierda - Formulario */}
            <div className="space-y-4">
              <Field>
                <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300 mb-2">
                  Nombre del lugar *
                </label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Ejemplo: Salón Jardín Las Palmas"
                  disabled={isLoading}
                  className={clsx(
                    "block w-full rounded-lg border-2 bg-white/5 px-3 py-2 text-sm dark:text-white text-gray-700",
                    "placeholder:italic",
                    "focus:outline-none focus:ring-2 focus:ring-[#246370] focus:border-transparent",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    errors.nombre && "border-red-500"
                  )}
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
                )}
              </Field>

              <Field>
                <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300 mb-2">
                  Dirección completa *
                </label>
                <Textarea
                  value={formData.direccion}
                  onChange={(e) => handleInputChange("direccion", e.target.value)}
                  placeholder="Ejemplo: Av. Reforma 123, Col. Centro, Ciudad de México, CP 06000"
                  disabled={isLoading}
                  rows={3}
                  className={clsx(
                    "block w-full rounded-lg border-2 bg-white/5 px-3 py-2 text-sm dark:text-white text-gray-700",
                    "placeholder:italic",
                    "focus:outline-none focus:ring-2 focus:ring-[#246370] focus:border-transparent",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    errors.direccion && "border-red-500"
                  )}
                />
                {errors.direccion && (
                  <p className="mt-1 text-sm text-red-500">{errors.direccion}</p>
                )}
              </Field>

              <Field>
                <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300 mb-2">
                  Número de contacto *
                </label>
                <Input
                  value={formData.numero_contacto}
                  onChange={(e) =>
                    handleInputChange("numero_contacto", e.target.value)
                  }
                  placeholder="Ejemplo: +52 55 1234 5678"
                  disabled={isLoading}
                  className={clsx(
                    "block w-full rounded-lg border-2 bg-white/5 px-3 py-2 text-sm dark:text-white text-gray-700",
                    "placeholder:italic",
                    "focus:outline-none focus:ring-2 focus:ring-[#246370] focus:border-transparent",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    errors.numero_contacto && "border-red-500"
                  )}
                />
                {errors.numero_contacto && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.numero_contacto}
                  </p>
                )}
              </Field>

              {/* Coordenadas (readonly) */}
              <div className="grid grid-cols-2 gap-2">
                <Field>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Latitud
                  </label>
                  <Input
                    value={formData.latitud !== null ? formData.latitud.toFixed(6) : ""}
                    readOnly
                    placeholder="Selecciona en el mapa"
                    className="block w-full rounded-lg border-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-400"
                  />
                </Field>
                <Field>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Longitud
                  </label>
                  <Input
                    value={formData.longitud !== null ? formData.longitud.toFixed(6) : ""}
                    readOnly
                    placeholder="Selecciona en el mapa"
                    className="block w-full rounded-lg border-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-400"
                  />
                </Field>
              </div>
            </div>

            {/* Columna derecha - Mapa */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Ubicación en el mapa
              </label>
              
              <button
                type="button"
                onClick={() => setMostrarMapa(!mostrarMapa)}
                className="w-full px-3 py-2 text-sm bg-[#72B7A4]/20 text-[#246370] dark:text-[#2a9d8f] rounded-lg hover:bg-[#72B7A4]/30 transition font-semibold"
              >
                {mostrarMapa ? "Ocultar mapa" : "Mostrar mapa para seleccionar ubicación"}
              </button>

              {mostrarMapa && (
                <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                  <MapContainer
                    center={
                      formData.latitud && formData.longitud
                        ? [formData.latitud, formData.longitud]
                        : [19.4326, -99.1332] // Ciudad de México por defecto
                    }
                    zoom={13}
                    style={{ height: "350px", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapClickHandler onLocationSelect={handleLocationSelect} />
                    {formData.latitud && formData.longitud && (
                      <Marker position={[formData.latitud, formData.longitud]} />
                    )}
                  </MapContainer>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                Haz clic en el mapa para seleccionar la ubicación exacta del lugar
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-[#72B7A4] text-white font-semibold hover:bg-[#5fa090] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                lugar ? "Actualizar" : "Crear lugar"
              )}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
