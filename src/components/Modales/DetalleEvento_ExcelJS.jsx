// Esta es la función handleDescargarDistribucion reescrita con ExcelJS
// Reemplazar la función en DetalleEvento.jsx con esta implementación

const handleDescargarDistribucion = async () => {
  if (!eventoData?.id) {
    alert('No se puede descargar: ID de evento no disponible');
    return;
  }

  setDescargando(true);
  
  try {
    console.log('📥 Descargando reporte de selecciones para evento:', eventoData.id);
    
    // Obtener datos del reporte desde el API
    const reporte = await reporteSeleccionService.obtenerReporteSelecciones(eventoData.id);
    
    if (!reporte) {
      throw new Error('No se recibieron datos del reporte');
    }

    console.log('📊 Datos del reporte:', reporte);

    // Importar ExcelJS de forma dinámica
    const ExcelJS = (await import("exceljs")).default;

    // Crear el workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Eventos';
    workbook.created = new Date();
    
    // =====================================================
    // HOJA PRINCIPAL: Listado de Mesas para Graduaciones
    // =====================================================
    
    const worksheet = workbook.addWorksheet('Distribución Mesas', {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });
    
    let currentRow = 1;
    
    // Título principal (fila 1)
    worksheet.mergeCells('A1:G1');
    const tituloCell = worksheet.getCell('A1');
    tituloCell.value = 'Listado de Mesas para Graduaciones';
    tituloCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
    tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
    currentRow = 2;
    
    // Línea vacía
    currentRow++;
    
    // Información del evento (filas 3-7)
    const infoEvento = [
      ['Promotor', reporte.evento?.coordinador || ''],
      ['Nombre de la Graduación', reporte.evento?.nombre_evento || ''],
      ['Sala o Salón', reporte.evento?.salon || ''],
      ['Fecha de realización', reporte.evento?.fecha_evento || ''],
      ['Coordinador del promotor', reporte.evento?.coordinador || '']
    ];

    infoEvento.forEach(([label, valor]) => {
      const labelCell = worksheet.getCell(`A${currentRow}`);
      const valorCell = worksheet.getCell(`B${currentRow}`);
      
      labelCell.value = label;
      valorCell.value = valor;
      
      // Estilo para label
      labelCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      labelCell.alignment = { vertical: 'middle' };
      labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4B084' } };
      labelCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // Estilo para valor
      valorCell.font = { name: 'Calibri', size: 11 };
      valorCell.alignment = { vertical: 'middle' };
      valorCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
      valorCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      currentRow++;
    });
    
    // Línea vacía
    currentRow++;
    
    // Restricción de mesas (fila 9)
    const restriccionCell = worksheet.getCell(`A${currentRow}`);
    restriccionCell.value = 'Solo se permiten mesas de 7 pax a 12 pax';
    restriccionCell.font = { name: 'Calibri', size: 11, bold: true };
    restriccionCell.alignment = { vertical: 'middle' };
    currentRow++;
    
    // Línea vacía
    currentRow++;
    
    // Tabla de mesas por capacidad (filas 11-17)
    const mesasPorCapacidad = [
      ['Mesas de 7 pax', 7, 0, 0],
      ['Mesas de 8 pax', 8, 0, 0],
      ['Mesas de 9 pax', 9, 0, 0],
      ['Mesas de 10 pax', 10, 0, 0],
      ['Mesas de 11 pax', 11, 0, 0],
      ['Mesas de 12 pax', 12, 0, 0]
    ];
    
    mesasPorCapacidad.forEach(([descripcion, capacidad, col3, col4]) => {
      const row = worksheet.getRow(currentRow);
      row.getCell(1).value = descripcion;
      row.getCell(2).value = capacidad;
      row.getCell(3).value = col3;
      row.getCell(4).value = col4;
      
      // Estilo para tabla de capacidad
      [1, 2, 3, 4].forEach(colNum => {
        const cell = row.getCell(colNum);
        if (colNum === 1) {
          cell.font = { name: 'Calibri', size: 11, bold: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
        } else {
          cell.font = { name: 'Calibri', size: 11 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEBF7' } };
        }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      
      currentRow++;
    });
    
    // Total de pax (fila 17)
    const totalPaxRow = worksheet.getRow(currentRow);
    totalPaxRow.getCell(1).value = 'Total de pax';
    totalPaxRow.getCell(2).value = 0;
    
    [1, 2].forEach(colNum => {
      const cell = totalPaxRow.getCell(colNum);
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: colNum === 2 ? 'center' : 'left', vertical: 'middle' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF44546A' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    currentRow++;
    
    // Línea vacía
    currentRow++;
    
    // Fila de totales (fila 19)
    const totalesRow = worksheet.getRow(currentRow);
    totalesRow.getCell(1).value = 'Totales';
    totalesRow.getCell(2).value = reporte.resumen?.total_selecciones || 0;
    totalesRow.getCell(3).value = reporte.resumen?.total_asientos_ocupados || 0;
    
    // Agregar conteos de cada tipo de menú
    let colIndex = 4;
    if (reporte.tipos_menu && reporte.tipos_menu.length > 0) {
      reporte.tipos_menu.forEach(tm => {
        totalesRow.getCell(colIndex).value = tm.cantidad_seleccionada || 0;
        colIndex++;
      });
    }
    
    // Estilo para fila de totales
    const totalCols = 3 + (reporte.tipos_menu?.length || 0);
    for (let i = 1; i <= totalCols; i++) {
      const cell = totalesRow.getCell(i);
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
    currentRow++;
    
    // Encabezados de tabla principal (fila 20)
    const headerRow = worksheet.getRow(currentRow);
    const headers = ['No. de Mesa', 'No. De pax por mesa'];
    
    // Agregar columnas de tipos de menú
    if (reporte.tipos_menu && reporte.tipos_menu.length > 0) {
      reporte.tipos_menu.forEach(tm => {
        headers.push(`Menú ${tm.nombre}`);
      });
    } else {
      headers.push('Menú Normal', 'Menú Infantil', 'Menú Especial', 'Menú Celiaco', 'Menú Kosher');
    }
    headers.push('Observaciones');
    
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    currentRow++;
    
    // Datos de mesas (desde fila 21)
    const dataStartRow = currentRow;
    if (reporte.datos && reporte.datos.length > 0) {
      // Agrupar datos por mesa
      const mesasMap = new Map();
      
      reporte.datos.forEach(fila => {
        const mesaNum = fila.mesa_numero;
        if (!mesasMap.has(mesaNum)) {
          mesasMap.set(mesaNum, {
            mesa_numero: mesaNum,
            pax: 0,
            menus: {},
            observaciones: []
          });
        }
        
        const mesa = mesasMap.get(mesaNum);
        mesa.pax++;
        
        // Contar menús por tipo
        const tipoMenu = fila.tipo_menu;
        mesa.menus[tipoMenu] = (mesa.menus[tipoMenu] || 0) + 1;
        
        // Agregar observaciones
        if (fila.notas) mesa.observaciones.push(fila.notas);
        if (fila.restricciones) mesa.observaciones.push(fila.restricciones);
      });

      // Convertir el mapa a filas con efecto zebra
      const mesasArray = Array.from(mesasMap.values()).sort((a, b) => a.mesa_numero - b.mesa_numero);
      mesasArray.forEach((mesa, index) => {
        const row = worksheet.getRow(currentRow);
        const isAlternate = index % 2 === 1;
        
        // Valores de la fila
        row.getCell(1).value = mesa.mesa_numero;
        row.getCell(2).value = mesa.pax;
        
        // Conteo de menús
        let menuCol = 3;
        if (reporte.tipos_menu && reporte.tipos_menu.length > 0) {
          reporte.tipos_menu.forEach(tm => {
            row.getCell(menuCol).value = mesa.menus[tm.id] || 0;
            menuCol++;
          });
        }
        
        // Observaciones
        row.getCell(headers.length).value = mesa.observaciones.join('; ');
        
        // Aplicar estilos con efecto zebra
        for (let i = 1; i <= headers.length; i++) {
          const cell = row.getCell(i);
          cell.font = { name: 'Calibri', size: 11 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          if (isAlternate) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };
          }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
        
        currentRow++;
      });
    } else {
      // Filas vacías de ejemplo
      for (let i = 1; i <= 10; i++) {
        const row = worksheet.getRow(currentRow);
        const isAlternate = (i - 1) % 2 === 1;
        
        row.getCell(1).value = i;
        
        // Aplicar estilos
        for (let col = 1; col <= headers.length; col++) {
          const cell = row.getCell(col);
          cell.font = { name: 'Calibri', size: 11 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          if (isAlternate) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };
          }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
        
        currentRow++;
      }
    }
    
    // Configurar anchos de columna
    worksheet.getColumn(1).width = 15;  // No. de Mesa
    worksheet.getColumn(2).width = 18;  // No. de pax
    
    // Anchos para menús
    for (let i = 3; i < headers.length; i++) {
      worksheet.getColumn(i).width = 15;
    }
    worksheet.getColumn(headers.length).width = 40;  // Observaciones
    
    // Configurar altura de fila del título
    worksheet.getRow(1).height = 25;
    
    // =====================================================
    // HOJA 2: Detalle Completo
    // =====================================================
    if (reporte.datos && reporte.datos.length > 0) {
      const wsDetalle = workbook.addWorksheet('Detalle Completo', {
        pageSetup: { paperSize: 9, orientation: 'landscape' }
      });
      
      // Título
      wsDetalle.mergeCells('A1:J1');
      const detalleTitulo = wsDetalle.getCell('A1');
      detalleTitulo.value = 'DETALLE COMPLETO DE SELECCIONES';
      detalleTitulo.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      detalleTitulo.alignment = { horizontal: 'center', vertical: 'middle' };
      detalleTitulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
      wsDetalle.getRow(1).height = 25;
      
      // Línea vacía
      let detalleRow = 3;
      
      // Encabezados
      const detalleHeaders = [
        'No. Graduado',
        'Nombre Graduado',
        'No. Mesa',
        'Tipo Mesa',
        'No. Asiento',
        'Nombre Comensal',
        'Tipo Menú',
        'Restricciones',
        'Notas',
        'Fecha Selección'
      ];
      
      const headerRowDetalle = wsDetalle.getRow(detalleRow);
      detalleHeaders.forEach((header, index) => {
        const cell = headerRowDetalle.getCell(index + 1);
        cell.value = header;
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      detalleRow++;
      
      // Datos del detalle
      reporte.datos.forEach((fila, index) => {
        const row = wsDetalle.getRow(detalleRow);
        const isAlternate = index % 2 === 1;
        
        row.getCell(1).value = fila.numero_invitado;
        row.getCell(2).value = fila.nombre_invitado;
        row.getCell(3).value = fila.mesa_numero;
        row.getCell(4).value = fila.mesa_tipo;
        row.getCell(5).value = fila.asiento_numero;
        row.getCell(6).value = fila.nombre_comensal;
        row.getCell(7).value = fila.tipo_menu;
        row.getCell(8).value = fila.restricciones;
        row.getCell(9).value = fila.notas;
        row.getCell(10).value = fila.fecha_seleccion;
        
        // Aplicar estilos
        for (let i = 1; i <= 10; i++) {
          const cell = row.getCell(i);
          cell.font = { name: 'Calibri', size: 10 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          if (isAlternate) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };
          }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
        
        detalleRow++;
      });
      
      // Configurar anchos de columna
      wsDetalle.getColumn(1).width = 12;  // No. Invitado
      wsDetalle.getColumn(2).width = 30;  // Nombre Invitado
      wsDetalle.getColumn(3).width = 10;  // No. Mesa
      wsDetalle.getColumn(4).width = 15;  // Tipo Mesa
      wsDetalle.getColumn(5).width = 12;  // No. Asiento
      wsDetalle.getColumn(6).width = 30;  // Nombre Comensal
      wsDetalle.getColumn(7).width = 15;  // Tipo Menú
      wsDetalle.getColumn(8).width = 25;  // Restricciones
      wsDetalle.getColumn(9).width = 25;  // Notas
      wsDetalle.getColumn(10).width = 18;  // Fecha Selección
    }
    
    // Generar archivo
    const nombreArchivo = `Distribucion_Mesas_${reporte.evento?.nombre_evento?.replace(/\s+/g, '_') || 'Evento'}.xlsx`;
    
    // Descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Reporte descargado exitosamente con colores');
  } catch (error) {
    console.error('Error al descargar reporte:', error);
    alert(`Error al generar el reporte: ${error.message || 'Por favor intenta nuevamente'}`);
  } finally {
    setDescargando(false);
  }
};
