import React from "react";
import Navbar from "../components/AsiganacionUser/Navbar";
import AsignacionUser from "../components/AsiganacionUser/AsiganacionUser";
import ModalBienvenida from "../components/AsiganacionUser/ModalBienvenida";
import { useState } from "react";

export default function AsignacionUserPage() {
  let [isOpen, setIsOpen] = useState(true);
  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <div className="bg-fondoVs">
      <Navbar />
      <AsignacionUser />
      <ModalBienvenida open={isOpen} close={close} />
    </div>
  );
}
