import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface RadarProps {
    data: any[];
}

const GraficoRadar: React.FC<RadarProps> = ({ data }) => {
    return (
        <div className="w-full h-[350px] bg-white rounded-[3rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-4">
                Análisis de Capacidades
            </h3>
            <div className="w-full h-[350px] ..."> {/* Asegúrate que tenga h-[350px] o similar */}
                <ResponsiveContainer width="99%" height="100%"> 
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis 
                            dataKey="sujeto" 
                            tick={(props) => {
                                const { x, y, payload } = props;
                                return (
                                    <text
                                        x={x}
                                        y={y}
                                        fill="#64748b"
                                        fontSize="10"
                                        fontWeight="900"
                                        textAnchor="middle"
                                        className="uppercase" // Usamos Tailwind para el text-transform
                                    >
                                        {payload.value}
                                    </text>
                                );
                            }} 
                        />
                        <Radar
                            name="Rendimiento"
                            dataKey="valor"
                            stroke="#0f172a"
                            strokeWidth={3}
                            fill="#f59e0b"
                            fillOpacity={0.6}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default GraficoRadar;