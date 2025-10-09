import { Button } from '@headlessui/react'
import { EllipsisVertical } from 'lucide-react'
import {React, useState} from 'react'
import { ProductDetailsModal } from './ProductDetailsModal.jsx'

export default function Productos({ producto, invitado, cuotas }) {
  const [open, setOpen] = useState(false);

  if (!producto) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-300">
        <div className="text-gray-500 text-sm">
          No hay productos registrados
        </div>
      </div>
    );
  }

  // Calcular deuda vencida (suma de cuotas vencidas)
  const calcularDeudaVencida = () => {
    if (!cuotas || cuotas.length === 0) {
      return 0;
    }
    
    return cuotas
      .filter(cuota => cuota.vencida === true)
      .reduce((total, cuota) => total + (cuota.monto_pendiente || 0), 0);
  };

  const deudaVencida = calcularDeudaVencida();
  const tieneDeudaVencida = deudaVencida > 0;
  const nombreCompleto = `${producto.nombre} - ${invitado?.nombre_completo || ""}`;

  // Crear objeto de producto con cuotas incluidas
  const productoConCuotas = {
    ...producto,
    cuotas: cuotas
  };

  return (
    <div>
        <div>
            <div onClick={() => setOpen(true)} className='bg-white p-4 flex justify-between rounded-md border border-gray-300 shadow-sm hover:shadow-lg transition-shadow cursor-pointer items-center'>
               <div>
                 <p className='text-gray-700 font-semibold text-lg'>{nombreCompleto}</p>
                 <p className={`mt-2 ${tieneDeudaVencida ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                   {tieneDeudaVencida ? 'Tiene deuda vencida' : 'No tiene deuda vencida'}
                 </p>
                 <p className={`text-sm mt-1 font-medium ${tieneDeudaVencida ? 'text-red-600' : 'text-gray-500'}`}>
                   Deuda pendiente: ${deudaVencida.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                 </p>
               </div>
               <div>
                <Button onClick={() => setOpen(true)} className={'hover:bg-gray-100 p-2 rounded-full transition'}>
                    <EllipsisVertical className='h-5 w-5 text-gray-600' />
                </Button>
               </div>
            </div>
        </div>
        <ProductDetailsModal 
          isOpen={open} 
          onClose={() => setOpen(false)} 
          producto={productoConCuotas}
        />
    </div>
  )
}
