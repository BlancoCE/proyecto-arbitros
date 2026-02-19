import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Estructura basada en tu Modelo Relacional (Anexo 443)
interface Arbitro {
  id_arbitro: number;
  ci: string;
  nombre: string;
  apellido_paterno: string;
  categoria: string;
  especializacion: string;
  estado: string;
}

const ArbitrosPage = () => {
  // Datos de ejemplo iniciales
  const [arbitros] = useState<Arbitro[]>([
    { id_arbitro: 1, ci: "1234567 LP", nombre: "Juan", apellido_paterno: "Pérez", categoria: "Primera", especializacion: "Árbitro Central", estado: "Activo" }
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Árbitros</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Árbitro
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por CI o Nombre..." className="pl-8" />
        </div>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CI</TableHead>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Especialización</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {arbitros.map((arbitro) => (
              <TableRow key={arbitro.id_arbitro}>
                <TableCell className="font-medium">{arbitro.ci}</TableCell>
                <TableCell>{`${arbitro.nombre} ${arbitro.apellido_paterno}`}</TableCell>
                <TableCell>{arbitro.categoria}</TableCell>
                <TableCell>{arbitro.especializacion}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    {arbitro.estado}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ArbitrosPage;