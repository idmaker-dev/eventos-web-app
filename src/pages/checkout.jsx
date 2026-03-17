"use client";

import { Button } from "@headlessui/react";
import {
  ArrowLeft,
  Copy,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import logo from "../assets/recursos/logoTentativo2.svg";
import Navbar from "../components/PortalPagos/Navbar.jsx";
import { Tooltip } from "../components/ui/Tooltip.jsx";
import guestService from "../services/guestService";

export default function Checkout({ totalAmount = 0, onBack }) {
  const [copiedField, setCopiedField] = useState(null);
  const [clabeData, setClabeData] = useState(null);
  const [invitadoData, setInvitadoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const { invitadoId } = useParams();
  
  // Obtener el total desde el state de navegación o usar el prop
  const total = location.state?.total || totalAmount || 0;

  // Cargar información de CLABE
  useEffect(() => {
    const cargarDatos = async () => {
      if (!invitadoId) {
        setError("ID de graduado no proporcionado");
        setLoading(false);
        return;
      }

      setLoading(true);
      const resultado = await guestService.getGuestClabe(invitadoId);
      
      if (resultado.success) {
        setClabeData(resultado.data.clabe_account);
        setInvitadoData(resultado.data.invitado);
      } else {
        console.error("Error al cargar CLABE:", resultado.error);
        setError(resultado.error || "Error al cargar la información de pago");
      }
      setLoading(false);
    };

    cargarDatos();
  }, [invitadoId]);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eaf0f6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-casal mx-auto mb-4"></div>
          <p className="text-casal font-semibold">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eaf0f6]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              to={`/PortalPagos/${invitadoId}`}
              className="inline-block bg-casal text-white px-6 py-2 rounded-lg hover:bg-casal/80 transition-colors"
            >
              Regresar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 bg-[#eaf0f6]">
      <Navbar invitado={invitadoData} />
      <div className="relative">
        <Link
          to={`/PortalPagos/${invitadoId}`}
          className="absolute top-4 left-4 mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Volver</span>
        </Link>

        <div className="w-full max-w-xl mx-auto mt-4  py-6 px-8 bg-white rounded-lg shadow-md flex flex-col">
          <h2 className="mb-8 text-center text-xl font-semibold text-gray-900">
            Datos para transferencia
          </h2>

          <div className="mb-6 flex items-center justify-between rounded-lg bg-gray-50 px-6 py-4">
            <span className="text-sm text-gray-600">Total a pagar</span>
            <span className="text-xl font-semibold text-gray-900">
              $
              {total.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <p className="mb-6 text-center text-sm text-gray-600">
            Para transferir debes ingresar a tu banco y agregar como
            destinatario a{" "}
            <span className="font-semibold text-gray-900">
              {clabeData?.beneficiario || "Matiz Producciones"}
            </span>
            .
          </p>

          <div className="mb-6 space-y-4 rounded-lg border border-gray-200 p-6">
            {/* Beneficiary */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-600">Beneficiario</span>
                <span className="text-sm font-medium text-gray-900">
                  {clabeData?.beneficiario || "Matiz Producciones"}
                </span>
              </div>
              <Tooltip
                content={copiedField === "beneficiary" ? "¡Copiado!" : "Copiar"}
                show={copiedField === "beneficiary" ? true : undefined}
                position="top"
              >
                <Button
                  onClick={() =>
                    copyToClipboard(clabeData?.beneficiario || "Matiz Producciones", "beneficiary")
                  }
                  className="h-8 w-8 flex justify-center items-center hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>

            {/* CLABE Account */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-600">Cuenta CLABE</span>
                <span className="text-sm font-medium text-gray-900">
                  {clabeData?.clabe || "Cargando..."}
                </span>
              </div>
              <Tooltip
                content={copiedField === "clabe" ? "¡Copiado!" : "Copiar"}
                show={copiedField === "clabe" ? true : undefined}
                position="top"
              >
                <Button
                  onClick={() => copyToClipboard(clabeData?.clabe || "", "clabe")}
                  disabled={!clabeData?.clabe}
                  className="h-8 w-8 flex justify-center items-center hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>

            {/* Bank */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-600">Banco</span>
                <span className="text-sm font-medium text-gray-900">
                  {clabeData?.banco || "STP"}
                </span>
              </div>
              <Tooltip
                content={copiedField === "bank" ? "¡Copiado!" : "Copiar"}
                show={copiedField === "bank" ? true : undefined}
                position="top"
              >
                <Button
                  onClick={() => copyToClipboard(clabeData?.banco || "STP", "bank")}
                  className="h-8 w-8 flex justify-center items-center hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>
          </div>

          <div className="mb-8 flex gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-600" />
            <div className="text-sm text-orange-900">
              <span className="font-semibold">
                No debes compartir la cuenta CLABE;
              </span>{" "}
              es exclusiva para ti. {clabeData?.beneficiario || "Matiz Producciones"} no se hará responsable de
              pagos externos realizados a esta cuenta.
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <ShieldCheck className="h-8 w-7 text-orange-400" />
            <span>
              Todas las transacciones se realizan bajo un sistema seguro
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-6">
        <img src={logo} alt="Logo" className="w-32 h-full" />
      </div>
    </div>
  );
}
