"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [ciudad, setCiudad] = useState(""); // Ciudad que se escribe en el input
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState(""); // Ciudad que se muestra en el resultado
  const [temperatura, setTemperatura] = useState(null);
  const [error, setError] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [coordenadas, setCoordenadas] = useState({ lat: null, lon: null });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Función para obtener el SVG según la temperatura
  const obtenerSVGClima = (temp) => {
    if (temp === null) return "/weather/clear.svg";
    if (temp < 0) return "/weather/snowy.svg";
    if (temp < 10) return "/weather/cold-clody.svg";
    if (temp < 20) return "/weather/cloudy.svg";
    if (temp < 30) return "/weather/clear.svg";
    return "/weather/hot.svg";
  };

  // Buscar sugerencias de ciudades
  async function obtenerSugerencias(nombreCiudad) {
    if (!nombreCiudad) {
      setSugerencias([]);
      return;
    }

    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${nombreCiudad}&count=5&language=es&format=json`
      );
      const data = await res.json();
      setSugerencias(data.results || []);
    } catch (err) {
      console.error("Error obteniendo sugerencias:", err);
    }
  }

  // Consultar clima 
  async function obtenerClima() {
    const { lat, lon } = coordenadas;

    if (!lat || !lon) {
      setError("Por favor, seleccioná una ciudad válida.");
      return;
    }

    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const data = await res.json();

      setTemperatura(data.current_weather.temperature);
      setCiudadSeleccionada(ciudad); // Se guarda la ciudad seleccionada en la última búsqueda
      setError("");
    } catch (err) {
      setError("Error al obtener el clima.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-black to-purple-900 text-white px-4">
      <div className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-96 text-center relative border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Clima Actual</h1>
        
        {/* Contenedor del input y sugerencias */}
        <div className="relative">
          {/* Input de búsqueda */}
          <input
            type="text"
            placeholder="Ejemplo: Tandil, Argentina"
            value={ciudad}
            onChange={(e) => {
              setCiudad(e.target.value);
              obtenerSugerencias(e.target.value);
            }}
            className="p-4 w-full border border-gray-600 rounded-xl mb-4 bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />

          {/* Menú de sugerencias */}
          {sugerencias.length > 0 && (
            <ul className="absolute z-10 w-full bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {sugerencias.map((s, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setCiudad(`${s.name}${s.admin1 ? `, ${s.admin1}` : ""}`);
                    setCoordenadas({ lat: s.latitude, lon: s.longitude });
                    setSugerencias([]);
                  }}
                  className="p-3 cursor-pointer hover:bg-gray-700/80 transition-colors duration-200 border-b border-gray-700/50 last:border-b-0"
                >
                  {s.name}, {s.country}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Botón para obtener el clima */}
        <button
          onClick={obtenerClima}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl w-full mt-4 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          Consultar Clima
        </button>

        {/* Mensajes de error */}
        {error && (
          <p className="text-red-400 mt-4 bg-red-900/20 p-3 rounded-lg border border-red-800/50">
            {error}
          </p>
        )}

        {/* Mostrar temperatura SOLO cuando se haya presionado el botón */}
        {isClient && temperatura !== null && ciudadSeleccionada && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl border border-gray-700/50">
            <div className="relative">
              <div className="relative w-48 h-48 mx-auto transform transition-all duration-500 hover:scale-110">
                <Image
                  src={obtenerSVGClima(temperatura)}
                  alt="Clima actual"
                  fill
                  className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  priority
                />
              </div>
              <p className="text-xl font-semibold text-blue-300 relative -mt-8 z-10 bg-gradient-to-r from-blue-900/50 to-purple-900/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                La temperatura en {ciudadSeleccionada} es de{" "}
                <span className="text-2xl font-bold text-white">{temperatura}°C</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
