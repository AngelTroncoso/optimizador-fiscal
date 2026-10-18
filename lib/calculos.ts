import config from './config_chile.json';

export interface DatosEntrada {
  regimen: 'general' | 'propyme_general' | 'propyme_transparente';
  ingresosMensuales: number;
  comprasConIVA: number;
  gastosNecesarios: number;
  remuneraciones: number;
  arriendos: number;
  honorarios: number;
  gastosSinIVA: number;
  gastosRechazados: number;
  activosFijosNuevos: number;
  activosFijosUsados: number;
  perdidasAnteriores: number;
  remantenteIVA: number;
  ppmPagados: number;
  creditoDonaciones: number;
  retirosDividendos: number;
  duenosNoResidentes: boolean;
  ingresosPromedio3Anios: number;
  valorUF: number;
  valorUTM: number;
  valorUTA: number;
  tasaPPM: number;
}

export interface ResultadoIVA {
  debitoFiscal: number;
  creditoFiscal: number;
  remanente: number;
  aPagar: number;
  impactoCaja: number;
  alertaCreditoNoRecuperable: boolean;
}

export interface ResultadoRenta {
  rentaBruta: number;
  gastosDeducibles: number;
  gastosRechazados: number;
  ajusteArticulo21: number;
  depreciacion: number;
  rentaLiquida: number;
  perdidasArrastre: number;
  baseImponible: number;
  tasaAplicada: number;
  impuestoPrimeraCategoria: number;
  creditoPPM: number;
  creditoDonaciones: number;
  impuestoAPagar: number;
}

export interface ResultadoDuenos {
  baseImponible: number;
  impuesto: number;
  creditoPrimeraCategoria: number;
  impuestoNeto: number;
  tipo: 'global_complementario' | 'impuesto_adicional' | 'transparente';
}

export interface ComparacionRegimen {
  regimen: string;
  impuestoEmpresa: number;
  impuestoDuenos: number;
  total: number;
  tasaEfectiva: number;
  califica: boolean;
  justificacion: string;
}

export interface Escenario {
  nombre: string;
  impuestoTotal: number;
  ivaAPagar: number;
  tasaEfectiva: number;
}

export interface MesFlujo {
  mes: number;
  ivaMensual: number;
  ppmMensual: number;
  rentaAnual: number;
  total: number;
}

export interface Recomendacion {
  titulo: string;
  descripcion: string;
  ahorroEstimado: number;
  baseLegal: string;
  nivelRiesgo: 'bajo' | 'medio' | 'alto';
  pasos: string[];
  advertencia?: string;
}

// Formatear montos en CLP
export function formatearCLP(monto: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(monto));
}

// Calcular IVA
export function calcularIVA(datos: DatosEntrada): ResultadoIVA {
  const tasaIVA = config.tasas.iva.valor / 100;
  const ingresosAnuales = datos.ingresosMensuales * 12;
  
  const debitoFiscal = ingresosAnuales * tasaIVA;
  const creditoFiscal = datos.comprasConIVA * tasaIVA;
  const creditoTotal = creditoFiscal + datos.remantenteIVA;
  
  let aPagar = debitoFiscal - creditoTotal;
  let remanente = 0;
  
  if (aPagar < 0) {
    remanente = Math.abs(aPagar);
    aPagar = 0;
  }
  
  // Alerta si hay gastos sin IVA que podrían generar crédito no recuperable
  const alertaCreditoNoRecuperable = datos.gastosSinIVA > ingresosAnuales * 0.15;
  
  return {
    debitoFiscal,
    creditoFiscal: creditoTotal,
    remanente,
    aPagar,
    impactoCaja: aPagar,
    alertaCreditoNoRecuperable,
  };
}

// Calcular depreciación con opciones
export function calcularDepreciacion(
  activosNuevos: number,
  activosUsados: number,
  opciones: { tipo: 'normal' | 'acelerada' | 'instantanea'; valorUF: number }
): number {
  const { tipo, valorUF } = opciones;
  
  if (tipo === 'instantanea') {
    const limiteUF = config.depreciacion.instantanea.limite_uf;
    const limiteClp = limiteUF * valorUF;
    
    // Activos nuevos: 100% en el año
    const depreciacionNuevos = Math.min(activosNuevos, limiteClp);
    
    // Activos usados: solo si tienen máximo 2 años
    const depreciacionUsados = Math.min(activosUsados * 0.7, limiteClp * 0.5); // Estimación conservadora
    
    return depreciacionNuevos + depreciacionUsados;
  }
  
  // Depreciación normal: 10% anual promedio
  const tasaNormal = 0.1;
  const factor = tipo === 'acelerada' ? config.depreciacion.acelerada.factor : 1;
  
  return (activosNuevos + activosUsados) * tasaNormal * factor;
}

// Calcular Impuesto de Primera Categoría
export function calcularRenta(datos: DatosEntrada): ResultadoRenta {
  const ingresosAnuales = datos.ingresosMensuales * 12;
  
  // Gastos deducibles
  const gastosDeducibles =
    datos.comprasConIVA +
    datos.gastosNecesarios +
    datos.remuneraciones +
    datos.arriendos +
    datos.honorarios +
    datos.gastosSinIVA;
  
  // Depreciación instantánea
  const depreciacion = calcularDepreciacion(
    datos.activosFijosNuevos,
    datos.activosFijosUsados,
    { tipo: 'instantanea', valorUF: datos.valorUF }
  );
  
  // Renta líquida
  const rentaBruta = ingresosAnuales;
  const rentaLiquida = rentaBruta - gastosDeducibles - depreciacion;
  
  // Ajuste por gastos rechazados (Art. 21)
  const tasaArticulo21 = config.tasas.articulo_21.valor / 100;
  const ajusteArticulo21 = datos.gastosRechazados * tasaArticulo21;
  
  // Base imponible después de pérdidas
  let baseImponible = Math.max(0, rentaLiquida - datos.perdidasAnteriores);
  
  // Determinar tasa según régimen
  let tasaAplicada = 0;
  if (datos.regimen === 'general') {
    tasaAplicada = config.tasas.primera_categoria.regimen_general.valor / 100;
  } else if (datos.regimen === 'propyme_general') {
    tasaAplicada = config.tasas.primera_categoria.propyme_general.valor / 100;
  } else {
    tasaAplicada = 0; // Pro Pyme Transparente
  }
  
  const impuestoPrimeraCategoria = baseImponible * tasaAplicada + ajusteArticulo21;
  
  // Créditos
  const impuestoAPagar = Math.max(
    0,
    impuestoPrimeraCategoria - datos.ppmPagados - datos.creditoDonaciones
  );
  
  return {
    rentaBruta,
    gastosDeducibles,
    gastosRechazados: datos.gastosRechazados,
    ajusteArticulo21,
    depreciacion,
    rentaLiquida,
    perdidasArrastre: datos.perdidasAnteriores,
    baseImponible,
    tasaAplicada: tasaAplicada * 100,
    impuestoPrimeraCategoria,
    creditoPPM: datos.ppmPagados,
    creditoDonaciones: datos.creditoDonaciones,
    impuestoAPagar,
  };
}

// Calcular Impuesto Global Complementario por tramos
export function calcularGlobalComplementario(
  baseImponible: number,
  valorUTA: number
): number {
  const baseEnUTA = baseImponible / valorUTA;
  const tramos = config.tramos_global_complementario.tramos;
  
  let impuesto = 0;
  
  for (const tramo of tramos) {
    if (baseEnUTA > tramo.desde_uta) {
      if (baseEnUTA <= tramo.hasta_uta || tramo.hasta_uta === 999999) {
        impuesto = baseEnUTA * tramo.factor - tramo.deducir_uta * valorUTA;
        break;
      }
    }
  }
  
  return Math.max(0, impuesto);
}

// Calcular impuestos de los dueños
export function calcularImpuestoDuenos(
  datos: DatosEntrada,
  resultadoRenta: ResultadoRenta
): ResultadoDuenos {
  const retirosDividendos = datos.retirosDividendos;
  
  if (datos.regimen === 'propyme_transparente') {
    // Tributación directa en dueños
    const impuesto = datos.duenosNoResidentes
      ? retirosDividendos * (config.tasas.impuesto_adicional.valor / 100)
      : calcularGlobalComplementario(retirosDividendos, datos.valorUTA);
    
    return {
      baseImponible: retirosDividendos,
      impuesto,
      creditoPrimeraCategoria: 0,
      impuestoNeto: impuesto,
      tipo: datos.duenosNoResidentes ? 'impuesto_adicional' : 'transparente',
    };
  }
  
  // Régimen General y Pro Pyme General
  if (datos.duenosNoResidentes) {
    const impuestoAdicional =
      retirosDividendos * (config.tasas.impuesto_adicional.valor / 100);
    const credito = resultadoRenta.impuestoPrimeraCategoria;
    
    return {
      baseImponible: retirosDividendos,
      impuesto: impuestoAdicional,
      creditoPrimeraCategoria: credito,
      impuestoNeto: Math.max(0, impuestoAdicional - credito),
      tipo: 'impuesto_adicional',
    };
  }
  
  // Dueños residentes con Global Complementario
  const impuestoGlobal = calcularGlobalComplementario(retirosDividendos, datos.valorUTA);
  const credito = resultadoRenta.impuestoPrimeraCategoria;
  
  return {
    baseImponible: retirosDividendos,
    impuesto: impuestoGlobal,
    creditoPrimeraCategoria: credito,
    impuestoNeto: Math.max(0, impuestoGlobal - credito),
    tipo: 'global_complementario',
  };
}

// Comparar regímenes tributarios
export function compararRegimenes(datos: DatosEntrada): ComparacionRegimen[] {
  const ingresosPromedioUF = datos.ingresosPromedio3Anios / datos.valorUF;
  const limiteProPyme = config.limites.propyme_uf.valor;
  const calificaProPyme = ingresosPromedioUF <= limiteProPyme;
  
  const regimenes: ComparacionRegimen[] = [];
  
  // Régimen General
  const datosGeneral = { ...datos, regimen: 'general' as const };
  const rentaGeneral = calcularRenta(datosGeneral);
  const duenosGeneral = calcularImpuestoDuenos(datosGeneral, rentaGeneral);
  const totalGeneral = rentaGeneral.impuestoAPagar + duenosGeneral.impuestoNeto;
  
  regimenes.push({
    regimen: 'Régimen General (14 A)',
    impuestoEmpresa: rentaGeneral.impuestoAPagar,
    impuestoDuenos: duenosGeneral.impuestoNeto,
    total: totalGeneral,
    tasaEfectiva: (totalGeneral / (datos.ingresosMensuales * 12)) * 100,
    califica: true,
    justificacion: 'Disponible para todas las empresas. Tasa 27%.',
  });
  
  if (calificaProPyme) {
    // Pro Pyme General
    const datosPymeG = { ...datos, regimen: 'propyme_general' as const };
    const rentaPymeG = calcularRenta(datosPymeG);
    const duenosPymeG = calcularImpuestoDuenos(datosPymeG, rentaPymeG);
    const totalPymeG = rentaPymeG.impuestoAPagar + duenosPymeG.impuestoNeto;
    
    regimenes.push({
      regimen: 'Pro Pyme General (14 D N°3)',
      impuestoEmpresa: rentaPymeG.impuestoAPagar,
      impuestoDuenos: duenosPymeG.impuestoNeto,
      total: totalPymeG,
      tasaEfectiva: (totalPymeG / (datos.ingresosMensuales * 12)) * 100,
      califica: true,
      justificacion: 'Tasa rebajada 25%. Califica por nivel de ingresos.',
    });
    
    // Pro Pyme Transparente
    const datosPymeT = { ...datos, regimen: 'propyme_transparente' as const };
    const rentaPymeT = calcularRenta(datosPymeT);
    const duenosPymeT = calcularImpuestoDuenos(datosPymeT, rentaPymeT);
    const totalPymeT = rentaPymeT.impuestoAPagar + duenosPymeT.impuestoNeto;
    
    regimenes.push({
      regimen: 'Pro Pyme Transparente (14 D N°8)',
      impuestoEmpresa: rentaPymeT.impuestoAPagar,
      impuestoDuenos: duenosPymeT.impuestoNeto,
      total: totalPymeT,
      tasaEfectiva: (totalPymeT / (datos.ingresosMensuales * 12)) * 100,
      califica: true,
      justificacion: 'Sin impuesto corporativo. Tributación directa en dueños.',
    });
  } else {
    regimenes.push({
      regimen: 'Pro Pyme General',
      impuestoEmpresa: 0,
      impuestoDuenos: 0,
      total: 0,
      tasaEfectiva: 0,
      califica: false,
      justificacion: `No califica. Ingresos promedio exceden ${limiteProPyme.toLocaleString('es-CL')} UF.`,
    });
    
    regimenes.push({
      regimen: 'Pro Pyme Transparente',
      impuestoEmpresa: 0,
      impuestoDuenos: 0,
      total: 0,
      tasaEfectiva: 0,
      califica: false,
      justificacion: `No califica. Ingresos promedio exceden ${limiteProPyme.toLocaleString('es-CL')} UF.`,
    });
  }
  
  return regimenes.sort((a, b) => {
    if (a.califica && !b.califica) return -1;
    if (!a.califica && b.califica) return 1;
    return a.total - b.total;
  });
}

// Calcular escenarios (conservador, base, optimista)
export function calcularEscenarios(datosBase: DatosEntrada): Escenario[] {
  const escenarios: Escenario[] = [];
  
  // Conservador: -15% ingresos, +10% gastos
  const conservador = {
    ...datosBase,
    ingresosMensuales: datosBase.ingresosMensuales * 0.85,
    comprasConIVA: datosBase.comprasConIVA * 1.1,
    gastosNecesarios: datosBase.gastosNecesarios * 1.1,
  };
  const rentaC = calcularRenta(conservador);
  const duenosC = calcularImpuestoDuenos(conservador, rentaC);
  const ivaC = calcularIVA(conservador);
  
  escenarios.push({
    nombre: 'Conservador',
    impuestoTotal: rentaC.impuestoAPagar + duenosC.impuestoNeto,
    ivaAPagar: ivaC.aPagar,
    tasaEfectiva: ((rentaC.impuestoAPagar + duenosC.impuestoNeto) / (conservador.ingresosMensuales * 12)) * 100,
  });
  
  // Base
  const rentaB = calcularRenta(datosBase);
  const duenosB = calcularImpuestoDuenos(datosBase, rentaB);
  const ivaB = calcularIVA(datosBase);
  
  escenarios.push({
    nombre: 'Base',
    impuestoTotal: rentaB.impuestoAPagar + duenosB.impuestoNeto,
    ivaAPagar: ivaB.aPagar,
    tasaEfectiva: ((rentaB.impuestoAPagar + duenosB.impuestoNeto) / (datosBase.ingresosMensuales * 12)) * 100,
  });
  
  // Optimista: +15% ingresos, -5% gastos
  const optimista = {
    ...datosBase,
    ingresosMensuales: datosBase.ingresosMensuales * 1.15,
    comprasConIVA: datosBase.comprasConIVA * 0.95,
    gastosNecesarios: datosBase.gastosNecesarios * 0.95,
  };
  const rentaO = calcularRenta(optimista);
  const duenosO = calcularImpuestoDuenos(optimista, rentaO);
  const ivaO = calcularIVA(optimista);
  
  escenarios.push({
    nombre: 'Optimista',
    impuestoTotal: rentaO.impuestoAPagar + duenosO.impuestoNeto,
    ivaAPagar: ivaO.aPagar,
    tasaEfectiva: ((rentaO.impuestoAPagar + duenosO.impuestoNeto) / (optimista.ingresosMensuales * 12)) * 100,
  });
  
  return escenarios;
}

// Proyección de flujo de caja mensual
export function proyectarFlujo(datos: DatosEntrada): MesFlujo[] {
  const flujo: MesFlujo[] = [];
  const ivaMensual = calcularIVA(datos).aPagar / 12;
  const ppmMensual = datos.ingresosMensuales * (datos.tasaPPM / 100);
  const rentaAnual = calcularRenta(datos).impuestoAPagar;
  
  for (let mes = 1; mes <= 12; mes++) {
    const rentaMes = mes === 4 ? rentaAnual : 0; // Abril: Operación Renta
    
    flujo.push({
      mes,
      ivaMensual,
      ppmMensual,
      rentaAnual: rentaMes,
      total: ivaMensual + ppmMensual + rentaMes,
    });
  }
  
  return flujo;
}

// Generar recomendaciones personalizadas
export function generarRecomendaciones(
  datos: DatosEntrada,
  resultadoRenta: ResultadoRenta,
  resultadoIVA: ResultadoIVA,
  comparacion: ComparacionRegimen[]
): Recomendacion[] {
  const recomendaciones: Recomendacion[] = [];
  
  // Cambio de régimen
  const regimenesCalificados = comparacion.filter(r => r.califica);
  if (regimenesCalificados.length > 1) {
    const actual = regimenesCalificados.find(r => 
      r.regimen.includes(datos.regimen === 'general' ? 'General (14 A)' : 
      datos.regimen === 'propyme_general' ? 'General (14 D' : 'Transparente')
    );
    const mejor = regimenesCalificados[0];
    
    if (actual && mejor.regimen !== actual.regimen) {
      recomendaciones.push({
        titulo: 'Evaluar cambio de régimen tributario',
        descripcion: `El régimen ${mejor.regimen} podría reducir tu carga tributaria total.`,
        ahorroEstimado: actual.total - mejor.total,
        baseLegal: 'Art. 14 Ley de la Renta',
        nivelRiesgo: 'bajo',
        pasos: [
          'Revisar requisitos y restricciones del régimen objetivo',
          'Evaluar impacto en flujo de caja y utilidades',
          'Comunicar cambio al SII antes del 31 de diciembre',
          'Consultar con contador sobre efectos en períodos futuros',
        ],
      });
    }
  }
  
  // Depreciación instantánea
  const totalActivos = datos.activosFijosNuevos + datos.activosFijosUsados;
  const limiteInstantanea = config.depreciacion.instantanea.limite_uf * datos.valorUF;
  
  if (totalActivos > 0 && totalActivos < limiteInstantanea * 0.8) {
    const ahorroDepreciacion = totalActivos * (resultadoRenta.tasaAplicada / 100);
    
    recomendaciones.push({
      titulo: 'Aprovechar depreciación instantánea',
      descripcion: 'Deduce el 100% de tus activos nuevos (o usados hasta 2 años) en el mismo año.',
      ahorroEstimado: ahorroDepreciacion,
      baseLegal: 'Ley 21.256 - Depreciación instantánea PYME',
      nivelRiesgo: 'bajo',
      pasos: [
        'Verificar que los activos cumplan requisitos (nuevos o usados máximo 2 años)',
        'Respaldar facturas y fechas de compra',
        'Declarar depreciación instantánea en Formulario 22',
        'Mantener registro de activos para fiscalización',
      ],
    });
  }
  
  // Gastos rechazados
  if (datos.gastosRechazados > datos.ingresosMensuales * 0.05) {
    recomendaciones.push({
      titulo: 'Reducir gastos rechazados',
      descripcion: 'Los gastos rechazados se gravan con tasa del 40% (Art. 21). Ordena tu documentación.',
      ahorroEstimado: resultadoRenta.ajusteArticulo21,
      baseLegal: 'Art. 21 Ley de la Renta',
      nivelRiesgo: 'bajo',
      pasos: [
        'Revisar gastos sin respaldo documental o ajenos al giro',
        'Obtener facturas y órdenes de compra faltantes',
        'Implementar política de aprobación de gastos',
        'Separar gastos personales de los del negocio',
      ],
      advertencia: 'Gastos rechazados pueden generar multas en fiscalización.',
    });
  }
  
  // Pérdidas de arrastre
  if (datos.perdidasAnteriores > resultadoRenta.baseImponible * 0.5) {
    recomendaciones.push({
      titulo: 'Optimizar uso de pérdidas tributarias',
      descripcion: 'Tienes pérdidas acumuladas que puedes usar para reducir tu base imponible.',
      ahorroEstimado: datos.perdidasAnteriores * (resultadoRenta.tasaAplicada / 100),
      baseLegal: 'Art. 31 N°3 Ley de la Renta',
      nivelRiesgo: 'bajo',
      pasos: [
        'Verificar saldo de pérdidas en declaraciones anteriores',
        'Aplicar pérdidas en orden cronológico',
        'Proyectar cuántos años tardarás en absorberlas',
        'Considerar estrategias para generar utilidades si las pérdidas están por vencer',
      ],
    });
  }
  
  // Ajuste de PPM
  const ppmAnual = datos.ppmPagados;
  const impuestoFinal = resultadoRenta.impuestoAPagar;
  
  if (ppmAnual > impuestoFinal * 1.3) {
    recomendaciones.push({
      titulo: 'Ajustar tasa de PPM',
      descripcion: 'Estás pagando PPM en exceso. Solicita rebaja de tasa para mejorar tu flujo de caja.',
      ahorroEstimado: ppmAnual - impuestoFinal,
      baseLegal: 'Art. 84 letra a) Ley de la Renta',
      nivelRiesgo: 'bajo',
      pasos: [
        'Presentar solicitud de rebaja de tasa PPM al SII',
        'Adjuntar proyección de ingresos y gastos del año',
        'Esperar resolución (automática o con revisión)',
        'Aplicar nueva tasa desde el mes siguiente',
      ],
    });
  }
  
  // Planificar retiros
  if (datos.retirosDividendos < resultadoRenta.baseImponible * 0.3 && resultadoRenta.baseImponible > 0) {
    recomendaciones.push({
      titulo: 'Planificar retiros de utilidades',
      descripcion: 'Programa tus retiros para aprovechar créditos y minimizar Global Complementario.',
      ahorroEstimado: 0,
      baseLegal: 'Art. 54 y 56 Ley de la Renta',
      nivelRiesgo: 'medio',
      pasos: [
        'Proyectar tus ingresos personales del año',
        'Calcular tramos del Global Complementario',
        'Retirar hasta el límite del tramo sin saltar al siguiente',
        'Considerar diferir retiros a años de menores ingresos',
      ],
      advertencia: 'Evalúa con tu contador si aplica reinversión de utilidades u otros créditos.',
    });
  }
  
  // Crédito fiscal por donaciones
  if (datos.creditoDonaciones === 0 && resultadoRenta.baseImponible > datos.valorUF * 1000) {
    recomendaciones.push({
      titulo: 'Considerar donaciones con beneficio tributario',
      descripcion: 'Las donaciones pueden generar crédito contra el Impuesto de Primera Categoría.',
      ahorroEstimado: 0,
      baseLegal: 'Ley 19.885 de donaciones',
      nivelRiesgo: 'bajo',
      pasos: [
        'Identificar instituciones acreditadas',
        'Verificar límite (2% de la Renta Líquida Imponible o 14.000 UTM)',
        'Obtener certificado de donación',
        'Declarar crédito en Formulario 22',
      ],
    });
  }
  
  // Remanente IVA
  if (resultadoIVA.remanente > datos.ingresosMensuales * 0.5) {
    recomendaciones.push({
      titulo: 'Gestionar remanente de IVA',
      descripcion: 'Tienes un remanente alto de IVA. Solicita devolución o imputación si es recurrente.',
      ahorroEstimado: resultadoIVA.remanente,
      baseLegal: 'Art. 27 bis DL 825',
      nivelRiesgo: 'bajo',
      pasos: [
        'Revisar si el remanente es recurrente o transitorio',
        'Solicitar devolución mensual si calificas (exportadores, zonas francas)',
        'Imputar remanente a períodos siguientes',
        'Evaluar si hay crédito fiscal no recuperable por errores',
      ],
    });
  }
  
  return recomendaciones.slice(0, 8); // Máximo 8 recomendaciones
}
