import React from 'react';
import { 
    XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Area, AreaChart 
} from 'recharts';

interface EvolucionProps {
    data: any[];
}

const GraficoEvolucion: React.FC<EvolucionProps> = ({ data }) => {
    const formatData = data.map(item => ({
        ...item,
        fechaFormateada: new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    }));

    return (
        <div className="w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formatData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    {/* CORRECCIÓN: Las etiquetas defs y linearGradient se usan en minúsculas (son SVG puro) */}
                    <defs>
                        <linearGradient id="colorNota" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="fechaFormateada" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                        dy={10}
                    />
                    <YAxis 
                        domain={[0, 100]} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '20px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                            fontWeight: '900',
                            textTransform: 'uppercase'
                        }} 
                    />
                    <Area 
                        type="monotone" 
                        dataKey="nota" 
                        stroke="#f59e0b" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorNota)" 
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GraficoEvolucion;