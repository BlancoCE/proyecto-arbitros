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
        const fecha = p.fecha ? p.fecha.split('T')[0] : "SIN FECHA";
        const cat = p.categoria || "SIN CATEGORIA";
        const ubi = p.ubicacion || "POR DEFINIR";
        
        if (!acc[fecha]) acc[fecha] = {};
        if (!acc[fecha][cat]) acc[fecha][cat] = {};
        if (!acc[fecha][cat][ubi]) acc[fecha][cat][ubi] = [];
        
        acc[fecha][cat][ubi].push(p);
        return acc;
    }, {});

    let finalY = 30;

    // CORRECCIÓN SONARQUBE: Uso de localeCompare para garantizar ordenamiento confiable de las llaves de fecha
    const fechasOrdenadas = Object.keys(agrupados).sort((a, b) => a.localeCompare(b, 'es'));

    fechasOrdenadas.forEach((fecha) => {
        const categorias = Object.keys(agrupados[fecha]).sort((a, b) => a.localeCompare(b, 'es'));

        categorias.forEach((categoria) => {
            const canchas = Object.keys(agrupados[fecha][categoria]).sort((a, b) => a.localeCompare(b, 'es'));

            canchas.forEach((cancha) => {
                // Verificar espacio en la página actual antes de imprimir bloques de cabecera
                if (finalY > 240) {
                    doc.addPage();
                    finalY = 20;
                }

                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                doc.setTextColor(30, 41, 59); // color slate-800
                doc.text(`FECHA: ${fecha} | CATEGORIA: ${categoria} | CANCHA: ${cancha.toUpperCase()}`, 14, finalY);
                finalY += 4;

                // CORRECCIÓN SONARQUBE / ADAPTABILIDAD: 
                // Delegamos la extracción de datos de la fila a un mapeo adaptativo controlado
                const filasTabla = agrupados[fecha][categoria][cancha].map((p: any) => {
                    const horaFormateada = p.hora ? p.hora.substring(0, 5) : "00:00";
                    const local = p.equipo_local || "POR DEFINIR";
                    const visitante = p.equipo_visitante || "POR DEFINIR";
                    const ternaFormateada = formatTerna(p.terna_nombres);

                    return [
                        horaFormateada,
                        local,
                        'VS',
                        visitante,
                        ternaFormateada
                    ];
                });

                autoTable(doc, {
                    startY: finalY,
                    head: [['HORA', 'LOCAL', 'VS', 'VISITANTE', 'TERNA ARBITRAL']],
                    body: filasTabla,
                    theme: 'grid',
                    headStyles: { fillColor: [71, 85, 105], fontSize: 7 },
                    styles: { fontSize: 7, cellPadding: 1.5 },
                    columnStyles: { 0: { cellWidth: 15 }, 2: { cellWidth: 8 }, 4: { cellWidth: 55 } },
                    margin: { left: 14, right: 14 }
                });
                
                finalY = (doc as any).lastAutoTable.finalY + 8;
            });
        });
    });

    doc.save(`Designaciones_${rango.inicio}_al_${rango.fin}.pdf`);
};

// Función auxiliar adaptativa para formatear terna con validaciones de seguridad (Fallbacks)
const formatTerna = (terna: any) => {
    if (!terna || typeof terna !== 'object') return "POR DESIGNAR";
    
    const roles = [
        { k: "Central", label: "A:" },
        { k: "Asistente 1", label: "A1:" },
        { k: "Asistente 2", label: "A2:" },
        { k: "Cuarto Árbitro", label: "4to:" }
    ];

    const partes = roles
        .map(r => terna[r.k] ? `${r.label} ${terna[r.k]}` : null)
        .filter(Boolean);

    return partes.length > 0 ? partes.join(' | ') : "POR DESIGNAR";
};