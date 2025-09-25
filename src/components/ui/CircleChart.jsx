import React from "react";

/*Función para calcular el porcentaje de cada segmento (para el circulo)*/
export const calcularSegmento = (valor, total) =>
  total > 0 ? (valor / total) * 100 : 0;

/*Componente del circulo*/
export const CircleChart = ({ confirmados, pendientes, rechazados }) => {
  const total = confirmados + pendientes + rechazados;

  return (
    <div className="circle-chart">
      <svg width="120" height="120" viewBox="0 0 36 36" className="donut">
        <circle
          className="circle-segment confirmados"
          cx="18"
          cy="18"
          r="15.9155"
          strokeDasharray={`${calcularSegmento(confirmados, total)} ${
            100 - calcularSegmento(confirmados, total)
          }`}
          strokeDashoffset="25"
        />

        <circle
          className="circle-segment pendientes"
          cx="18"
          cy="18"
          r="15.9155"
          strokeDasharray={`${calcularSegmento(pendientes, total)} ${
            100 - calcularSegmento(pendientes, total)
          }`}
          strokeDashoffset={25 - calcularSegmento(confirmados, total)}
        />

        <circle
          className="circle-segment rechazados"
          cx="18"
          cy="18"
          r="15.9155"
          strokeDasharray={`${calcularSegmento(rechazados, total)} ${
            100 - calcularSegmento(rechazados, total)
          }`}
          strokeDashoffset={
            25 -
            (calcularSegmento(confirmados, total) +
              calcularSegmento(pendientes, total))
          }
        />
      </svg>

      <div className="circle-text flex flex-col items-center justify-center mt-5">
        <strong className="text-5xl">{confirmados}</strong>
        <span>de {total}</span>
      </div>
    </div>
  );
};

export default CircleChart;
