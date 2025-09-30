import { Button } from '@headlessui/react'
import { EllipsisVertical } from 'lucide-react'
import {React, useState} from 'react'
import { ProductDetailsModal } from './ProductDetailsModal.jsx'

export default function Productos() {
  const [open, setOpen] = useState(false)
  return (
    <div>
        <div>
            <div onClick={() => setOpen(true)} className='bg-white p-4 flex justify-between rounded-md border border-gray-300 shadow-sm hover:shadow-lg transition-shadow cursor-pointer items-center'>
               <div>
                 <p className='text-gray-700 font-semibold text-lg'>Graduacion PREPA IBERO 26 Santiago Mendez Lopez</p>
                <p className='text-gray-600 mt-2'>No tiene deuda vencida</p>
               </div>
               <div>
                <Button onClick={() => setOpen(true)} className={'hover:bg-gray-100 p-2 rounded-full transition'}>
                    <EllipsisVertical className='h-5 w-5 text-gray-600' />
                </Button>
               </div>
            </div>
        </div>
        <ProductDetailsModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  )
}
