import { TaxCalculationInput, TaxCalculationResult, TaxRegime } from '../types';

/**
 * Motor de reglas fiscales para México (Actualizado Leyes 2026)
 */

// Tablas de ISR 2026 (Mensual proyectada con ajustes inflacionarios)
const ISR_TABLE_2026 = [
  { limit: 0.01, fixedFee: 0, rate: 0.0192 },
  { limit: 812.22, fixedFee: 15.58, rate: 0.064 },
  { limit: 6893.75, fixedFee: 404.82, rate: 0.1088 },
  { limit: 12115.08, fixedFee: 972.91, rate: 0.16 },
  { limit: 14083.24, fixedFee: 1287.81, rate: 0.1792 },
  { limit: 16861.45, fixedFee: 1785.67, rate: 0.2136 },
  { limit: 34007.18, fixedFee: 5447.98, rate: 0.2352 },
  { limit: 53600.05, fixedFee: 10056.21, rate: 0.3 },
  { limit: 102330.17, fixedFee: 24675.57, rate: 0.32 },
  { limit: 136441.63, fixedFee: 35590.89, rate: 0.34 },
  { limit: 409324.66, fixedFee: 128371.04, rate: 0.35 },
];

// Tasas RESICO 2026 (Vigentes según Ley del ISR)
const RESICO_TABLE_2026 = [
  { limit: 25000, rate: 0.01 },
  { limit: 50000, rate: 0.011 },
  { limit: 83333.33, rate: 0.015 },
  { limit: 208333.33, rate: 0.02 },
  { limit: 291666.66, rate: 0.025 }, // Hasta 3.5M anual
];

export function calculateTax(input: TaxCalculationInput): TaxCalculationResult {
  const { monthlyIncome, monthlyExpenses, regime } = input;
  let isrEstimated = 0;
  let taxableBase = 0;

  if (regime === 'RESICO') {
    // RESICO paga sobre ingresos brutos (sin deducciones para ISR)
    taxableBase = monthlyIncome;
    const rateEntry = RESICO_TABLE_2026.find(r => monthlyIncome <= r.limit) || RESICO_TABLE_2026[RESICO_TABLE_2026.length - 1];
    isrEstimated = monthlyIncome * rateEntry.rate;
  } else {
    // Actividad Empresarial o Sueldos
    taxableBase = Math.max(0, monthlyIncome - monthlyExpenses);
    
    // Buscar el renglón correspondiente en la tabla ISR 2026
    let row = ISR_TABLE_2026[0];
    for (let i = ISR_TABLE_2026.length - 1; i >= 0; i--) {
      if (taxableBase >= ISR_TABLE_2026[i].limit) {
        row = ISR_TABLE_2026[i];
        break;
      }
    }

    const excess = taxableBase - row.limit;
    isrEstimated = row.fixedFee + (excess * row.rate);
  }

  const netIncome = monthlyIncome - isrEstimated;
  const effectiveRate = monthlyIncome > 0 ? (isrEstimated / monthlyIncome) * 100 : 0;

  // Lógica de riesgo (Actualizada 2026)
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (regime === 'RESICO' && monthlyIncome > 291666) riskLevel = 'HIGH';
  if (regime === 'ACTIVIDAD_EMPRESARIAL' && monthlyExpenses / monthlyIncome > 0.95) riskLevel = 'MEDIUM';
  if (monthlyIncome > 150000) riskLevel = 'MEDIUM';

  const recommendations = getRecommendations(regime, monthlyIncome, monthlyExpenses, riskLevel);

  return {
    income: monthlyIncome,
    expenses: monthlyExpenses,
    taxableBase,
    isrEstimated,
    netIncome,
    effectiveRate,
    riskLevel,
    recommendations,
  };
}

function getRecommendations(regime: TaxRegime, income: number, expenses: number, risk: string): string[] {
  const recs = [];
  
  if (regime === 'RESICO') {
    recs.push('Recuerda que en RESICO no puedes deducir gastos para el cálculo de ISR.');
    recs.push('Asegúrate de emitir todas tus facturas (CFDI) global y nominativas.');
    if (income > 250000) recs.push('Estás cerca del límite mensual de RESICO. Monitorea tus ingresos anuales.');
  } else if (regime === 'ACTIVIDAD_EMPRESARIAL') {
    recs.push('Solicita factura de todos tus gastos indispensables para deducir.');
    if (expenses === 0) recs.push('No estás registrando gastos. Tu carga fiscal es máxima.');
  } else if (regime === 'SUELDOS') {
    recs.push('En el régimen de Sueldos, tus retenciones las hace tu patrón.');
    recs.push('Recuerda que puedes aplicar deducciones personales en tu declaración anual.');
  }

  if (risk === 'HIGH') {
    recs.push('Tu nivel de riesgo es alto. Considera una auditoría preventiva.');
  }

  recs.push('Recuerda presentar tu declaración antes del día 17 del mes siguiente.');
  
  return recs;
}
