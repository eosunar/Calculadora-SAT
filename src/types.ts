export type TaxRegime = 'RESICO' | 'ACTIVIDAD_EMPRESARIAL' | 'SUELDOS';

export interface TaxCalculationInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  regime: TaxRegime;
}

export interface TaxCalculationResult {
  income: number;
  expenses: number;
  taxableBase: number;
  isrEstimated: number;
  netIncome: number;
  effectiveRate: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  isPro: boolean;
  regime?: TaxRegime;
  createdAt: string;
}

export interface CalculationHistory {
  id: string;
  uid: string;
  input: TaxCalculationInput;
  result: TaxCalculationResult;
  createdAt: string;
}
