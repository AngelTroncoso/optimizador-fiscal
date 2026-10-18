'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ConsentimientoProps {
  onAceptar: () => void;
}

export default function Consentimiento({ onAceptar }: ConsentimientoProps) {
  const [aceptado, setAceptado] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 max-w-3xl mx-auto"
    >
      <h2 className="text-3xl font-bold mb-6 text-neon-cyan">
        🔒 Privacidad y Seguridad
      </h2>

      <div className="space-y-4 text-gray-300 mb-8">
        <p className="text-lg leading-relaxed">
          <strong className="text-white">Tus datos se procesan solo en tu navegador</strong> mientras tienes la página abierta.
        </p>

        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>No se guardan en ningún servidor</li>
          <li>No se envían a ninguna parte</li>
          <li>No usamos cookies, localStorage ni almacenamiento local</li>
          <li>No pedimos datos personales (RUT, nombre, correo)</li>
          <li>Todos los cálculos se ejecutan en tu dispositivo</li>
        </ul>

        <p className="text-sm text-gray-400 mt-6">
          Esta herramienta se alinea con los principios de minimización, finalidad y transparencia de la Ley 19.628 y la Ley 21.719 de protección de datos personales de Chile. Al cerrar o recargar la página, toda la información desaparece automáticamente.
        </p>
      </div>

      <div className="bg-white/5 p-6 rounded-lg border border-white/10 mb-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={aceptado}
            onChange={(e) => setAceptado(e.target.checked)}
            className="mt-1 w-5 h-5 accent-neon-cyan"
          />
          <span className="text-white group-hover:text-neon-cyan transition-colors">
            Acepto el uso temporal de mis datos para esta simulación tributaria, entendiendo que se procesan únicamente en mi navegador.
          </span>
        </label>
      </div>

      <button
        onClick={onAceptar}
        disabled={!aceptado}
        className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
          aceptado
            ? 'bg-gradient-to-r from-neon-cyan to-neon-violet hover:scale-105 neon-glow cursor-pointer'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        Continuar con la simulación
      </button>
    </motion.div>
  );
}
