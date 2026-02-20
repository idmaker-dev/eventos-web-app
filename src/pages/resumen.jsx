import { Hourglass } from "lucide-react";

export default function Resumen() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-2xl shadow-lg animate-fade-in">
      <Hourglass className="animate-bounce text-Acapulco mb-4" size={48} />
      <h2 className="text-xl sm:text-2xl font-semibold text-casal mb-2 text-center">
        ¡Estamos trabajando en esta sección!
      </h2>
      <p className="text-gray-500 text-center">
        Pronto tendrás acceso a todas las funcionalidades.
      </p>
    </div>
  );
}