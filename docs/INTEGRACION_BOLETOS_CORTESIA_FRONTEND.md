# Frontend React - Integración Boletos de Cortesía

## 🎨 Componentes para DistribucionMonitor.jsx

### 1. Hook Personalizado para Boletos de Cortesía

```jsx
// hooks/useBoletosCortesia.js
import { useState, useEffect } from "react";
import asignacionService from "../services/asignacionService";

export const useBoletosCortesia = (eventoId) => {
  const [estado, setEstado] = useState({
    total: 0,
    usados: 0,
    disponibles: 0,
    loading: true,
    error: null,
  });

  const fetchEstado = async () => {
    try {
      setEstado((prev) => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(
        `/api/v1/eventos/${eventoId}/boletos-cortesia`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener estado de boletos de cortesía");
      }

      const data = await response.json();

      setEstado({
        total: data.boletos_cortesia,
        usados: data.boletos_usados,
        disponibles: data.boletos_disponibles,
        loading: false,
        error: null,
      });
    } catch (error) {
      setEstado((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  const configurar = async (cantidad) => {
    try {
      const response = await fetch(
        `/api/v1/eventos/${eventoId}/boletos-cortesia`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ cantidad }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al configurar boletos");
      }

      await fetchEstado(); // Refresh
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    if (eventoId) {
      fetchEstado();
    }
  }, [eventoId]);

  return {
    ...estado,
    refresh: fetchEstado,
    configurar,
  };
};
```

---

### 2. Componente de Configuración de Boletos

```jsx
// components/ConfiguradorBoletosCortesia.jsx
import React, { useState } from "react";
import { useBoletosCortesia } from "../hooks/useBoletosCortesia";
import { Ticket, Save, RefreshCw } from "lucide-react";

export const ConfiguradorBoletosCortesia = ({ eventoId }) => {
  const { total, usados, disponibles, loading, error, configurar, refresh } =
    useBoletosCortesia(eventoId);

  const [cantidad, setCantidad] = useState(total);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Actualizar cantidad cuando cambie el total del hook
  React.useEffect(() => {
    setCantidad(total);
  }, [total]);

  const handleGuardar = async () => {
    if (cantidad < 0) {
      setMensaje({ tipo: "error", texto: "La cantidad no puede ser negativa" });
      return;
    }

    if (cantidad < usados) {
      setMensaje({
        tipo: "error",
        texto: `No puedes establecer menos de ${usados} (ya están asignados)`,
      });
      return;
    }

    setGuardando(true);
    setMensaje(null);

    const resultado = await configurar(cantidad);

    setGuardando(false);

    if (resultado.success) {
      setMensaje({
        tipo: "success",
        texto: "Boletos de cortesía configurados exitosamente",
      });
      
      // Auto-ocultar mensaje después de 3 segundos
      setTimeout(() => setMensaje(null), 3000);
    } else {
      setMensaje({ tipo: "error", texto: resultado.error });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Ticket className="w-6 h-6 text-[#246370]" />
          <h3 className="text-lg font-semibold text-gray-800">
            Boletos de Cortesía
          </h3>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Actualizar estado"
        >
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Estado actual */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-600 font-medium mb-1">Total</p>
          <p className="text-2xl font-bold text-blue-700">{total}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-green-600 font-medium mb-1">Disponibles</p>
          <p className="text-2xl font-bold text-green-700">{disponibles}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 font-medium mb-1">Usados</p>
          <p className="text-2xl font-bold text-gray-700">{usados}</p>
        </div>
      </div>

      {/* Input de configuración */}
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 mb-1 block">
            Configurar cantidad total
          </span>
          <input
            type="number"
            min="0"
            value={cantidad}
            onChange={(e) => setCantidad(Math.max(0, Number(e.target.value)))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#246370] focus:border-transparent"
            placeholder="Ej: 20"
            disabled={guardando}
          />
        </label>

        {/* Mensaje de validación */}
        {cantidad < usados && (
          <p className="text-sm text-red-600">
            ⚠️ No puedes establecer menos de {usados} boletos (ya están
            asignados)
          </p>
        )}

        {/* Botón guardar */}
        <button
          onClick={handleGuardar}
          disabled={guardando || cantidad === total}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            guardando || cantidad === total
              ? "bg-gray-300 cursor-not-allowed text-gray-500"
              : "bg-[#246370] hover:bg-[#1d4f5a] text-white"
          }`}
        >
          {guardando ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Configuración
            </>
          )}
        </button>
      </div>

      {/* Mensajes de feedback */}
      {mensaje && (
        <div
          className={`mt-4 p-3 rounded-lg ${
            mensaje.tipo === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <p className="text-sm font-medium">{mensaje.texto}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-800 border border-red-200">
          <p className="text-sm font-medium">❌ {error}</p>
        </div>
      )}
    </div>
  );
};
```

---

### 3. Integración en DistribucionMonitor.jsx

```jsx
// pages/DistribucionMonitor.jsx
import React from "react";
import { ConfiguradorBoletosCortesia } from "../components/ConfiguradorBoletosCortesia";
// ... otros imports

export default function DistribucionMonitor() {
  const { eventoId } = useParams();
  // ... resto del estado

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... Header existente ... */}

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: Layout y controles */}
          <div className="lg:col-span-2 space-y-6">
            {/* Layout del evento */}
            {/* ... componente de layout existente ... */}
          </div>

          {/* Columna derecha: Configuración y estadísticas */}
          <div className="space-y-6">
            {/* 🆕 NUEVO: Configurador de Boletos de Cortesía */}
            <ConfiguradorBoletosCortesia eventoId={eventoId} />

            {/* Estadísticas existentes */}
            {/* ... resto de componentes ... */}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎯 Componente para Asignar Boletos de Cortesía

### 4. Modal de Asignación

```jsx
// components/AsignadorBoletosCortesia.jsx
import React, { useState } from "react";
import { useBoletosCortesia } from "../hooks/useBoletosCortesia";
import SeleccionadorMesas from "./SeleccionadorMesas";
import { X, Ticket, AlertCircle } from "lucide-react";

export const AsignadorBoletosCortesia = ({ eventoId, open, onClose, onSuccess }) => {
  const { disponibles, loading } = useBoletosCortesia(eventoId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#246370] to-[#2a9d8f] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ticket className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              Asignar Boletos de Cortesía
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Info disponibles */}
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-2 text-blue-800">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">
              Boletos disponibles para asignar: <span className="text-lg font-bold">{disponibles}</span>
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 180px)" }}>
          <SeleccionadorMesas
            eventoId={eventoId}
            invitadoId="cortesia"
            nombreInvitado="Boletos de Cortesía"
            permitirAsignacionParcial={true}
            boletosDisponibles={disponibles}
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};
```

---

### 5. Botón para Abrir Asignador

```jsx
// En DistribucionMonitor.jsx o donde corresponda
import { AsignadorBoletosCortesia } from "../components/AsignadorBoletosCortesia";

function DistribucionMonitor() {
  const [modalCortesiaOpen, setModalCortesiaOpen] = useState(false);
  const { disponibles } = useBoletosCortesia(eventoId);

  return (
    <>
      {/* ... resto del componente ... */}
      
      {/* Botón para asignar cortesía */}
      <button
        onClick={() => setModalCortesiaOpen(true)}
        disabled={disponibles === 0}
        className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
      >
        <Ticket className="w-5 h-5" />
        Asignar Cortesía ({disponibles} disponibles)
      </button>

      {/* Modal */}
      <AsignadorBoletosCortesia
        eventoId={eventoId}
        open={modalCortesiaOpen}
        onClose={() => setModalCortesiaOpen(false)}
        onSuccess={() => {
          // Refresh del dashboard o lo que necesites
          console.log("Cortesía asignada exitosamente");
        }}
      />
    </>
  );
}
```

---

## 📡 Servicio API

### 6. Agregar al asignacionService.js

```javascript
// services/asignacionService.js

const asignacionService = {
  // ... métodos existentes ...

  /**
   * Obtiene el estado de boletos de cortesía de un evento
   */
  async obtenerEstadoBoletosCortesia(eventoId) {
    const response = await fetch(`${API_BASE_URL}/eventos/${eventoId}/boletos-cortesia`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener estado de boletos de cortesía");
    }

    return await response.json();
  },

  /**
   * Configura la cantidad de boletos de cortesía
   */
  async configurarBoletosCortesia(eventoId, cantidad) {
    const response = await fetch(`${API_BASE_URL}/eventos/${eventoId}/boletos-cortesia`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify({ cantidad }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al configurar boletos de cortesía");
    }

    return await response.json();
  },

  /**
   * Asigna boletos de cortesía a mesas
   * Usa el mismo endpoint de guardar-admin pero con invitadoId="cortesia"
   */
  async asignarBoletosCortesia(eventoId, seleccionData) {
    return this.guardarSeleccionAdmin(eventoId, "cortesia", seleccionData);
  },

  getToken() {
    return localStorage.getItem("token") || "";
  },
};

export default asignacionService;
```

---

## 🎨 Estilos y UX

### Indicador Visual de Cortesía

```jsx
// Mostrar distintivo visual en las mesas con cortesía
const MesaConCortesia = ({ mesa }) => {
  const tieneCortesia = mesa.asientos.some(
    (a) => a.invitado_numero === "CORTESIA"
  );

  return (
    <div className="relative">
      {/* Mesa normal */}
      <div className="mesa">
        {/* ... contenido de la mesa ... */}
      </div>

      {/* Badge de cortesía */}
      {tieneCortesia && (
        <div className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          <Ticket className="w-3 h-3 inline mr-1" />
          Cortesía
        </div>
      )}
    </div>
  );
};
```

---

## 🧪 Testing Manual

### Flujo de Prueba Completo

```javascript
// 1. Configurar 10 boletos
// UI: Abrir modal, ingresar 10, guardar
// Verificar: Disponibles = 10, Usados = 0

// 2. Asignar 5 boletos
// UI: Abrir asignador, seleccionar Mesa 1 con 5 personas
// Verificar: Disponibles = 5, Usados = 5

// 3. Asignar 3 boletos más
// UI: Abrir asignador nuevamente, seleccionar Mesa 5 con 3 personas
// Verificar: Disponibles = 2, Usados = 8

// 4. Intentar asignar 5 (debe fallar)
// UI: Intentar asignar Mesa 10 con 5 personas
// Verificar: Mensaje de error "No hay suficientes boletos disponibles"

// 5. Descargar Excel
// UI: Click en botón de descarga
// Verificar: Hoja "Por Invitado" muestra "Boletos de Cortesía" con 8 asientos
```

---

## 📦 Resumen de Archivos a Crear/Modificar

### Nuevos Archivos
- ✅ `hooks/useBoletosCortesia.js`
- ✅ `components/ConfiguradorBoletosCortesia.jsx`
- ✅ `components/AsignadorBoletosCortesia.jsx`

### Archivos a Modificar
- ✅ `services/asignacionService.js` - Agregar métodos de cortesía
- ✅ `pages/DistribucionMonitor.jsx` - Integrar configurador y asignador

### Archivos Existentes (Reutilizar)
- ✅ `components/SeleccionadorMesas.jsx` - Ya funciona para cortesía con prop `invitadoId="cortesia"`

---

**✅ Frontend Components Ready**  
**🚀 Implementar en DistribucionMonitor.jsx**  
**🧪 Probar flujo completo antes de producir**
