import React from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  Circle,
  CircleDashed,
  DoorOpen,
  RectangleHorizontal,
  SquareDashed,
  Square,
  ChevronDown,
  Grid3x3,
} from "lucide-react";
import { Button } from "@headlessui/react";

export default function DesignTools({ agregarElemento, onAgregarMesasMultiples }) {
  return (
    <div className="top-24 right-2 w-62 text-right flex items-center gap-3">
      <Menu>
        <MenuButton className="inline-flex  items-center gap-2 border rounded-md bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm/6 font-semibold text-gray-700 dark:text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-700 data-open:bg-gray-700">
          Herramientas de Diseño
          <ChevronDown className="size-4 fill-white/60" />
        </MenuButton>

        <MenuItems
          transition
          anchor="bottom end"
          className="w-52 mt-2 origin-top-right rounded-xl border border-gray-200 dark:border-gray-500 bg-white dark:bg-gray-800 p-1 text-sm/6 text-gray-700 dark:text-white  transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0 z-50 shadow-lg"
        >
          <MenuItem>
            <Button
              onClick={() => agregarElemento("mesa")}
              className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Circle className="size-4 fill-white/30" />
              Mesa Redonda
            </Button>
          </MenuItem>
          <MenuItem>
            <Button
              onClick={() => agregarElemento("mesaRectangular")}
              className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <RectangleHorizontal className="size-4 fill-white/30 " />
              Mesa Rectangular
            </Button>
          </MenuItem>
          <MenuItem>
            <Button
              onClick={() => agregarElemento("pistaBaileRedonda")}
              className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <CircleDashed className="size-4 fill-white/50" />
              Pista Redonda
            </Button>
          </MenuItem>
          <MenuItem>
            <Button
              onClick={() => agregarElemento("pistaBaileRectangular")}
              className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="w-5 h-4 border-gray-500 dark:fill-white/50 border-2 rounded border-dashed"></div>
              Pista Rectangular
            </Button>
          </MenuItem>
          <MenuItem>
            <Button
              onClick={() => agregarElemento("pistaBaileCuadrada")}
              className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <SquareDashed className="size-4 fill-white/50" />
              Pista Cuadrada
            </Button>
          </MenuItem>
          <MenuItem>
            <Button
              onClick={() => agregarElemento("barra")}
              className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <SquareDashed className="size-4 fill-white/30" />
              Barra
            </Button>
          </MenuItem>
          <MenuItem>
            <Button
              onClick={() => agregarElemento("buffet")}
              className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <SquareDashed className="size-4 fill-white/30" />
              Buffet
            </Button>
          </MenuItem>
          <MenuItem>
            <Button
              onClick={() => agregarElemento("escenario")}
              className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Square className="size-4 fill-white/30" />
              Escenario
            </Button>
          </MenuItem>
          <MenuItem>
            <Button
              onClick={() => agregarElemento("entrada")}
              className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <DoorOpen className="size-4 fill-white/30" />
              Entrada
            </Button>
          </MenuItem>
          
          <div className="my-1 h-px bg-gray-200 dark:bg-gray-600" />
          
          <MenuItem>
            <Button
              onClick={onAgregarMesasMultiples}
              className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10 hover:bg-gray-100 dark:hover:bg-gray-700 bg-casal/10 dark:bg-casal/20 font-semibold"
            >
              <Grid3x3 className="size-4" />
              Agregar Mesas Múltiples
            </Button>
          </MenuItem>
        </MenuItems>
      </Menu>
    </div>
  );
}
