'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Cumplimiento() {
  const [checks, setChecks] = useState({
    // Deber fiduciario y diligencia
    actasSocietarias: false,
    registroAccionistas: false,
    conflictosInteres: false,
    aprobacionOperaciones: false,
    
    // Ley 20.393 y 21.595 - Delitos Económicos
    modeloPrevencion: false,
    oficialCumplimiento: false,
    canalDenuncias: false,
    capacitacionDelitos: false,
    
    // Ley 21.713 - Cumplimiento Tributario
    politicaTributaria: false,
    respaldoDocumental: false,
    revisionsOperaciones: false,
    
    // Controles internos
    segregacionFunciones: false,
    autorizacionGastos: false,
    conciliacionBancaria: false,
  });

  const handleCheck = (campo: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [campo]: !prev[campo] }));
  };

  const checksMarcados = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  const puntaje = Math.round((checksMarcados / totalChecks) * 100);

  const nivelMadurez = 
    puntaje >= 80 ? { nivel: 'Alto', color: 'text-green-400', bg: 'bg-green-500/20' } :
    puntaje >= 50 ? { nivel: 'Medio', color: 'text-yellow-400', bg: 'bg-yellow-500/20' } :
    { nivel: 'Inicial', color: 'text-red-400', bg: 'bg-red-500/20' };

  const categorias = [
    {
      titulo: 'Deber Fiduciario y Diligencia de Directores/Administradores',
      descripcion: 'Ley 18.046 (S.A.) y buenas prácticas para SRL',
      items: [
        { key: 'actasSocietarias', label: 'Actas de juntas y sesiones de directorio actualizadas' },
        { key: 'registroAccionistas', label: 'Registro de socios/accionistas actualizado' },
        { key: 'conflictosInteres', label: 'Política de conflictos de interés y operaciones con partes relacionadas' },
        { key: 'aprobacionOperaciones', label: 'Proceso formal de aprobación de operaciones relevantes' },
      ],
    },
    {
      titulo: 'Modelo de Prevención de Delitos Económicos',
      descripcion: 'Ley 20.393 (responsabilidad penal de personas jurídicas) y Ley 21.595 (delitos económicos)',
      items: [
        { key: 'modeloPrevencion', label: 'Modelo de prevención implementado y documentado' },
        { key: 'oficialCumplimiento', label: 'Encargado de prevención designado' },
        { key: 'canalDenuncias', label: 'Canal de denuncias anónimo y accesible' },
        { key: 'capacitacionDelitos', label: 'Capacitación periódica sobre delitos económicos' },
      ],
    },
    {
      titulo: 'Cumplimiento Tributario',
      descripcion: 'Ley 21.713 (cumplimiento tributario cooperativo)',
      items: [
        { key: 'politicaTributaria', label: 'Política tributaria documentada y aprobada' },
        { key: 'respaldoDocumental', label: 'Respaldo documental de todas las operaciones (facturas, contratos, órdenes)' },
        { key: 'revisionOperaciones', label: 'Revisión periódica de operaciones y cumplimiento de plazos' },
      ],
    },
    {
      titulo: 'Controles Internos',
      descripcion: 'Buenas prácticas de gobierno corporativo',
      items: [
        { key: 'segregacionFunciones', label: 'Segregación de funciones (quien autoriza ≠ quien ejecuta ≠ quien registra)' },
        { key: 'autorizacionGastos', label: 'Política de autorización de gastos por monto y categoría' },
        { key: 'conciliacionBancaria', label: 'Conciliación bancaria mensual' },
      ],
    },
  ];

  const brechas = categorias.flatMap(cat => 
    cat.items
      .filter(item => !checks[item.key as keyof typeof checks])
      .map(item => ({ categoria: cat.titulo, item: item.label }))
  );

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-2xl font-bold mb-2 text-neon-cyan">Gobierno Corporativo y Cumplimiento</h3>
        <p className="text-sm text-gray-400 mb-4">
          Evalúa la madurez de tu empresa en deber fiduciario, prevención de delitos económicos y cumplimiento tributario.
        </p>

        <div className={`p-6 rounded-lg ${nivelMadurez.bg} border-2 border-current ${nivelMadurez.color} mb-6`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-bold">Puntaje de Madurez</span>
            <span className="text-4xl font-bold">{puntaje}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${puntaje}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet"
            />
          </div>
          <p className="mt-2 text-sm">
            Nivel: <strong>{nivelMadurez.nivel}</strong> ({checksMarcados} de {totalChecks} controles implementados)
          </p>
        </div>
      </div>

      {categorias.map((cat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="glass-card p-6"
        >
          <h4 className="text-lg font-bold mb-2 text-neon-violet">{cat.titulo}</h4>
          <p className="text-xs text-gray-400 mb-4">{cat.descripcion}</p>

          <div className="space-y-3">
            {cat.items.map((item) => (
              <label
                key={item.key}
                className="flex items-start gap-3 cursor-pointer group hover:bg-white/5 p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checks[item.key as keyof typeof checks]}
                  onChange={() => handleCheck(item.key as keyof typeof checks)}
                  className="mt-1 w-5 h-5 accent-neon-cyan flex-shrink-0"
                />
                <span className="text-sm group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </motion.div>
      ))}

      {brechas.length > 0 && (
        <div className="glass-card p-6 border-2 border-yellow-500/50">
          <h4 className="text-lg font-bold mb-4 text-yellow-400">
            🔍 Brechas Detectadas ({brechas.length})
          </h4>
          <div className="space-y-3">
            {brechas.slice(0, 10).map((brecha, idx) => (
              <div key={idx} className="bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-gray-500">{brecha.categoria}</p>
                <p className="text-sm font-medium">{brecha.item}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <h5 className="font-semibold mb-2 text-sm">Acciones Sugeridas:</h5>
            <ul className="text-sm text-gray-300 space-y-2">
              {puntaje < 50 && (
                <>
                  <li>• Prioriza implementar un modelo de prevención de delitos (Ley 20.393 y 21.595)</li>
                  <li>• Documenta actas de juntas y sesiones de directorio</li>
                  <li>• Implementa un canal de denuncias anónimo</li>
                </>
              )}
              {puntaje >= 50 && puntaje < 80 && (
                <>
                  <li>• Refuerza la política de conflictos de interés</li>
                  <li>• Capacita al equipo en prevención de delitos económicos</li>
                  <li>• Implementa controles de segregación de funciones</li>
                </>
              )}
              {puntaje >= 80 && (
                <li>• Mantén actualizada la documentación y realiza auditorías periódicas</li>
              )}
              <li>• Consulta con un abogado especializado en gobierno corporativo y compliance</li>
            </ul>
          </div>
        </div>
      )}

      {puntaje >= 80 && (
        <div className="glass-card p-6 bg-green-500/10 border border-green-500/30">
          <p className="text-green-300">
            ✓ Tu empresa muestra un nivel alto de madurez en gobierno y cumplimiento. Mantén estas prácticas actualizadas y documenta las revisiones periódicas.
          </p>
        </div>
      )}

      <div className="glass-card p-4 text-xs text-gray-500">
        <p className="font-semibold mb-2">Referencias legales:</p>
        <ul className="space-y-1">
          <li>• Ley 18.046: Ley de Sociedades Anónimas (deberes de directores)</li>
          <li>• Ley 20.393: Responsabilidad penal de personas jurídicas (modelo de prevención)</li>
          <li>• Ley 21.595: Delitos económicos (receptación, lavado de activos, etc.)</li>
          <li>• Ley 21.713: Cumplimiento tributario cooperativo</li>
          <li>• NCG 385 CMF: Gobierno corporativo (para sociedades anónimas abiertas)</li>
        </ul>
      </div>
    </div>
  );
}
