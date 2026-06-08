import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const ReportePdfService = {
    // 1. EXPORTAR FICHA INDIVIDUAL DE UN ÁRBITRO
    exportarIndividual: (data: any, nombreArbitro: string) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const anio = data.año || '2026';

        // Encabezado Oficial Institucional - Estilo Premium Dashboard (Slate 900)
        pdf.setFillColor(15, 23, 42); 
        pdf.rect(0, 0, 210, 38, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(15);
        pdf.text("COLEGIO DE ÁRBITROS DE FÚTBOL - LA PAZ", 14, 14);
        
        // Línea decorativa verde esmeralda (Mismo color del Dashboard)
        pdf.setFillColor(16, 185, 129); 
        pdf.rect(14, 18, 182, 1, 'F');

        pdf.setTextColor(226, 232, 240); // Slate 200
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`INFORME DE RENDIMIENTO ANUAL INTEGRADO — GESTIÓN FISCAL ${anio}`, 14, 24);
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`COLEGIADO: ${nombreArbitro.toUpperCase()}`, 14, 31);

        // Bloque 1: Resumen de Notas en Campo
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text("1. RESUMEN DE CALIFICACIONES EN CAMPO (PARTIDOS EVALUADOS)", 14, 48);

        // Validar si el árbitro tiene partidos evaluados
        const tienePartidos = data.resumen && parseInt(data.resumen.partidos_evaluados) > 0;

        autoTable(pdf, {
            startY: 52,
            head: [['Métrica de Evaluación de Campo', 'Promedio Obtenido / Estado']],
            body: [
                ['Promedio Técnico General en Campo', tienePartidos ? `${data.resumen.promedio_general} pts` : 'No se tienen datos (0.00 pts)'],
                ['Criterio Técnico Promedio', tienePartidos ? `${data.resumen.avg_tecnico} pts` : 'No se tienen datos (0.00 pts)'],
                ['Criterio Físico en Partidos', tienePartidos ? `${data.resumen.avg_fisico} pts` : 'No se tienen datos (0.00 pts)'],
                ['Criterio de Actitud y Conducta', tienePartidos ? `${data.resumen.avg_actitud} pts` : 'No se tienen datos (0.00 pts)'],
                ['Total Partidos Evaluados en la Gestión', `${data.resumen?.partidos_evaluados || '0'} partidos`]
            ],
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42], fontStyle: 'bold', fontSize: 9 }, // Slate 900
            styles: { font: 'helvetica', fontSize: 9 },
            columnStyles: { 1: { fontStyle: 'bold', halign: 'right' } }
        });

        // Bloque 2: Detalle Pruebas Físicas Oficiales
        const currentY = (pdf as any).lastAutoTable.finalY + 12;
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.text("2. RENDIMIENTO EN PRUEBAS FÍSICAS DE LA ASOCIACIÓN", 14, currentY);

        const tieneFisicas = data.historialFisico && data.historialFisico.length > 0;
        let filasFisicas = [];

        if (tieneFisicas) {
            filasFisicas = data.historialFisico.map((f: any) => {
                const esCentral = String(f.especializacion || '').toLowerCase() === 'central';
                const esIntermitente = f.tipo_prueba?.toLowerCase().includes('intermitente');
                
                let disciplinaInfo = '';
                if (esIntermitente) {
                    disciplinaInfo = esCentral ? 'Velocidad (40m) / Resistencia (Intermitente)' : 'Agilidad (Coda) / Velocidad / Resistencia';
                } else {
                    disciplinaInfo = esCentral ? 'Agilidad (7x7) / Velocidad / Resistencia (YoYo)' : 'Agilidad (Coda) / Velocidad / Resistencia (Ariet)';
                }

                return [
                    new Date(f.fecha).toLocaleDateString('es-ES'),
                    `${f.tipo_prueba} (${f.categoria || 'Cat'})`,
                    disciplinaInfo,
                    `Vel: ${f.velocidad || 'N/A'} | Res: ${f.resistencia || 'N/A'} | Agi: ${f.agilidad || 'N/A'}`
                ];
            });
        } else {
            filasFisicas = [['-', 'No se tienen datos registrados', 'No aplica en la gestión', '-']];
        }

        autoTable(pdf, {
            startY: currentY + 4,
            head: [['Fecha', 'Tipo de Test', 'Disciplinas Exigidas', 'Marcas Registradas']],
            body: filasFisicas,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] }, // Verde Esmeralda del Dashboard
            styles: { font: 'helvetica', fontSize: 9 },
            columnStyles: { 2: { cellWidth: 65 } }
        });

        // Bloque 3: Pruebas Escritas
        const writtenY = (pdf as any).lastAutoTable.finalY + 12;
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.text("3. EVALUACIÓN DE CONOCIMIENTO ESCRITO (REGLAMENTO DE JUEGO)", 14, writtenY);

        const tieneEscritas = data.historialEscrito && data.historialEscrito.length > 0;
        let filasEscritas = [];

        if (tieneEscritas) {
            filasEscritas = data.historialEscrito.map((e: any) => [
                new Date(e.fecha).toLocaleDateString('es-ES'),
                e.tema?.toUpperCase(),
                `${e.nota} / 100`
            ]);
        } else {
            filasEscritas = [['-', 'No se tienen exámenes teóricos registrados en el periodo', '0 / 100']];
        }

        autoTable(pdf, {
            startY: writtenY + 4,
            head: [['Fecha de Examen', 'Temario Evaluado', 'Calificación']],
            body: filasEscritas,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] }, // Índigo / Azul Eléctrico del Dashboard
            styles: { font: 'helvetica', fontSize: 9 },
            columnStyles: { 2: { fontStyle: 'bold', halign: 'right' } }
        });

        // Pie de página oficial de autenticidad
        const finalY = (pdf as any).lastAutoTable.finalY + 20;
        pdf.setDrawColor(226, 232, 240);
        pdf.line(14, finalY, 196, finalY);
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184); // Gris sutil
        pdf.setFont('helvetica', 'normal');
        pdf.text("Documento oficial analítico generado por el Sistema de Gestión de Designaciones AFLP.", 14, finalY + 6);
        pdf.text("Cualquier enmienda o alteración invalida este reporte para escalafones oficiales.", 14, finalY + 10);

        pdf.save(`Informe_Anual_${anio}_${nombreArbitro.replace(/\s+/g, '_')}.pdf`);
    },

    // 2. EXPORTAR ESCALAFÓN GLOBAL MASIVO (LOS 28 ÁRBITROS DEL SISTEMA INTEGRAL)
    exportarGlobalLiga: (dataset: any[], anio: string) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Cabecera Institucional Estilo Dashboard (Slate 900)
        pdf.setFillColor(15, 23, 42); 
        pdf.rect(0, 0, 210, 35, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text(`ESCALAFÓN INSTITUCIONAL DE RENDIMIENTO CONSOLIDADO`, 14, 13);
        
        // Línea decorativa Índigo
        pdf.setFillColor(79, 70, 229); 
        pdf.rect(14, 17, 182, 0.8, 'F');

        pdf.setTextColor(16, 185, 129); // Color de Énfasis Oro / Ámbar
        pdf.setFontSize(9);
        pdf.text(`REPORTE GENERAL DEL COLEGIO DE ÁRBITROS — GESTIÓN FISCAL ${anio}`, 14, 23);
        
        pdf.setTextColor(203, 213, 225); // Slate 300
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text("ORDEN OFICIAL DE CATEGORÍAS: FIFA -> PRIMERA -> SEGUNDA -> TERCERA -> CUARTA (SE INCLUYEN REGISTROS VACÍOS)", 14, 28);

        // Mapeo Inteligente: Muestra la métrica real o un mensaje controlado para evitar ceros huérfanos
        const filasGlobales = dataset.map((arb, index) => {
            const promCampoFloat = parseFloat(arb.prom_campo);
            const promEscritoFloat = parseFloat(arb.prom_escrito);
            const testsFisicosInt = parseInt(arb.fisicos_hechos);

            // Si es 0 o null significa que no tiene evaluaciones registradas en las tablas
            const txtCampo = promCampoFloat > 0 ? `${arb.prom_campo} pts` : 'Sin Notas en Periodo';
            const txtEscrito = promEscritoFloat > 0 ? `${arb.prom_escrito} pts` : 'Sin Examen';
            const txtFisico = testsFisicosInt > 0 ? `${arb.fisicos_hechos} tests` : '0 tests';

            return [
                index + 1,
                `${arb.apellido_paterno} ${arb.apellido_materno || ''}, ${arb.nombre}`.toUpperCase(),
                `${arb.categoria} — ${String(arb.tipo_arbitro || 'SIN ESPECIFICACIÓN').toUpperCase()}`,
                txtCampo,
                txtEscrito,
                txtFisico
            ];
        });

        autoTable(pdf, {
            startY: 40,
            head: [['N°', 'Apellidos y Nombres del Árbitro', 'Rango / Categoría Oficial', 'Prom. Campo', 'Prom. Escrito', 'Pruebas Físicas']],
            body: filasGlobales,
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
            styles: { fontSize: 8.5, font: 'helvetica' },
            columnStyles: { 
                0: { cellWidth: 10, halign: 'center' },
                3: { halign: 'center', fontStyle: 'bold' },
                4: { halign: 'center', fontStyle: 'bold' },
                5: { halign: 'center' }
            },
            // Pequeño callback para pintar de un color sutil las filas que no tienen datos
            didParseCell: (dataCell) => {
                if (dataCell.section === 'body' && (dataCell.cell.text[0] === 'Sin Notas en Periodo' || dataCell.cell.text[0] === 'Sin Examen')) {
                    dataCell.cell.styles.textColor = [148, 163, 184]; // Color gris indicando ausencia de datos
                }
            }
        });

        // Firma e Indicador de Páginas
        const totalPaginas = (pdf as any).internal.getNumberOfPages();
        for (let i = 1; i <= totalPaginas; i++) {
            pdf.setPage(i);
            pdf.setFontSize(7.5);
            pdf.setTextColor(148, 163, 184);
            pdf.text(`Página ${i} de ${totalPaginas}`, 180, 287);
            pdf.text(`Fecha de Emisión del Reporte: ${new Date().toLocaleString('es-ES')}`, 14, 287);
        }

        pdf.save(`Escalafon_Consolidado_AFLP_${anio}.pdf`);
    }
};