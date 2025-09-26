import { useState } from "react";
import { PROVEEDORES_DATA } from "../utils/constants";

export default function useCatalogo() {
  const [favoritos, setFavoritos] = useState(PROVEEDORES_DATA);
  const [filtro, setFiltro] = useState("Todos");
  const [modalItem, setModalItem] = useState(null);

  const toggleFavorito = (id) => {
    setFavoritos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, favorito: !item.favorito } : item
      )
    );
  };

  const itemsFiltrados =
    filtro === "Todos"
      ? favoritos
      : filtro === "Favoritos"
      ? favoritos.filter((item) => item.favorito)
      : favoritos;

  return {
    favoritos,
    filtro,
    setFiltro,
    modalItem,
    setModalItem,
    toggleFavorito,
    itemsFiltrados,
  };
}
