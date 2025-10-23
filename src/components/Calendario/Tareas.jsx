import React from "react";
import { CheckCircle2, Circle, Calendar, Check } from "lucide-react";
import clsx from "clsx";
export default function Tareas({ items, title }) {
  const completedItems = items.filter((item) => item.status === "completed");
  const inProgressIndex = items.findIndex(
    (item) => item.status === "in-progress"
  );
  const pendingItems = items.filter((item) => item.status !== "completed");
  const progressPercentage = Math.round(
    (completedItems.length / items.length) * 100
  );
  const isCompleted = items.status === "completed";
  return (
    <div className="w-full">
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex w-full">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                className={clsx(
                  "group relative overflow-hidden transition-all duration-300 hover:shadow-lg rounded-xl",
                  "border-2 cursor-pointer p-5 ",
                  item.status === "completed" && "bg-green-50 border-green-200",
                  item.status === "in-progress" &&
                    "bg-white border-gray-200 hover:border-orange-400",
                  item.status === "scheduled" &&
                    "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                {/* onClick={() => onToggle?.(id)} */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {item.status === "completed" && (
                      <CheckCircle2 className="h-6 w-6 text-green-600 transition-transform group-hover:scale-110" />
                    )}
                    {item.status === "in-progress" && (
                      <Circle className="h-6 w-6 transition-all text-orange-600 group-hover:scale-110" />
                    )}
                    {item.status === "scheduled" && (
                      <Circle className="h-6 w-6 text-gray-400 transition-all group-hover:text-gray-500 group-hover:scale-110" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={clsx(
                        "text-base font-medium leading-relaxed transition-colors",
                        item.status === "completed" &&
                          "text-gray-500 line-through",
                        item.status === "in-progress" && "text-orange-600",
                        item.status === "scheduled" &&
                          "text-gray-700 group-hover:text-gray-900"
                      )}
                    >
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-3">
                      <Calendar className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-sm text-gray-600 font-medium">
                        {item.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={clsx(
                    "absolute bottom-0 left-0 h-1 w-full transition-all duration-300",
                    item.status === "completed" && "bg-green-500",
                    item.status === "in-progress" &&
                      "bg-orange-500/0 group-hover:bg-orange-500",
                    item.status === "scheduled" &&
                      "bg-gray-300/0 group-hover:bg-gray-400"
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="md:w-80 bg-gray-50 rounded-xl p-6 border border-gray-100">
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
