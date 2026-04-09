import { TaxCalculationInput, TaxCalculationResult, TaxRegime } from '../types';

/**
 * Motor de reglas fiscales para México (Estimaciones 2024/2025)
 */

// Tablas de ISR 2024 (Mensual simplificada para Actividad Empresarial y Sueldos)
const ISR_TABLE_2024 = [
  { limit: 0.01, fixedFee: 0, rate: 0.0192 },
  { limit: 746.05, fixedFee: 14.32, rate: 0.064 },
  { limit: 6332.06, fixedFee: 371.83, rate: 0.1088 },
  { limit: 11128.02, fixedFee: 893.63, rate: 0.16 },
  { limit: 12935.83, fixedFee: 1182.88, rate: 0.1792 },
  { limit: 15487.72, fixedFee: 1640.18, rate: 0.2136 },
  { limit: 31236.5, fixedFee: 5004.12, rate: 0.2352 },
  { limit: 49233.01, fixedFee: 9236.89, rate: 0.3 },
  { limit: 93993.91, fixedFee: 22665.17, rate: 0.32 },
  { limit: 125325.46, fixedFee: 32691.18, rate: 0.34 },
  { limit: 375975.62, fixedFee: 117912.23, rate: 0.35 },
];

// Tasas RESICO 2024 (Mensual)
const RESICO_RATES = [
  { limit: 25000, rate: 0.01 },
  { limit: 50000, rate: 0.11 }, // Error in my memory? No, it's 1.10%
  { limit: 83333.33, rate: 0.015 },
  { limit: 208333.33, rate: 0.02 },
  { limit: 3500000 / 12, rate: 0.025 },
];

// Corrected RESICO Rates (Actual SAT 2024)
const RESICO_TABLE = [
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
    const rateEntry = RESICO_TABLE.find(r => monthlyIncome <= r.limit) || RESICO_TABLE[RESICO_TABLE.length - 1];
    isrEstimated = monthlyIncome * rateEntry.rate;
  } else {
    // Actividad Empresarial o Sueldos (Sueldos no deduce gastos mensuales usualmente, pero aquí simulamos base gravable)
    taxableBase = Math.max(0, monthlyIncome - monthlyExpenses);
    
    // Buscar el renglón correspondiente en la tabla ISR
    let row = ISR_TABLE_2024[0];
    for (let i = ISR_TABLE_2024.length - 1; i >= 0; i--) {
      if (taxableBase >= ISR_TABLE_2024[i].limit) {
        row = ISR_TABLE_2024[i];
        break;
      }
    }

    const excess = taxableBase - row.limit;
    isrEstimated = row.fixedFee + (excess * row.rate);
  }

  const netIncome = monthlyIncome - isrEstimated;
  const effectiveRate = monthlyIncome > 0 ? (isrEstimated / monthlyIncome) * 100 : 0;

  // Lógica de riesgo (Simulada)
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (regime === 'RESICO' && monthlyIncome > 291666) riskLevel = 'HIGH';
  if (regime === 'ACTIVIDAD_EMPRESARIAL' && monthlyExpenses / monthlyIncome > 0.9) riskLevel = 'MEDIUM';
  if (monthlyIncome > 100000) riskLevel = 'MEDIUM';

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
  }

  if (risk === 'HIGH') {
    recs.push('Tu nivel de riesgo es alto. Considera una auditoría preventiva.');
  }

  recs.push('Recuerda presentar tu declaración antes del día 17 del mes siguiente.');
  
  return recs;
}
