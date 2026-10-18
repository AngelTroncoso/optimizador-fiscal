'use client';

import { useState, useEffect } from 'react';
import Consentimiento from '@/components/Consentimiento';
import Formulario from '@/components/Formulario';
import Resultados from '@/components/Resultados';
import type { DatosEntrada } from '@/lib/calculos';
import config from '@/lib/config_chile.json';

export default function Home() {
  const [consentimiento, setConsentimiento] = useState(false);
  const [datos, setDatos] = useState<DatosEntrada | null>(null);

  // Limpiar datos al cerrar/recargar
  useEffect(() => {
    const limpiarDatos = () => {
      setDatos(null);
      setConsentimiento(false);
    };

    window.addEventListener('beforeunload', limpiarDatos);
    return () => window.removeEventListener('beforeunload', limpiarDatos);
  }, []);

  const handleBorrarDatos = () => {
    setDatos(null);
    setConsentimiento(false);
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 neon-text">
            Optimizador Fiscal Chile
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Planificador tributario para empresas chilenas
          </p>
          <div className="mt-4 glass-card p-3 text-xs text-yellow-300 max-w-3xl mx-auto">
            ⚠️ Herramienta educativa y de simulación. No constituye asesoría tributaria, contable ni legal. Valida los resultados con un contador auditor o abogado tributario antes de tomar decisiones.
          </div>
        </header>

        {!consentimiento ? (
          <Consentimiento onAceptar={() => setConsentimiento(true)} />
        ) : !datos ? (
          <Formulario 
            onCalcular={setDatos}
            valorUFInicial={config.valores_referenciales.uf.valor}
            valorUTMInicial={config.valores_referenciales.utm.valor}
            valorUTAInicial={config.valores_referenciales.uta.valor}
          />
        ) : (
          <>
            <button
              onClick={handleBorrarDatos}
              className="mb-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-colors no-print"
            >
              🗑️ Borrar mis datos ahora
            </button>
            <Resultados datos={datos} onVolver={handleBorrarDatos} />
          </>
        )}
      </div>
    </main>
  );
}
