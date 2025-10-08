import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { InstallmentsTable } from "../components/PortalPagos/Index.jsx";
import Productos from "../components/PortalPagos/Productos.jsx";
import Navbar from "../components/PortalPagos/Navbar.jsx";
import HistorialPagos from "../components/PortalPagos/HistorialPagos.jsx";
import guestService from "../services/guestService";

export default function PortalPagos() {
  const [activeTab, setActiveTab] = useState("cuotas");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Obtener invitado_id desde los parámetros de la URL
  const { invitadoId } = useParams();
  const navigate = useNavigate();

  const cuotasRef = useRef(null);
  const productosRef = useRef(null);
  const historialRef = useRef(null);

  // Cargar datos del dashboard
  useEffect(() => {
    // Validar que existe invitadoId
    if (!invitadoId) {
      setError("ID de invitado no proporcionado");
      setLoading(false);
      return;
    }

    const cargarDashboard = async () => {
      setLoading(true);
      setError(null);
      
      const resultado = await guestService.getGuestDashboard(invitadoId);
      
      if (resultado.success) {
        setDashboardData(resultado.data);
      } else {
        console.error("Error al cargar dashboard:", resultado.error);
        setError(resultado.error || "Error al cargar la información del invitado");
      }
      setLoading(false);
    };

    cargarDashboard();
  }, [invitadoId]);

  useEffect(() => {
    const scrollContainer = document.getElementById('scroll-container');
    
    const handleScroll = () => {
      if (!scrollContainer || !cuotasRef.current || !productosRef.current || !historialRef.current) return;
      
      const scrollTop = scrollContainer.scrollTop;
      const containerTop = scrollContainer.offsetTop;
      
      const cuotasTop = cuotasRef.current.offsetTop - containerTop;
      const productosTop = productosRef.current.offsetTop - containerTop;
      const historialTop = historialRef.current.offsetTop - containerTop;      

      const offset = 100;
      
      if (scrollTop + offset >= historialTop) {
        setActiveTab("historial");
      } else if (scrollTop + offset >= productosTop) {
        setActiveTab("productos");
      } else if (scrollTop + offset >= cuotasTop) {
        setActiveTab("cuotas");
      }
    };

    scrollContainer?.addEventListener("scroll", handleScroll);
    
    handleScroll();
    
    return () => scrollContainer?.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionRef, tabName) => {
    if (!sectionRef.current) return;
    
    const scrollContainer = document.getElementById('scroll-container');
    if (!scrollContainer) return;
    
    const containerTop = scrollContainer.offsetTop;
    const targetTop = sectionRef.current.offsetTop - containerTop;

    setActiveTab(tabName);
    
    scrollContainer.scrollTo({
      top: targetTop - 20,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#eaf0f6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-casal mx-auto mb-4"></div>
          <p className="text-casal font-semibold">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#eaf0f6]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-casal text-white px-6 py-2 rounded-lg hover:bg-casal/80 transition-colors"
            >
              Regresar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#eaf0f6]">
      <Navbar invitado={dashboardData?.invitado} />
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-2 lg:px-8 py-6 flex-shrink-0">
        <p className="text-casal text-base font-normal">
          Recuerda que puedes adelantar la fecha de liquidación de pago y esto
          te pondrá en un mejor lugar de turno de selección de mesas. No
          compartir la Cuenta CLABE, es única para cada alumno. Matiz
          Producciones no se hace responsable de transferencias realizadas por
          parte de otras personas a esta cuenta
        </p>
        <div className="border border-t my-6 border-gray-300"></div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-2 lg:px-8 flex-shrink-0 bg-[#eaf0f6] z-10">
        <nav className="mb-4 flex gap-8 border-b border-gray-300">
          <button
            onClick={() => scrollToSection(cuotasRef, "cuotas")}
            className={`pb-4 text-sm font-medium transition-colors relative ${
              activeTab === "cuotas"
                ? "text-casal font-semibold"
                : "text-casal hover:text-gray-700"
            }`}
          >
            Mis Cuotas
            {activeTab === "cuotas" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-casal transition-all duration-300" />
            )}
          </button>
          <button
            onClick={() => scrollToSection(productosRef, "productos")}
            className={`pb-4 text-sm font-medium transition-colors relative ${
              activeTab === "productos"
                ? "text-casal font-semibold"
                : "text-casal hover:text-gray-700"
            }`}
          >
            Mis Productos
            {activeTab === "productos" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-casal transition-all duration-300" />
            )}
          </button>
          <button
            onClick={() => scrollToSection(historialRef, "historial")}
            className={`pb-4 text-sm font-medium transition-colors relative ${
              activeTab === "historial"
                ? "text-casal font-semibold"
                : "text-casal hover:text-gray-700"
            }`}
          >
            Historial de Pagos
            {activeTab === "historial" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-casal transition-all duration-300" />
            )}
          </button>
        </nav>
      </div>

      <div
        id="scroll-container"
        className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full px-4 sm:px-2 lg:px-8"
      >
        <div ref={cuotasRef} className="mb-16 pt-8" id="cuotas-section">
          <h2 className="text-2xl font-semibold text-casal mb-6">
            Mis Cuotas
          </h2>
          <InstallmentsTable 
            cuotas={dashboardData?.cuotas || []}
            resumen={dashboardData?.resumen}
            invitadoId={invitadoId}
          />
        </div>

        <div ref={productosRef} className="mb-16 pt-8" id="productos-section">
          <h2 className="text-2xl font-semibold text-casal mb-6">
            Mis Productos
          </h2>
          <Productos 
            producto={dashboardData?.producto}
            invitado={dashboardData?.invitado}
            cuotas={dashboardData?.cuotas || []}
          />
        </div>

        <div ref={historialRef} className="mb-16 pt-8" id="historial-section">
          <h2 className="text-2xl font-semibold text-casal mb-6">
            Historial de Pagos
          </h2>
          <HistorialPagos 
            pagos={dashboardData?.historial_pagos || []}
          />
        </div>
      </div>
    </div>
  );
}