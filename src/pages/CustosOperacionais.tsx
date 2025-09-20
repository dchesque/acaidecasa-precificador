"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { CustoOperacional } from '@/types/financeiro';
import { CustosOperacionaisService } from '@/services/custosOperacionaisService';
import { useAppContext } from '@/contexts/AppContext';
import {
  formatarMoeda,
  formatarPercentual,
  obterNomeMes,
  obterNomeMesAbreviado,
  calcularVariacaoPercentual
} from '@/utils/calculosFinanceiros';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CustoFormData {
  mes: number;
  ano: number;
  valor: number;
  observacoes: string;
}

const CustosOperacionais = () => {
  const { custosOperacionais, setCustosOperacionais, addCustoOperacional, updateCustoOperacional, deleteCustoOperacional } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [filtroAno, setFiltroAno] = useState<number>(new Date().getFullYear());
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCusto, setEditingCusto] = useState<CustoOperacional | null>(null);
  const [formData, setFormData] = useState<CustoFormData>({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    valor: 0,
    observacoes: ''
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [metricas, setMetricas] = useState({
    custoMesAtual: 0,
    mediaDozeMeses: 0,
    variacaoMesAnterior: 0,
    totalAnoAtual: 0
  });
  const [evolucaoData, setEvolucaoData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (custosOperacionais.length > 0) {
      loadMetricas();
      loadEvolucaoData();
    }
  }, [custosOperacionais]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [custos, anos] = await Promise.all([
        CustosOperacionaisService.getAll(),
        CustosOperacionaisService.getAnosDisponiveis()
      ]);

      setCustosOperacionais(custos);
      setAnosDisponiveis(anos);
    } catch (error) {
      console.error('Erro ao carregar custos operacionais:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetricas = async () => {
    try {
      const metrics = await CustosOperacionaisService.getMetricasResumo();
      setMetricas(metrics);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const loadEvolucaoData = async () => {
    try {
      const evolucao = await CustosOperacionaisService.getEvolucaoUltimosMeses(12);
      setEvolucaoData(evolucao);
    } catch (error) {
      console.error('Erro ao carregar evolução:', error);
    }
  };

  const custosFiltrados = custosOperacionais.filter(custo => custo.ano === filtroAno);

  const handleOpenModal = (custo?: CustoOperacional) => {
    if (custo) {
      setEditingCusto(custo);
      setFormData({
        mes: custo.mes,
        ano: custo.ano,
        valor: custo.valor,
        observacoes: custo.observacoes || ''
      });
    } else {
      setEditingCusto(null);
      setFormData({
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
        valor: 0,
        observacoes: ''
      });
    }
    setFormErrors([]);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const validation = CustosOperacionaisService.validateCustoData(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      if (editingCusto) {
        const updated = await CustosOperacionaisService.update(editingCusto.id, formData);
        updateCustoOperacional(updated);
      } else {
        const created = await CustosOperacionaisService.create(formData);
        addCustoOperacional(created);
      }

      setModalOpen(false);
      await loadMetricas();
      await loadEvolucaoData();
    } catch (error: any) {
      setFormErrors([error.message || 'Erro ao salvar custo operacional']);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este custo operacional?')) {
      return;
    }

    try {
      await CustosOperacionaisService.delete(id);
      deleteCustoOperacional(id);
      await loadMetricas();
      await loadEvolucaoData();
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir custo operacional');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custos Operacionais</h1>
          <p className="text-gray-600 mt-1">Gerencie os custos mensais do seu negócio</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Custo
        </Button>
      </div>

      {/* Métricas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Mês Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(metricas.custoMesAtual)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média 12 Meses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(metricas.mediaDozeMeses)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variação Mês Anterior</CardTitle>
            {metricas.variacaoMesAnterior >= 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metricas.variacaoMesAnterior >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatarPercentual(metricas.variacaoMesAnterior)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ano Atual</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(metricas.totalAnoAtual)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução dos Custos - Últimos 12 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucaoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  fontSize={12}
                />
                <YAxis
                  fontSize={12}
                  tickFormatter={(value) => formatarMoeda(value)}
                />
                <Tooltip
                  formatter={(value: number) => [formatarMoeda(value), 'Custo']}
                  labelFormatter={(label) => `Período: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Histórico de Custos</CardTitle>
            <Select value={filtroAno.toString()} onValueChange={(value) => setFiltroAno(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anosDisponiveis.map(ano => (
                  <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="hidden md:table-cell">Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {custosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Nenhum custo operacional cadastrado para {filtroAno}
                    </TableCell>
                  </TableRow>
                ) : (
                  custosFiltrados.map((custo) => (
                    <TableRow key={custo.id}>
                      <TableCell>
                        <div className="font-medium">
                          {obterNomeMes(custo.mes)} {custo.ano}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{formatarMoeda(custo.valor)}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="max-w-xs truncate" title={custo.observacoes}>
                          {custo.observacoes || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenModal(custo)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(custo.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCusto ? 'Editar Custo Operacional' : 'Novo Custo Operacional'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {formErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mes">Mês</Label>
                <Select
                  value={formData.mes.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, mes: parseInt(value) }))}
                >
                  <SelectTrigger id="mes">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                      <SelectItem key={mes} value={mes.toString()}>
                        {obterNomeMes(mes)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <Select
                  value={formData.ano.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, ano: parseInt(value) }))}
                >
                  <SelectTrigger id="ano">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 2 + i).map(ano => (
                      <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor Total (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                max="1000000"
                value={formData.valor}
                onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Detalhamento dos custos do mês..."
                maxLength={500}
                rows={3}
              />
              <div className="text-xs text-gray-500 text-right">
                {formData.observacoes.length}/500
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingCusto ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustosOperacionais;