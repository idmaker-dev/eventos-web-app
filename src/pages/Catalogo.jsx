import React from "react";
import "../styles/pages/Catalogo.css";
import useCatalogo from "../hooks/useCatalogo";
import { Heart } from "lucide-react";

export default function Catalogo() {
  const {
    filtro,
    setFiltro,
    modalItem,
    setModalItem,
    toggleFavorito,
    itemsFiltrados,
  } = useCatalogo();

  return (
    <div className="bg-white min-h-screen pb-10 pt-2">
      <div className="catalogo-container bg-white max-w-7xl mx-auto">
        <div className="catalogo-filtros">
          <button
          className={filtro === "Todos" ? "activo" : ""}
          onClick={() => setFiltro("Todos")}
        >
          Todos
        </button>
        <button
          className={filtro === "Favoritos" ? "activo" : ""}
          onClick={() => setFiltro("Favoritos")}
        >
          Favoritos
        </button>
        <button
          className={filtro === "Seleccionados" ? "activo" : ""}
          onClick={() => setFiltro("Seleccionados")}
        >
          Seleccionados
        </button>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {itemsFiltrados.map((item) => (
          <div key={item.id} className="relative ">
            <div className="">
              {item.imagen ? (
                <img src={item.imagen} alt={item.nombre} className="w-full h-[200px] object-cover rounded-lg" />
              ) : (
                <div className="w-full h-[200px] bg-[#f0e6dd] rounded-lg flex items-center justify-center text-gray-400">Sin imagen</div>
              )}
              <span
                className={`favorito ${item.favorito ? "activo" : ""}`}
                onClick={() => toggleFavorito(item.id)}
              >
                <Heart />
              </span>
            </div>
            <div className="my-4">
              <div className="flex justify-between items-center">
                <div className="">
                  <p className="text-lg font-semibold">{item.nombre}</p>
                  <p className="text-gray-500 my-0">{item.categoria}</p>
                </div>
                <button
                  className="px-4 py-1 bg-[#f0e6dd] text-grey rounded-3xl hover:bg-[#d5a372] hover:text-white transition "
                  onClick={() => setModalItem(item)}
                >
                  Ver Perfil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalItem && (
        <div className="modal-overlay" onClick={() => setModalItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setModalItem(null)}>
              ×
            </span>
            <h2>{modalItem.nombre}</h2>
            <p>{modalItem.categoria}</p>
            {modalItem.imagen ? (
              <img
                src={modalItem.imagen}
                alt={modalItem.nombre}
                className="modal-img"
              />
            ) : (
              <div className="placeholder">Sin imagen</div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>  
  );
}
