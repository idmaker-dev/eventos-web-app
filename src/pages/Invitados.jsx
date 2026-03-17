import { React, useState } from "react";
import "../styles/pages/Invitados.css";
import useInvitados from "../hooks/useInvitados";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  Listbox,
} from "@headlessui/react";
import {
  Check,
  ChevronDownIcon,
  Plus,
  Trash2,
  UserPlusIcon,
  X,
} from "lucide-react";
import { Button, Input, Select } from "@headlessui/react";

export default function Invitados() {
  const {
    filtro,
    setFiltro,
    buscar,
    setBuscar,
    paginaActual,
    setPaginaActual,
    invitadosPagina,
    totalPaginas,
    handleEliminar,
    modalOpen,
    setModalOpen,
    nuevoInvitado,
    setNuevoInvitado,
    handleGuardar,
    totalConfirmados,
    totalPendientes,
    totalRechazados,
    totalInvitados,
  } = useInvitados();


  return (
    <div className="py-6 px-4 bg-white min-h-screen">
      {/* Encabezado */}
      <div className="header-invitados">
        <div>
          <p className="text-[#af0d89] text-3xl font-semibold">
            Lista de graduados
          </p>
          <p className="subtitulo">
            Las personas especiales que compartirán nuestro día
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Contenedor tabla */}
        <div className="flex-1">
          {/* Filtro y buscador */}
          <div className="flex justify-between items-center mb-8">
            <Button
              className="bg-[#af0d89]/10 text-[#af0d89] rounded-full flex items-center"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="w-9 h-7 bg-[#af0d89] text-white rounded-full px-1" />{" "}
              <span className="mx-4">Añadir graduado</span>
            </Button>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 relative">
                <label className="text-base text-[#af0d89]">
                  Filtrar por estado:{" "}
                </label>
                <Select
                  className="border bg-white appearance-none border-gray-300 rounded-full px-4 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-[#af0d89]/50"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  <option value="Confirmado">Confirmados</option>
                  <option value="Pendiente">Pendientes</option>
                  <option value="Rechazado">Rechazados</option>
                </Select>
                <ChevronDownIcon
                  className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                  aria-hidden="true"
                />
              </div>
              <div className="">
                <Input
                  type="text"
                  className="border border-gray-300 rounded-full px-4 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-[#af0d89]/50"
                  placeholder="Buscar"
                  value={buscar}
                  onChange={(e) => setBuscar(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div>
            <table className="rounded-xl overflow-hidden shadow-lg min-w-full ">
              <thead>
                <tr className="text-left text-sm text-gray-700 px-4 rounded-t-xl">
                  <th className="font-medium p-3">Nombre completo</th>
                  <th className="font-medium p-3">Estatus</th>
                  <th className="font-medium p-3">Parentesco</th>
                  <th className="font-medium p-3">Número de WhatsApp</th>
                  <th className="font-medium p-3">Correo electrónico</th>
                  <th className="font-medium p-3">Atención humana</th>
                  <th className="font-medium p-3">
                    Restricciones alimenticias
                  </th>
                  <th className="font-medium p-3"></th>
                </tr>
              </thead>
              <tbody>
                {invitadosPagina.map((invitado, idx) => (
                  <tr
                    key={invitado.id}
                    className={idx % 2 === 0 ? "bg-gray-100 px-4" : "bg-white"}
                  >
                    <td className="px-4 py-3 font-light">{invitado.nombre}</td>
                    <td className="px-4 py-3 font-light">
                      <span
                        className={
                          `px-3 py-1 rounded-full text-xs font-bold ` +
                          (invitado.estado === "Confirmado"
                            ? "bg-[#eaf8e3] text-[#2ebd30]"
                            : invitado.estado === "Pendiente"
                            ? "bg-[#ffefd0] text-[#e2a518]"
                            : invitado.estado === "Rechazado"
                            ? "bg-[#fdd8db] text-[#e23936]"
                            : "bg-gray-200 text-gray-500")
                        }
                      >
                        {invitado.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-light">
                      {invitado.parentesco}
                    </td>
                    <td className="px-4 py-3 font-light">
                      {invitado.whatsapp}
                    </td>
                    <td className="px-4 py-3 font-light">{invitado.correo}</td>
                    <td className="px-4 py-3 font-light">
                      <span
                        className={`px-7 py-1 rounded-full text-xs font-bold ${
                          invitado.atencion === "Sí"
                            ? "bg-[#E0B165] text-black"
                            : "bg-[#CBCBCB] text-gray-800"
                        }`}
                      >
                        {invitado.atencion}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-light">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          invitado.restricciones === "Sí"
                            ? "bg-[#E0B165] text-black"
                            : "bg-[#CBCBCB] text-gray-800"
                        }`}
                      >
                        {invitado.restricciones}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        className="text-red-400 hover:text-red-600"
                        onClick={() => handleEliminar(invitado.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-end gap-4 mt-6">
            <span className="text-gray-400 text-base mr-2">
              Registros por página
            </span>
            <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
              {/* Botón Anterior */}
              <button
                className={`px-4 py-0 text-gray-500 ${
                  paginaActual === 1
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-gray-100"
                }`}
                onClick={() =>
                  paginaActual > 1 && setPaginaActual(paginaActual - 1)
                }
                disabled={paginaActual === 1}
              >
                Anterior
              </button>
              {/* Números de página */}
              {Array.from({ length: totalPaginas }).map((_, index) => {
                // Lógica para mostrar solo los primeros, últimos, actual y puntos suspensivos
                if (
                  index === 0 ||
                  index === totalPaginas - 1 ||
                  (index >= paginaActual - 2 && index <= paginaActual + 1)
                ) {
                  return (
                    <button
                      key={index}
                      className={`w-10 h-7 text-center border-r border-gray-300 last:border-none ${
                        paginaActual === index + 1
                          ? "bg-[#af0d89] text-white font-bold"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setPaginaActual(index + 1)}
                    >
                      {index + 1}
                    </button>
                  );
                }
                // Puntos suspensivos
                if (
                  (index === paginaActual - 3 && paginaActual > 4) ||
                  (index === paginaActual + 2 &&
                    paginaActual < totalPaginas - 3)
                ) {
                  return (
                    <span
                      key={index}
                      className="w-10 h-7 flex items-center justify-center text-gray-400"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}
              {/* Botón Siguiente */}
              <button
                className={`px-4 py-0 text-gray-500 ${
                  paginaActual === totalPaginas
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-gray-100"
                }`}
                onClick={() =>
                  paginaActual < totalPaginas &&
                  setPaginaActual(paginaActual + 1)
                }
                disabled={paginaActual === totalPaginas}
              >
                Siguiente
              </button>
            </div>
          </div>

          {modalOpen && (
            <Dialog
              open={modalOpen}
              as="div"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 "
              onClose={() => setModalOpen(false)}
            >
              <div className="flex min-h-full items-center justify-center p-4 w-full">
                <DialogPanel className="w-full max-w-lg rounded-xl bg-white shadow-2xl py-4">
                  <DialogTitle
                    as="h3"
                    className="text-xl font-bold text-[#af0d89] mb-4"
                  >
                    <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 py-2 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <UserPlusIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <DialogTitle
                            as="h3"
                            className="text-2xl font-bold text-foreground"
                          >
                            Añadir Graduado
                          </DialogTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Completa la información del nuevo graduado
                          </p>
                        </div>
                      </div>
                      <Button  onClick={() => {
                        setModalOpen(false);
                      }} className="absolute right-6 top-6 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-ring">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </DialogTitle>
                  <form className="px-8 py-4 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <Input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#af0d89]/50"
                      placeholder="Nombre completo"
                      value={nuevoInvitado.nombre}
                      onChange={(e) =>
                        setNuevoInvitado({
                          ...nuevoInvitado,
                          nombre: e.target.value,
                        })
                      }
                    />
                    <div className="relative">
                      <Select
                        className="w-full border bg-white appearance-none border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#af0d89]/50"
                        value={nuevoInvitado.estado}
                        onChange={(e) =>
                          setNuevoInvitado({
                            ...nuevoInvitado,
                            estado: e.target.value,
                          })
                        }
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Confirmado">Confirmado</option>
                        <option value="Rechazado">Rechazado</option>
                      </Select>
                      <ChevronDownIcon
                        className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                        aria-hidden="true"
                      />
                    </div>

                    <Input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#af0d89]/50"
                      placeholder="Parentesco"
                      value={nuevoInvitado.parentesco}
                      onChange={(e) =>
                        setNuevoInvitado({
                          ...nuevoInvitado,
                          parentesco: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#af0d89]/50"
                      placeholder="WhatsApp"
                      value={nuevoInvitado.whatsapp}
                      onChange={(e) =>
                        setNuevoInvitado({
                          ...nuevoInvitado,
                          whatsapp: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#af0d89]/50"
                      placeholder="Correo electrónico"
                      value={nuevoInvitado.correo}
                      onChange={(e) =>
                        setNuevoInvitado({
                          ...nuevoInvitado,
                          correo: e.target.value,
                        })
                      }
                    />
                    <div className="flex gap-2 items-center relative">
                      <label className="font-medium text-gray-700">
                        Atención humana:
                      </label>
                      <Select
                        className="border bg-white border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#af0d89]/50"
                        value={nuevoInvitado.atencion}
                        onChange={(e) =>
                          setNuevoInvitado({
                            ...nuevoInvitado,
                            atencion: e.target.value,
                          })
                        }
                      >
                        <option value="No">No</option>
                        <option value="Sí">Sí</option>
                      </Select>
                    </div>
                    <div className="flex gap-2 items-center">
                      <label className="font-medium text-gray-700">
                        Restricciones alimenticias:
                      </label>
                      <Select
                        className="border border-gray-300 bg-white rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#af0d89]/50"
                        value={nuevoInvitado.restricciones}
                        onChange={(e) =>
                          setNuevoInvitado({
                            ...nuevoInvitado,
                            restricciones: e.target.value,
                          })
                        }
                      >
                        <option value="No">No</option>
                        <option value="Sí">Sí</option>
                      </Select>
                    </div>
                  </form>
                  <div className="flex justify-end gap-3 mt-8 px-4">
                    <Button
                      type="button"
                      className="bg-[#af0d89] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#c94cae] transition"
                      onClick={handleGuardar}
                    >
                      Guardar
                    </Button>
                    <Button
                      type="button"
                      className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                      onClick={() => {
                        setModalOpen(false);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </DialogPanel>
              </div>
            </Dialog>
          )}
        </div>

        {/* Panel lateral */}
        <div className="xl:w-80 flex flex-col md:flex-row lg:flex-col justify-center">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <p className="text-gray-800 font-semibold text-2xl">
              Progreso General
            </p>
            <div className="flex gap-5">
              <div className="flex items-center">
                <div className="bg-lime-100 rounded-full p-1">
                  <Check className="w-10 h-10 text-lime-600" />
                </div>
              </div>
              <div>
                <span className="text-lime-500 text-4xl font-semibold">
                  {totalConfirmados}
                </span>
                <p className="text-gray-400 text-base">Confirmados</p>
              </div>
            </div>
            <div className="flex gap-5 mt-6">
              <div className="flex items-center">
                <div className="bg-orange-100 rounded-full p-2 w-12 h-12 flex items-center justify-center">
                  <div className="w-7 h-7 bg-orange-600 rounded-full"></div>
                </div>
              </div>
              <div>
                <span className="text-orange-500 text-4xl font-semibold">
                  {totalPendientes}
                </span>
                <p className="text-gray-400 text-base">Pendientes</p>
              </div>
            </div>
            <div className="flex gap-5 mt-6">
              <div className="flex items-center">
                <div className="bg-red-100 rounded-full p-1">
                  <X className="w-10 h-10 text-red-600" />
                </div>
              </div>
              <div>
                <span className="text-red-500 text-4xl font-semibold">
                  {totalRechazados}
                </span>
                <p className="text-gray-400 text-base">Rechazados</p>
              </div>
            </div>
          </div>

          <div className="p-6 mt-4">
            <p className="text-gray-600 text-xl font-semibold">
              Graduados confirmados
            </p>
            <p className="font-semibold">
              <span className="text-[#e0b165] text-4xl">
                {totalConfirmados}
              </span>
              <span className="total-numero"> de {totalInvitados}</span>
            </p>
            <button className="link-button underline">
              Ver Gráfico de RSVP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
