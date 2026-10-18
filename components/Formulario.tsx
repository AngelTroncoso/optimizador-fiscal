'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { DatosEntrada } from '@/lib/calculos';

interface FormularioProps {
  onCalcular: (datos: DatosEntrada) => void;
  valorUFInicial: number;
  valorUTMInicial: number;
  valorUTAInicial: number;
}

export default function Formulario({ 
  onCalcular, 
  valorUFInicial, 
  valorUTMInicial, 
  valorUTAInicial 
}: FormularioProps) {
  const [paso, setPaso] = useState(1);
  const [mostrarAvanzado, setMostrarAvanzado] = useState(false);

  const [form, setForm] = useState({
    regimen: 'propyme_general' as 'general' | 'propyme_general' | 'propyme_transparente',
    ingresosMensuales: 0,
    comprasConIVA: 0,
    gastosNecesarios: 0,
    remuneraciones: 0,
    arriendos: 0,
    honorarios: 0,
    gastosSinIVA: 0,
    gastosRechazados: 0,
    activosFijosNuevos: 0,
    activosFijosUsados: 0,
    perdidasAnteriores: 0,
    remantenteIVA: 0,
    ppmPagados: 0,
    creditoDonaciones: 0,
    retirosDividendos: 0,
    duenosNoResidentes: false,
    ingresosPromedio3Anios: 0,
    valorUF: valorUFInicial,
    valorUTM: valorUTMInicial,
    valorUTA: valorUTAInicial,
    tasaPPM: 0.2,
  });

  const handleChange = (campo: keyof typeof form, valor: any) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = () => {
    onCalcular(form as DatosEntrada);
  };

  const Input = ({ 
    label, 
    campo, 
    tipo = 'number', 
    tooltip 
  }: { 
    label: string; 
    campo: keyof typeof form; 
    tipo?: 'number' | 'checkbox'; 
    tooltip?: string;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2 text-gray-300">
        {label}
        {tooltip && (
          <span className="ml-2 text-xs text-gray-500 cursor-help" title={tooltip}>
            ℹ️
          </span>
        )}
      </label>
      {tipo === 'checkbox' ? (
        <input
          type="checkbox"
          checked={form[campo] as boolean}
          onChange={(e) => handleChange(campo, e.target.checked)}
          className="w-5 h-5 accent-neon-cyan"
          autoComplete="off"
        />
      ) : (
        <input
          type="number"
          value={form[campo] as number}
          onChange={(e) => handleChange(campo, parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-neon-cyan transition-colors"
          autoComplete="off"
        />
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-6 md:p-8 max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Paso {paso} de 3</h2>
          <div className="flex gap-2">
            {[1, 2, 3].map(n => (
              <div
                key={n}
                className={`w-3 h-3 rounded-full ${
                  n <= paso ? 'bg-neon-cyan' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {paso === 1 && (
        <motion.div key="paso1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h3 className="text-xl font-semibold mb-6 text-neon-violet">Información General</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Régimen tributario
            </label>
            <select
              value={form.regimen}
              onChange={(e) => handleChange('regimen', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-neon-cyan"
              autoComplete="off"
            >
              <option value="general">Régimen General (14 A) - Tasa 27%</option>
              <option value="propyme_general">Pro Pyme General (14 D N°3) - Tasa 25%</option>
              <option value="propyme_transparente">Pro Pyme Transparente (14 D N°8) - Sin impuesto corporativo</option>
            </select>
          </div>

          <Input 
            label="Ingresos mensuales promedio (CLP)" 
            campo="ingresosMensuales"
            tooltip="Ventas netas mensuales del giro"
          />

          <Input 
            label="Ingresos promedio últimos 3 años (CLP)" 
            campo="ingresosPromedio3Anios"
            tooltip="Para validar si califica a Pro Pyme (límite 85.000 UF anuales)"
          />

          <Input 
            label="Dueños no residentes en Chile" 
            campo="duenosNoResidentes"
            tipo="checkbox"
            tooltip="Aplica Impuesto Adicional en vez de Global Complementario"
          />
        </motion.div>
      )}

      {paso === 2 && (
        <motion.div key="paso2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h3 className="text-xl font-semibold mb-6 text-neon-violet">Gastos y Compras</h3>

          <Input 
            label="Compras con IVA (CLP anual)" 
            campo="comprasConIVA"
            tooltip="Compras que generan crédito fiscal de IVA"
          />

          <Input 
            label="Gastos necesarios para la renta (CLP anual)" 
            campo="gastosNecesarios"
            tooltip="Gastos del giro con documentación respaldada"
          />

          <Input 
            label="Remuneraciones (CLP anual)" 
            campo="remuneraciones"
            tooltip="Sueldos y cargas sociales"
          />

          <Input 
            label="Arriendos (CLP anual)" 
            campo="arriendos"
            tooltip="Arriendos de inmuebles, vehículos, equipos"
          />

          <Input 
            label="Honorarios (CLP anual)" 
            campo="honorarios"
            tooltip="Pagos a profesionales independientes"
          />

          <Input 
            label="Gastos sin IVA (CLP anual)" 
            campo="gastosSinIVA"
            tooltip="Gastos que no generan crédito fiscal"
          />

          <Input 
            label="Gastos rechazados (CLP anual)" 
            campo="gastosRechazados"
            tooltip="Gastos sin respaldo o ajenos al giro (se gravan con 40%)"
          />
        </motion.div>
      )}

      {paso === 3 && (
        <motion.div key="paso3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h3 className="text-xl font-semibold mb-6 text-neon-violet">Activos y Créditos</h3>

          <Input 
            label="Activos fijos nuevos (CLP)" 
            campo="activosFijosNuevos"
            tooltip="Maquinaria, vehículos, equipos nuevos"
          />

          <Input 
            label="Activos fijos usados (CLP)" 
            campo="activosFijosUsados"
            tooltip="Activos usados (máximo 2 años para depreciación instantánea)"
          />

          <Input 
            label="Pérdidas tributarias de años anteriores (CLP)" 
            campo="perdidasAnteriores"
            tooltip="Pérdidas acumuladas que puedes usar este año"
          />

          <Input 
            label="Remanente de IVA (CLP)" 
            campo="remantenteIVA"
            tooltip="Crédito fiscal acumulado de períodos anteriores"
          />

          <Input 
            label="PPM pagados (CLP anual)" 
            campo="ppmPagados"
            tooltip="Pagos Provisionales Mensuales del año"
          />

          <Input 
            label="Crédito por donaciones (CLP)" 
            campo="creditoDonaciones"
            tooltip="Crédito fiscal por donaciones con beneficio tributario"
          />

          <Input 
            label="Retiros o dividendos de los socios (CLP)" 
            campo="retirosDividendos"
            tooltip="Para calcular Global Complementario o Impuesto Adicional"
          />

          <div className="mt-6">
            <button
              onClick={() => setMostrarAvanzado(!mostrarAvanzado)}
              className="text-neon-cyan hover:text-neon-violet transition-colors mb-4"
            >
              {mostrarAvanzado ? '▼' : '▶'} Supuestos editables
            </button>

            {mostrarAvanzado && (
              <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-3">
                <Input label="Valor UF (CLP)" campo="valorUF" />
                <Input label="Valor UTM (CLP)" campo="valorUTM" />
                <Input label="Valor UTA (CLP)" campo="valorUTA" />
                <Input label="Tasa PPM (%)" campo="tasaPPM" />
                <p className="text-xs text-yellow-300 mt-2">
                  ⚠️ Verifica los valores vigentes en sii.cl antes de confiar en los resultados
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="flex gap-4 mt-8">
        {paso > 1 && (
          <button
            onClick={() => setPaso(paso - 1)}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            ← Anterior
          </button>
        )}
        
        {paso < 3 ? (
          <button
            onClick={() => setPaso(paso + 1)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-violet hover:scale-105 rounded-lg font-semibold transition-transform neon-glow"
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-violet hover:scale-105 rounded-lg font-semibold transition-transform neon-glow"
          >
            Calcular optimización
          </button>
        )}
      </div>
    </motion.div>
  );
}
