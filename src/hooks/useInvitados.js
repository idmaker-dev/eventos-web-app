import { useState, useEffect } from "react";

export default function useInvitados() {
  const [filtro, setFiltro] = useState("Todos");
  const [buscar, setBuscar] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 3;

  const [invitados, setInvitados] = useState(() => {
    const dataGuardada = localStorage.getItem("invitados");
    return dataGuardada ? JSON.parse(dataGuardada) : [];
  });

  useEffect(() => {
    localStorage.setItem("invitados", JSON.stringify(invitados));
  }, [invitados]);

  const handleEliminar = (id) => {
    const nuevosInvitados = invitados.filter((i) => i.id !== id);
    setInvitados(nuevosInvitados);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoInvitado, setNuevoInvitado] = useState({
    nombre: "",
    estado: "Pendiente",
    parentesco: "",
    whatsapp: "",
    correo: "",
    atencion: "No",
    restricciones: "No",
  });

  const handleGuardar = () => {
    setInvitados([...invitados, { ...nuevoInvitado, id: Date.now() }]);
    setNuevoInvitado({
      nombre: "",
      estado: "Pendiente",
      parentesco: "",
      whatsapp: "",
      correo: "",
      atencion: "No",
      restricciones: "No",
    });
    setModalOpen(false);
  };

  const invitadosFiltrados = invitados.filter((i) => {
    const coincideFiltro = filtro === "Todos" || i.estado === filtro;
    const coincideBusqueda = i.nombre
      .toLowerCase()
      .includes(buscar.toLowerCase());
    return coincideFiltro && coincideBusqueda;
  });

  const totalPaginas = Math.ceil(
    invitadosFiltrados.length / registrosPorPagina
  );
  const indiceInicial = (paginaActual - 1) * registrosPorPagina;
  const indiceFinal = indiceInicial + registrosPorPagina;
  const invitadosPagina = invitadosFiltrados.slice(indiceInicial, indiceFinal);

  const totalConfirmados = invitados.filter(
    (i) => i.estado === "Confirmado"
  ).length;
  const totalPendientes = invitados.filter(
    (i) => i.estado === "Pendiente"
  ).length;
  const totalRechazados = invitados.filter(
    (i) => i.estado === "Rechazado"
  ).length;
  const totalInvitados = invitados.length;

  return {
    filtro,
    setFiltro,
    buscar,
    setBuscar,
    paginaActual,
    setPaginaActual,
    registrosPorPagina,
    invitados,
    setInvitados,
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
  };
}
