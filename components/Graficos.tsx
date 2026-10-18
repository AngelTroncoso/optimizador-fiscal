'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { ResultadoIVA, ResultadoRenta, ResultadoDuenos } from '@/lib/calculos';
import { formatearCLP } from '@/lib/calculos';

interface GraficosProps {
  iva: ResultadoIVA;
  renta: ResultadoRenta;
  duenos: ResultadoDuenos;
}

export default function Graficos({ iva, renta, duenos }: GraficosProps) {
  const dataCargaTributaria = [
    { name: 'IVA a Pagar', value: iva.aPagar, color: '#00f0ff' },
    { name: 'Impuesto Empresa', value: renta.impuestoAPagar, color: '#bf00ff' },
    { name: 'Impuesto Dueños', value: duenos.impuestoNeto, color: '#10b981' },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 text-sm">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-neon-cyan">{formatearCLP(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (dataCargaTributaria.length === 0) {
    return (
      <div className="glass-card p-6">
        <p className="text-center text-gray-400">No hay carga tributaria para visualizar</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold mb-4 text-neon-cyan">Distribución de Carga Tributaria</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataCargaTributaria}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {dataCargaTributaria.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
