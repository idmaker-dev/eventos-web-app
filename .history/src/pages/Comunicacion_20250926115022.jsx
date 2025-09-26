import { Input } from "@headlessui/react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import clsx from "clsx";
import CrearCuestionarioPages from "../components/Comunicacion/CrearCuestionarioPages";
import ConfigurarRespuesta from "../components/Comunicacion/ConfigurarRespuesta";
import React from "react";

export default function Comunicacion() {
    return (
        <div className="p-6 bg-white dark:bg-fodoBlack rounded-3xl shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-0">Módulo de comunicación</h1>
                    <p className="text-gray-500 dark:text-gray-200">
                        Configuración de conversaciones y del Bot de preguntas Frecuentes (FAQ).
                    </p>
                </div>
                <div>
                    <Input
                        type="text"
                        placeholder="Buscar..."
                        className={clsx(
                            'mt-3 block w-full md:w-60 rounded-3xl border bg-white/5 px-3 py-1.5 text-sm/6 text-white',
                            'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
                        )}
                    />
                </div>
            </div>
            <div className="">
                <TabGroup>
                    <TabList className="flex gap-4">
                        <Tab className={({ selected }) =>
                            clsx(
                                "rounded-full px-3 py-1 text-sm/6 font-semibold",
                                "focus:outline-none transition",
                                selected
                                    ? "bg-casal text-white shadow dark:bg-casal"
                                    : "hover:bg-white/15 text-grey dark:text-gray-600 bg-porcelain"
                            )
                        }>Configurar respuestas</Tab>
                        <Tab className={({ selected }) =>
                            clsx(
                                "rounded-full text-sm/6 font-semibold flex  items-center ",
                                "focus:outline-none transition",
                                selected
                                    ? "bg-casal text-white shadow dark:bg-casal"
                                    : "hover:bg-white/15 text-grey dark:text-gray-600 bg-porcelain"
                            )
                        }>
                            <p className="px-3 py-1">Monitor de chats </p>

                            <div className="flex justify-center items-center me-1 w-6 h-6 text-xs font-medium bg-towerGray text-white rounded-full">
                                3
                            </div>
                        </Tab>
                        <Tab className={({ selected }) =>
                            clsx(
                                "rounded-full px-3 py-1 text-sm/6 font-semibold",
                                "focus:outline-none transition",
                                selected
                                    ? "bg-casal text-white shadow dark:bg-casal"
                                    : "hover:bg-black/15 text-grey dark:text-gray-600 bg-porcelain"
                            )
                        }>Enlace cuestionario</Tab>
                    </TabList>
                        <TabPanels className="mt-6">
                            <TabPanel className={clsx("rounded-xl border-2")}>
                                 <ConfigurarRespuesta />
                            </TabPanel>
                            <TabPanel className={clsx("rounded-xl border-2")}>
                                 <MonitordeChats />
                            </TabPanel>
                            <TabPanel className={clsx("rounded-xl border-2")}>
                                 <CrearCuestionarioPages />
                            </TabPanel>
                        </TabPanels>
                </TabGroup>
            </div>
        </div>
    );
}