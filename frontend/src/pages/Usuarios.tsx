import { Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UsuariosPage = () => {
  const navigate = useNavigate();

  const tipos = [
    {
      title: "Gestión de Árbitros",
      desc: "Administra el registro, categorías y especialidades de los árbitros del colegio.",
      icon: Users,
      color: "bg-blue-600",
      path: "/dashboard/usuarios/arbitros"
    },
    {
      title: "Gestión de Asesores",
      desc: "Administra a los asesores y evaluadores encargados de calificar el desempeño.",
      icon: ShieldCheck,
      color: "bg-indigo-600",
      path: "/dashboard/usuarios/asesores"
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Módulo de Usuarios</h2>
        <p className="text-gray-500 mt-2">Selecciona el área que deseas administrar actualmente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tipos.map((tipo, i) => (
          <button
            key={i}
            onClick={() => navigate(tipo.path)}
            className="group bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:border-blue-500 hover:shadow-2xl transition-all text-left flex flex-col justify-between h-72"
          >
            <div className="flex justify-between items-start">
              <div className={`${tipo.color} p-5 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <tipo.icon size={32} />
              </div>
              <div className="bg-gray-50 p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                <ArrowRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={24} />
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{tipo.title}</h3>
              <p className="text-gray-500 leading-relaxed">{tipo.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UsuariosPage;