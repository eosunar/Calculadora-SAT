import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { calculateTax } from '../lib/taxEngine';
import { TaxCalculationResult, TaxRegime } from '../types';
import { Calculator, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const formSchema = z.object({
  monthlyIncome: z.number().min(0, 'El ingreso debe ser positivo'),
  monthlyExpenses: z.number().min(0, 'Los gastos deben ser positivos'),
  regime: z.enum(['RESICO', 'ACTIVIDAD_EMPRESARIAL', 'SUELDOS'] as const),
});

type FormValues = z.infer<typeof formSchema>;

export function TaxCalculator() {
  const [result, setResult] = useState<TaxCalculationResult | null>(null);
  const { user } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyIncome: 0,
      monthlyExpenses: 0,
      regime: 'RESICO',
    },
  });

  async function onSubmit(values: FormValues) {
    const calcResult = calculateTax(values);
    setResult(calcResult);

    if (user) {
      try {
        await addDoc(collection(db, 'calculations'), {
          uid: user.uid,
          input: values,
          result: calcResult,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'calculations');
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="border-none shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] bg-white/90 backdrop-blur-xl ring-1 ring-slate-200/50">
        <CardHeader className="pb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">
            Simulador Fiscal
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Ingresa tus datos mensuales para obtener un análisis detallado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => onSubmit(v))} className="space-y-6">
              <FormField
                control={form.control}
                name="regime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Régimen Fiscal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu régimen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RESICO">RESICO (Confianza)</SelectItem>
                        <SelectItem value="ACTIVIDAD_EMPRESARIAL">Actividad Empresarial</SelectItem>
                        <SelectItem value="SUELDOS">Sueldos y Salarios</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monthlyIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingresos Mensuales (Brutos)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                        <Input 
                          className="pl-7" 
                          placeholder="0.00" 
                          type="number"
                          {...field} 
                          value={field.value === 0 ? '' : field.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === '' ? 0 : Number(val));
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monthlyExpenses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gastos Mensuales (Deducibles)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                        <Input 
                          className="pl-7" 
                          placeholder="0.00" 
                          type="number"
                          {...field} 
                          value={field.value === 0 ? '' : field.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === '' ? 0 : Number(val));
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg rounded-xl transition-all shadow-lg shadow-blue-200">
                Calcular Impuestos
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="border-none shadow-2xl bg-slate-900 text-white overflow-hidden relative min-h-[240px] flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <TrendingDown className="w-40 h-40 -mr-10 -mt-10 rotate-12" />
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent)]" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-sm font-bold text-blue-400 uppercase tracking-widest">ISR Estimado a Pagar</CardTitle>
                <div className="text-6xl font-black tracking-tighter mt-2">
                  ${result.isrEstimated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Tasa Efectiva</p>
                    <p className="text-xl font-bold">{result.effectiveRate.toFixed(2)}%</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Ingreso Neto</p>
                    <p className="text-xl font-bold">${result.netIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  result.riskLevel === 'LOW' ? 'bg-emerald-500/20 text-emerald-400' :
                  result.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-rose-500/20 text-rose-400'
                }`}>
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Nivel de Riesgo Fiscal: {result.riskLevel}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <Calculator className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-400">Esperando cálculos...</h3>
            <p className="text-slate-400 max-w-xs mt-2">Completa el formulario para ver tu análisis fiscal detallado.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
