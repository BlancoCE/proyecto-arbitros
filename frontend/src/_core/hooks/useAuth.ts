import { useState, useEffect } from "react";

export function useAuth() {
  // Simulamos un estado de carga corto para que se vea el esqueleto
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Simulamos un usuario administrador del Colegio de Árbitros
  const user = {
    id: 1,
    name: "Administrador AFLP",
    email: "admin@colegioarbitros.com",
    role: "admin"
  };

  const logout = () => {
    console.log("Cerrando sesión...");
    window.location.href = "/";
  };

  return {
    user,
    loading,
    error: null,
    isAuthenticated: true,
    logout,
    refresh: () => {}
  };
}