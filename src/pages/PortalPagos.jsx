import { useState, useEffect, useRef } from "react";
import { InstallmentsTable } from "../components/PortalPagos/Index.jsx";
import Productos from "../components/PortalPagos/Productos.jsx";
import Navbar from "../components/PortalPagos/Navbar.jsx";
import HistorialPagos from "../components/PortalPagos/HistorialPagos.jsx";
import { Nav } from "react-day-picker";

export default function PortalPagos() {
  const [activeTab, setActiveTab] = useState("cuotas");

  const cuotasRef = useRef(null);
  const productosRef = useRef(null);
  const historialRef = useRef(null);

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

  return (
    <div className="h-screen flex flex-col bg-[#eaf0f6]">
      <Navbar />
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
          <InstallmentsTable />
        </div>

        <div ref={productosRef} className="mb-16 pt-8" id="productos-section">
          <h2 className="text-2xl font-semibold text-casal mb-6">
            Mis Productos
          </h2>
          <Productos />
        </div>

        <div ref={historialRef} className="mb-16 pt-8" id="historial-section">
          <h2 className="text-2xl font-semibold text-casal mb-6">
            Historial de Pagos
          </h2>
          <HistorialPagos />
        </div>
      </div>
    </div>
  );
}