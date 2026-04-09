import { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { CalculationHistory } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Trash2, History, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export function CalculationHistoryList() {
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'calculations'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CalculationHistory[];
      setHistory(docs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'calculations');
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'calculations', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `calculations/${id}`);
    }
  };

  if (!profile?.isPro) {
    return (
      <Card className="border-none shadow-xl bg-slate-50 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-white p-4 rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Historial Bloqueado</h3>
          <p className="text-slate-600 max-w-xs mb-6">
            Actualiza a **CalculaSAT Pro** para guardar tus cálculos y ver tu progreso fiscal.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8">
            Mejorar a Pro
          </Button>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 opacity-20">
            <History className="w-5 h-5" />
            Historial de Consultas
          </CardTitle>
        </CardHeader>
        <CardContent className="opacity-10">
          <div className="h-40 bg-slate-200 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <History className="w-6 h-6 text-blue-600" />
          Historial de Consultas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No tienes cálculos guardados aún.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Régimen</TableHead>
                <TableHead>Ingreso</TableHead>
                <TableHead>ISR Est.</TableHead>
                <TableHead>Riesgo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {item.input.regime}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${item.input.monthlyIncome.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-blue-600 font-bold">
                    ${item.result.isrEstimated.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      item.result.riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                      item.result.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                      'bg-rose-100 text-rose-700 hover:bg-rose-100'
                    }>
                      {item.result.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
