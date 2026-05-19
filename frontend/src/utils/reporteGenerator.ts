// frontend/src/utils/reporteGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportarDesignacionesPDF = (listaPartidos: any[], rango: { inicio: string, fin: string }) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Títulos principales
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("COMISION DE ARBITROS DE LA PAZ", pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(10);
    const textoRango = rango.inicio === rango.fin ? `FECHA: ${rango.inicio}` : `DEL ${rango.inicio} AL ${rango.fin}`;
    doc.text(`DESIGNACIONES OFICIALES - ${textoRango}`, pageWidth / 2, 22, { align: 'center' });

    // Agrupamiento: Fecha > Categoría > Ubicación
    const agrupados = listaPartidos.reduce((acc: any, p: any) => {
        const fecha = p.fecha.split('T')[0];
        const cat = p.categoria || "SIN CATEGORIA";
        const ubi = p.ubicacion || "POR DEFINIR";
        
        if (!acc[fecha]) acc[fecha] = {};
        if (!acc[fecha][cat]) acc[fecha][cat] = {};
        if (!acc[fecha][cat][ubi]) acc[fecha][cat][ubi] = [];
        
        acc[fecha][cat][ubi].push(p);
        return acc;
    }, {});

    let finalY = 30;

    // Ordenar fechas cronológicamente
    const fechasOrdenadas = Object.keys(agrupados).sort();

    fechasOrdenadas.forEach((fecha) => {
        // Encabezado de FECHA (Separador principal)
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(30, 41, 59); // Slate-800
        doc.rect(14, finalY, pageWidth - 28, 10, 'F');
        doc.text(fecha, pageWidth / 2, finalY + 7, { align: 'center' });
        finalY += 15;

        Object.keys(agrupados[fecha]).forEach((categoria) => {
            // Título de Categoría
            doc.setFontSize(10);
            doc.setTextColor(79, 70, 229); // Indigo-600
            doc.text(categoria.toUpperCase(), 14, finalY);
            finalY += 5;

            Object.keys(agrupados[fecha][categoria]).forEach((cancha) => {
                // Título de Cancha
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(`CANCHA: ${cancha.toUpperCase()}`, 14, finalY);
                finalY += 3;

                autoTable(doc, {
                    startY: finalY,
                    head: [['HORA', 'LOCAL', 'VS', 'VISITANTE', 'TERNA ARBITRAL']],
                    body: agrupados[fecha][categoria][cancha].map((p: any) => [
                        p.hora.substring(0, 5),
                        p.equipo_local,
                        'VS',
                        p.equipo_visitante,
                        formatTerna(p.terna_nombres)
                    ]),
                    theme: 'grid',
                    headStyles: { fillColor: [71, 85, 105], fontSize: 7 },
                    styles: { fontSize: 7, cellPadding: 1.5 },
                    columnStyles: { 0: { cellWidth: 15 }, 2: { cellWidth: 8 }, 4: { cellWidth: 55 } },
                    margin: { left: 14, right: 14 }
                });
                finalY = (doc as any).lastAutoTable.finalY + 8;
                
                // Salto de página si el contenido se acerca al final
                if (finalY > 260) {
                    doc.addPage();
                    finalY = 20;
                }
            });
        });
    });

    doc.save(`Designaciones_${rango.inicio}_al_${rango.fin}.pdf`);
};

const formatTerna = (terna: any) => {
    if (!terna) return "POR DESIGNAR";
    const roles = [
        { k: "Central", l: "ARB" },
        { k: "Asistente 1", l: "A1" },
        { k: "Asistente 2", l: "A2" },
        { k: "Cuarto Árbitro", l: "4to" }
    ];
    return roles.filter(r => terna[r.k]).map(r => `${r.l}: ${terna[r.k]}`).join(' | ');
};