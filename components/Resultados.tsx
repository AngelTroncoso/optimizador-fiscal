'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DatosEntrada } from '@/lib/calculos';
import {
  calcularIVA,
  calcularRenta,
  calcularImpuestoDuenos,
  compararRegimenes,
  calcularEscenarios,
  proyectarFlujo,
  generarRecomendaciones,
  formatearCLP,
} from '@/lib/calculos';
import Graficos from './Graficos';
import Recomendaciones from './Recomendaciones';
import Cumplimiento from './Cumplimiento';

interface ResultadosProps {
  datos: DatosEntrada;
  onVolver: () => void;
}

export default function Resultados({ datos, onVolver }: ResultadosProps) {
  const [pestana, setPestana] = useState<'resumen' | 'comparacion' | 'escenarios' | 'flujo' | 'recomendaciones' | 'cumplimiento'>('resumen');

  const resultados = useMemo(() => {
    const iva = calcularIVA(datos);
    const renta = calcularRenta(datos);
    const duenos = calcularImpuestoDuenos(datos, renta);
    const comparacion = compararRegimenes(datos);
    const escenarios = calcularEscenarios(datos);
    const flujo = proyectarFlujo(datos);
    const recomendaciones = generarRecomendaciones(datos, renta, iva, comparacion);

    const impuestoTotal = renta.impuestoAPagar + duenos.impuestoNeto;
    const ingresosAnuales = datos.ingresosMensuales * 12;
    const tasaEfectiva = ingresosAnuales > 0 ? (impuestoTotal / ingresosAnuales) * 100 : 0;

    // Calcular ahorro potencial comparando con régimen menos eficiente
    const regimenesCalificados = comparacion.filter(r => r.califica);
    const mejor = regimenesCalificados[0];
    const peor = regimenesCalificados[regimenesCalificados.length - 1];
    const ahorroPotencial = peor && mejor ? peor.total - mejor.total : 0;

    return {
      iva,
      renta,
      duenos,
      comparacion,
      escenarios,
      flujo,
      recomendaciones,
      impuestoTotal,
      tasaEfectiva,
      ahorroPotencial,
    };
  }, [datos]);

  const KPI = ({ 
    titulo, 
    valor, 
    formato = 'clp', 
    color = 'cyan' 
  }: { 
    titulo: string; 
    valor: number; 
    formato?: 'clp' | 'porcentaje'; 
    color?: 'cyan' | 'violet' | 'green' | 'red';
  }) => {
    const colorClasses = {
      cyan: 'text-neon-cyan border-neon-cyan/30',
      violet: 'text-neon-violet border-neon-violet/30',
      green: 'text-green-400 border-green-400/30',
      red: 'text-red-400 border-red-400/30',
    };

    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`glass-card p-6 border-2 ${colorClasses[color]}`}
      >
        <p className="text-sm text-gray-400 mb-2">{titulo}</p>
        <motion.p
          key={valor}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-3xl font-bold ${colorClasses[color].split(' ')[0]}`}
        >
          {formato === 'clp' ? formatearCLP(valor) : `${valor.toFixed(1)}%`}
        </motion.p>
      </motion.div>
    );
  };

  const Pestanas = () => (
    <div className="flex flex-wrap gap-2 mb-6 no-print">
      {[
        { id: 'resumen', label: 'Resumen' },
        { id: 'comparacion', label: 'Comparar Regímenes' },
        { id: 'escenarios', label: 'Escenarios' },
        { id: 'flujo', label: 'Flujo 12 Meses' },
        { id: 'recomendaciones', label: 'Recomendaciones' },
        { id: 'cumplimiento', label: 'Gobierno y Cumplimiento' },
      ].map((p) => (
        <button
          key={p.id}
          onClick={() => setPestana(p.id as typeof pestana)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            pestana === p.id
              ? 'bg-gradient-to-r from-neon-cyan to-neon-violet neon-glow'
              : 'bg-white/5 hover:bg-white/10 border border-white/10'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6 no-print">
        <button
          onClick={onVolver}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
        >
          ← Volver
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-neon-violet/20 hover:bg-neon-violet/30 border border-neon-violet/50 rounded-lg transition-colors"
        >
          🖨️ Imprimir/Guardar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPI titulo="Impuesto Total a Pagar" valor={resultados.impuestoTotal} color="violet" />
        <KPI titulo="IVA a Pagar" valor={resultados.iva.aPagar} color="cyan" />
        <KPI 
          titulo="Ahorro Potencial" 
          valor={resultados.ahorroPotencial} 
          color={resultados.ahorroPotencial > 0 ? 'green' : 'cyan'} 
        />
        <KPI titulo="Tasa Efectiva" valor={resultados.tasaEfectiva} formato="porcentaje" color="red" />
      </div>

      <Pestanas />

      <AnimatePresence mode="wait">
        <motion.div
          key={pestana}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {pestana === 'resumen' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4 text-neon-cyan">IVA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Débito Fiscal</p>
                    <p className="text-lg font-semibold">{formatearCLP(resultados.iva.debitoFiscal)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Crédito Fiscal</p>
                    <p className="text-lg font-semibold">{formatearCLP(resultados.iva.creditoFiscal)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">A Pagar</p>
                    <p className="text-lg font-semibold text-neon-cyan">{formatearCLP(resultados.iva.aPagar)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Remanente</p>
                    <p className="text-lg font-semibold text-green-400">{formatearCLP(resultados.iva.remanente)}</p>
                  </div>
                </div>
                {resultados.iva.alertaCreditoNoRecuperable && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm">
                    ⚠️ Tienes una proporción alta de gastos sin IVA. Revisa si hay crédito fiscal no recuperable.
                  </div>
                )}
              </div>

              <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4 text-neon-violet">Impuesto de Primera Categoría</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Renta Bruta</p>
                    <p className="text-lg font-semibold">{formatearCLP(resultados.renta.rentaBruta)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Gastos Deducibles</p>
                    <p className="text-lg font-semibold">{formatearCLP(resultados.renta.gastosDeducibles)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Depreciación</p>
                    <p className="text-lg font-semibold">{formatearCLP(resultados.renta.depreciacion)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Renta Líquida</p>
                    <p className="text-lg font-semibold">{formatearCLP(resultados.renta.rentaLiquida)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Base Imponible</p>
                    <p className="text-lg font-semibold">{formatearCLP(resultados.renta.baseImponible)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Tasa Aplicada</p>
                    <p className="text-lg font-semibold">{resultados.renta.tasaAplicada.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Impuesto</p>
                    <p className="text-lg font-semibold text-neon-violet">{formatearCLP(resultados.renta.impuestoPrimeraCategoria)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">A Pagar (neto de PPM)</p>
                    <p className="text-lg font-semibold text-neon-cyan">{formatearCLP(resultados.renta.impuestoAPagar)}</p>
                  </div>
                </div>
                {resultados.renta.gastosRechazados > 0 && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                    ⚠️ Gastos rechazados: {formatearCLP(resultados.renta.gastosRechazados)} (se gravan con tasa del 40%)
                  </div>
                )}
              </div>

              <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4 text-green-400">Impuesto de los Dueños</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Tipo</p>
                    <p className="text-lg font-semibold capitalize">
                      {resultados.duenos.tipo.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Base Imponible</p>
                    <p className="text-lg font-semibold">{formatearCLP(resultados.duenos.baseImponible)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Impuesto Calculado</p>
                    <p className="text-lg font-semibold">{formatearCLP(resultados.duenos.impuesto)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Impuesto Neto</p>
                    <p className="text-lg font-semibold text-green-400">{formatearCLP(resultados.duenos.impuestoNeto)}</p>
                  </div>
                </div>
              </div>

              <Graficos 
                iva={resultados.iva}
                renta={resultados.renta}
                duenos={resultados.duenos}
              />
            </div>
          )}

          {pestana === 'comparacion' && (
            <div className="glass-card p-6">
              <h3 className="text-2xl font-bold mb-6 text-neon-cyan">Comparación de Regímenes</h3>
              <div className="space-y-4">
                {resultados.comparacion.map((reg, idx) => (
                  <div
                    key={reg.regimen}
                    className={`p-4 rounded-lg border-2 ${
                      reg.califica && idx === 0
                        ? 'bg-green-500/10 border-green-500'
                        : reg.califica
                        ? 'bg-white/5 border-white/10'
                        : 'bg-gray-800/50 border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold">{reg.regimen}</h4>
                      {reg.califica && idx === 0 && (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                          MÁS CONVENIENTE
                        </span>
                      )}
                      {!reg.califica && (
                        <span className="px-3 py-1 bg-gray-600 text-white text-xs font-bold rounded-full">
                          NO CALIFICA
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{reg.justificacion}</p>
                    {reg.califica && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Impuesto Empresa</p>
                          <p className="font-semibold">{formatearCLP(reg.impuestoEmpresa)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Impuesto Dueños</p>
                          <p className="font-semibold">{formatearCLP(reg.impuestoDuenos)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total</p>
                          <p className="font-semibold text-neon-cyan">{formatearCLP(reg.total)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tasa Efectiva</p>
                          <p className="font-semibold">{reg.tasaEfectiva.toFixed(1)}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {pestana === 'escenarios' && (
            <div className="glass-card p-6">
              <h3 className="text-2xl font-bold mb-6 text-neon-cyan">Escenarios de Proyección</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">Escenario</th>
                      <th className="text-right py-3 px-4">Impuesto Total</th>
                      <th className="text-right py-3 px-4">IVA a Pagar</th>
                      <th className="text-right py-3 px-4">Tasa Efectiva</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.escenarios.map((esc, idx) => (
                      <tr
                        key={esc.nombre}
                        className={`border-b border-white/5 ${idx === 1 ? 'bg-neon-cyan/10' : ''}`}
                      >
                        <td className="py-3 px-4 font-semibold">{esc.nombre}</td>
                        <td className="py-3 px-4 text-right">{formatearCLP(esc.impuestoTotal)}</td>
                        <td className="py-3 px-4 text-right">{formatearCLP(esc.ivaAPagar)}</td>
                        <td className="py-3 px-4 text-right">{esc.tasaEfectiva.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Conservador: -15% ingresos, +10% gastos | Base: datos ingresados | Optimista: +15% ingresos, -5% gastos
              </p>
            </div>
          )}

          {pestana === 'flujo' && (
            <div className="glass-card p-6">
              <h3 className="text-2xl font-bold mb-6 text-neon-cyan">Proyección de Flujo Tributario (12 meses)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">Mes</th>
                      <th className="text-right py-3 px-4">IVA</th>
                      <th className="text-right py-3 px-4">PPM</th>
                      <th className="text-right py-3 px-4">Renta Anual</th>
                      <th className="text-right py-3 px-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.flujo.map((mes) => (
                      <tr
                        key={mes.mes}
                        className={`border-b border-white/5 ${mes.mes === 4 ? 'bg-yellow-500/10' : ''}`}
                      >
                        <td className="py-3 px-4 font-semibold">
                          Mes {mes.mes} {mes.mes === 4 && '(Operación Renta)'}
                        </td>
                        <td className="py-3 px-4 text-right">{formatearCLP(mes.ivaMensual)}</td>
                        <td className="py-3 px-4 text-right">{formatearCLP(mes.ppmMensual)}</td>
                        <td className="py-3 px-4 text-right">{formatearCLP(mes.rentaAnual)}</td>
                        <td className="py-3 px-4 text-right font-bold text-neon-cyan">{formatearCLP(mes.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold mb-2">📅 Fechas Clave</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• F29 (IVA + PPM): Día 12 de cada mes</li>
                  <li>• Operación Renta: Abril de cada año</li>
                  <li>• Cambio de régimen: Comunicar al SII antes del 31 de diciembre</li>
                </ul>
              </div>
            </div>
          )}

          {pestana === 'recomendaciones' && (
            <Recomendaciones recomendaciones={resultados.recomendaciones} />
          )}

          {pestana === 'cumplimiento' && <Cumplimiento />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
