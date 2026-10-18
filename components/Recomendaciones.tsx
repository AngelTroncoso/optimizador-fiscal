'use client';

import { motion } from 'framer-motion';
import type { Recomendacion } from '@/lib/calculos';
import { formatearCLP } from '@/lib/calculos';

interface RecomendacionesProps {
  recomendaciones: Recomendacion[];
}

export default function Recomendaciones({ recomendaciones }: RecomendacionesProps) {
  const colorRiesgo = {
    bajo: 'border-green-500/50 bg-green-500/10',
    medio: 'border-yellow-500/50 bg-yellow-500/10',
    alto: 'border-red-500/50 bg-red-500/10',
  };

  const iconoRiesgo = {
    bajo: '✓',
    medio: '⚠️',
    alto: '⛔',
  };

  if (recomendaciones.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-gray-400">No hay recomendaciones específicas en este momento.</p>
        <p className="text-sm text-gray-500 mt-2">
          Tus datos muestran una estructura tributaria razonablemente optimizada.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-6 mb-4">
        <h3 className="text-2xl font-bold mb-2 text-neon-cyan">Recomendaciones de Planificación Tributaria</h3>
        <p className="text-sm text-gray-400">
          Estas recomendaciones son estrategias LEGALES de planificación. Nunca sugerimos evasión.
        </p>
      </div>

      {recomendaciones.map((rec, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`glass-card p-6 border-2 ${colorRiesgo[rec.nivelRiesgo]}`}
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <span className="text-2xl">{iconoRiesgo[rec.nivelRiesgo]}</span>
              {rec.titulo}
            </h4>
            {rec.ahorroEstimado > 0 && (
              <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                {formatearCLP(rec.ahorroEstimado)}
              </span>
            )}
          </div>

          <p className="text-gray-300 mb-4">{rec.descripcion}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
            <div>
              <p className="text-gray-500">Base Legal</p>
              <p className="font-medium">{rec.baseLegal}</p>
            </div>
            <div>
              <p className="text-gray-500">Nivel de Riesgo</p>
              <p className={`font-medium ${
                rec.nivelRiesgo === 'bajo' ? 'text-green-400' :
                rec.nivelRiesgo === 'medio' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {rec.nivelRiesgo.toUpperCase()}
              </p>
            </div>
          </div>

          {rec.advertencia && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm mb-4">
              ⚠️ {rec.advertencia}
            </div>
          )}

          <div>
            <p className="font-semibold mb-2 text-sm text-gray-400">Pasos a seguir:</p>
            <ol className="space-y-2 text-sm">
              {rec.pasos.map((paso, pidx) => (
                <li key={pidx} className="flex gap-2">
                  <span className="text-neon-cyan font-bold">{pidx + 1}.</span>
                  <span className="text-gray-300">{paso}</span>
                </li>
              ))}
            </ol>
          </div>

          {(rec.nivelRiesgo === 'medio' || rec.nivelRiesgo === 'alto') && (
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-500">
              📋 Norma General Antielusión (Art. 4 bis Código Tributario): El SII puede recaracterizar operaciones que, sin propósito de negocio real, buscan solo reducir impuestos. Consulta con tu asesor tributario.
            </div>
          )}
        </motion.div>
      ))}

      <div className="glass-card p-6 bg-red-500/5 border border-red-500/30">
        <h4 className="font-bold text-red-300 mb-2">⚖️ Diferencia entre Elusión y Evasión</h4>
        <ul className="text-sm text-gray-300 space-y-2">
          <li><strong className="text-green-400">✓ Planificación tributaria legal:</strong> Usar beneficios, créditos e incentivos establecidos en la ley.</li>
          <li><strong className="text-yellow-400">⚠️ Elusión abusiva:</strong> Operaciones artificiosas sin sustancia económica real para reducir impuestos (puede ser fiscalizado por norma general antielusión).</li>
          <li><strong className="text-red-400">✗ Evasión (ILEGAL):</strong> Ocultar ingresos, facturas falsas, simular operaciones. Es un delito penal.</li>
        </ul>
      </div>
    </div>
  );
}
