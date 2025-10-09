"use client";

import { Check } from "lucide-react";

export function TimelineProgress({ items, title = "Progreso General" }) {
  const completedItems = items.filter((item) => item.status === "completed");
  const inProgressIndex = items.findIndex(
    (item) => item.status === "in-progress"
  );
  const pendingItems = items.filter((item) => item.status !== "completed");
  const progressPercentage = Math.round(
    (completedItems.length / items.length) * 100
  );

  const StatusIcon = ({ status, isLast }) => {
    if (status === "completed") {
      return (
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center z-10 relative">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      );
    }

    if (status === "in-progress") {
      return (
        <div className="w-6 h-6 bg-orange-500 rounded-full z-10 relative border-4 border-white shadow-md">
          <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      );
    }

    if (isLast) {
      return (
        <div className="w-8 h-8 bg-white border-4 border-gray-300 rounded-full z-10 relative shadow-sm"></div>
      );
    }

    return (
      <div className="w-6 h-6 bg-white border-4 border-gray-300 rounded-full z-10 relative shadow-sm"></div>
    );
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "in-progress":
        return "text-orange-500";
      default:
        return "text-gray-400";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "in-progress":
        return "En progreso";
      default:
        return "Programado";
    }
  };

  return (
    <div className="w-full bg-white ">
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex overflow-x-auto  rounded-lg shadow-sm border-2 border-gray-100 w-full">
          <div className="flex-1 ">
            <div className="relative py-20 px-5">
              <div className="absolute -w-full top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2"></div>
              <div
                className="absolute top-1/2 left-0 h-1 bg-green-500 transition-all duration-1000 ease-out transform -translate-y-1/2 rounded-full"
                style={{
                  width: `${
                    ((completedItems.length +
                      (inProgressIndex !== -1 ? 0.5 : 0)) /
                      (items.length - 1)) *
                    100
                  }%`,
                }}
              ></div>

              <div className="flex justify-between items-center relative">
                {items.map((item, index) => {
                  const isLast = index === items.length - 1;
                  const isAbove = index % 2 === 0;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col items-center relative"
                    >
                      <div
                        className={`text-center w-44 ${
                          isAbove ? "mb-12" : "mt-12 order-2"
                        }`}
                      >
                        <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1.5">
                          {item.title}
                        </h3>
                        <div
                          className={`text-xs font-medium ${getStatusText(
                            item.status
                          )}`}
                        >
                          {getStatusLabel(item.status)}
                          {item.date && ` - ${item.date}`}
                        </div>
                        {item.subtitle && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {item.subtitle}
                          </div>
                        )}
                      </div>

                      <div
                        className={`w-px bg-transparent ${
                          isAbove ? "h-12" : "h-12 order-1"
                        }`}
                      ></div>

                      <div
                        className={`absolute top-1/2 transform -translate-y-1/2 ${
                          isAbove ? "" : "order-1"
                        }`}
                      >
                        <StatusIcon status={item.status} isLast={isLast} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="xl:w-80 bg-gray-50 rounded-xl p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
          {title}
        </h2>

        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg
              className="w-32 h-32 transform -rotate-90"
              viewBox="0 0 128 128"
            >
              <circle
                cx="64"
                cy="64"
                r="52"
                stroke="#e5e7eb"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="52"
                stroke="#22c55e"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${
                  2 * Math.PI * 52 * (1 - progressPercentage / 100)
                }`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">
                {progressPercentage}%
              </span>
              <span className="text-sm text-gray-500 font-medium">
                completado
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </div>
            <span className="text-gray-700 text-sm font-medium">
              {completedItems.length} tareas completadas
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-orange-400 rounded-sm bg-orange-50"></div>
            <span className="text-gray-700 text-sm font-medium">
              {pendingItems.length} tareas pendientes
            </span>
          </div>
        </div>
      </div>
      </div>
      
    </div>
  );
}
