"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Plus,
  DollarSign,
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Receipt,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAppContext } from '@/contexts/AppContext';
import { PeriodConsistencyAlert } from '@/components/common/PeriodConsistencyAlert';
import { CustosOperacionaisModal } from '@/components/modals/CustosOperacionaisModal';
import {
  CustoOperacional,
  CustoOperacionalInput,
  CATEGORIAS_CUSTO_LABELS,
  CATEGORIAS_CUSTO_ICONS,
  CategoriaCusto
} from '@/types/custos-operacionais';
import { PeriodoImportacao } from '@/types/periodo';
import {
  mockCustosOperacionaisPorMes,
  obterCustosDoMes,
  obterResumoConsolidadoCustos
} from '@/data/mockCustosOperacionaisPorMes';
import {
  gerarUltimos12Meses,
  formatarPeriodoDisplay,
  sugerirMelhorPeriodo,
  obterStatusPeriodo
} from '@/utils/periodoUtils';
import { formatarMoeda } from '@/utils/calculosFinanceiros';
import { toast } from 'sonner';

const CORES_GRAFICO = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#F97316', '#84CC16'];

export default function CustosOperacionais() {
  const {
    custosOperacionais,
    vendasAnalise,
    periodoAtualGestao,
    statusPeriodos,
    setPeriodoGestao,
    addCustosPorPeriodo
  } = useAppContext();

  const [modalCustos, setModalCustos] = useState(false);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>('');
  const [custosVisualizacao, setCustosVisualizacao] = useState<CustoOperacional[]>([]);
  const [resumoConsolidado, setResumoConsolidado] = useState<any>(null);
  const [tabAtiva, setTabAtiva] = useState<'resumo' | 'detalhes' | 'graficos'>('resumo');

  const meses = gerarUltimos12Meses();

  // Estado derivado para período atual
  const periodoAtual = useMemo(() => {
    if (periodoSelecionado) {
      const mes = meses.find(m => m.mesReferencia === periodoSelecionado);
      if (mes) {
        return {
          tipo: 'MES_COMPLETO' as const,
          mesReferencia: mes.mesReferencia,
          ano: mes.ano,
          mes: mes.mes,
          dataInicio: mes.dataInicio,
          dataFim: mes.dataFim,
          status: 'EM_ANDAMENTO' as const,
          diasTotais: mes.diasTotais,
          diasImportados: 0
        };
      }
    }
    return null;
  }, [periodoSelecionado, meses]);

  // Carregar dados na inicialização
  useEffect(() => {
    const mesAtual = new Date();
    const mesRef = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}`;
    setPeriodoSelecionado(mesRef);

    // Carregar resumo consolidado
    const resumo = obterResumoConsolidadoCustos();
    setResumoConsolidado(resumo);
  }, []);

  // Atualizar custos quando período muda
  useEffect(() => {
    if (periodoSelecionado) {
      const dadosPeriodo = obterCustosDoMes(periodoSelecionado);
      if (dadosPeriodo) {
        setCustosVisualizacao(dadosPeriodo.custos);
      } else {
        setCustosVisualizacao([]);
      }
    }
  }, [periodoSelecionado]);

  const handlePeriodoChange = (novoMes: string) => {
    setPeriodoSelecionado(novoMes);

    const mesData = meses.find(m => m.mesReferencia === novoMes);
    if (mesData) {
      const periodo: PeriodoImportacao = {
        tipo: 'MES_COMPLETO',
        mesReferencia: novoMes,
        ano: mesData.ano,
        mes: mesData.mes,
        dataInicio: mesData.dataInicio,
        dataFim: mesData.dataFim,
        status: 'EM_ANDAMENTO',
        diasTotais: mesData.diasTotais,
        diasImportados: 0
      };

      setPeriodoGestao(periodo);
      toast.success(`Período alterado para ${formatarPeriodoDisplay(periodo)}`);
    }
  };

  const handleConfirmCustos = (custos: CustoOperacionalInput[], periodo: PeriodoImportacao) => {
    // Converter inputs para CustoOperacional completo
    const custosCompletos: CustoOperacional[] = custos.map((custo, index) => ({
      ...custo,
      id: `custo-${periodo.mesReferencia}-${Date.now()}-${index}`,
      periodoImportacao: periodo,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Atualizar no contexto
    addCustosPorPeriodo(periodo.mesReferencia, custosCompletos);

    // Atualizar visualização local
    setCustosVisualizacao(prev => [...prev, ...custosCompletos]);

    toast.success(`${custos.length} custos adicionados para ${formatarPeriodoDisplay(periodo)}`);
    setModalCustos(false);
  };

  const totalMesAtual = custosVisualizacao.reduce((acc, custo) => acc + custo.valor, 0);

  const custosPorCategoria = custosVisualizacao.reduce((acc, custo) => {
    acc[custo.categoria] = (acc[custo.categoria] || 0) + custo.valor;
    return acc;
  }, {} as Record<CategoriaCusto, number>);

  // Dados para gráficos
  const dadosEvolucao = meses.slice(0, 6).reverse().map(mes => {
    const dados = obterCustosDoMes(mes.mesReferencia);
    return {
      mes: mes.nome,
      total: dados ? dados.totalMes : 0
    };
  });

  const dadosCategoria = Object.entries(custosPorCategoria).map(([categoria, valor], index) => ({
    name: CATEGORIAS_CUSTO_LABELS[categoria as CategoriaCusto],
    value: valor,
    color: CORES_GRAFICO[index % CORES_GRAFICO.length]
  }));

  const statusPeriodoAtual = periodoAtual ? obterStatusPeriodo(
    periodoAtual.mesReferencia,
    vendasAnalise.vendasRegistradas,
    custosVisualizacao
  ) : null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Custos Operacionais
              </h1>
              <p className="text-sm text-gray-600">
                Gerencie custos operacionais por período para análise precisa de margem
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setModalCustos(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Custos
            </Button>
          </div>
        </div>

        {/* Period Status */}
        {periodoAtual && (
          <PeriodConsistencyAlert
            periodoCustos={periodoAtual}
            statusPeriodoCustos={statusPeriodoAtual || undefined}
            onFixInconsistency={() => setModalCustos(true)}
            onViewDetails={() => setTabAtiva('detalhes')}
          />
        )}

        {/* Period Selector */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Seleção de Período
              </CardTitle>
              {periodoAtual && (
                <Badge variant="outline">
                  {formatarPeriodoDisplay(periodoAtual)}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Select value={periodoSelecionado} onValueChange={handlePeriodoChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((mes) => (
                      <SelectItem key={mes.mesReferencia} value={mes.mesReferencia}>
                        <div className="flex items-center gap-2">
                          <span>{mes.nomeCompleto}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {formatarMoeda(totalMesAtual)}
                </p>
                <p className="text-xs text-gray-600">Total do Período</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {custosVisualizacao.length}
                </p>
                <p className="text-xs text-gray-600">Custos Registrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs value={tabAtiva} onValueChange={(value: any) => setTabAtiva(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumo">
              <BarChart3 className="h-4 w-4 mr-2" />
              Resumo
            </TabsTrigger>
            <TabsTrigger value="detalhes">
              <Eye className="h-4 w-4 mr-2" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="graficos">
              <TrendingUp className="h-4 w-4 mr-2" />
              Gráficos
            </TabsTrigger>
          </TabsList>

          {/* Tab: Resumo */}
          <TabsContent value="resumo" className="space-y-6">
            {/* Cards de Resumo por Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(custosPorCategoria).map(([categoria, valor]) => (
                <Card key={categoria}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {CATEGORIAS_CUSTO_ICONS[categoria as CategoriaCusto]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {CATEGORIAS_CUSTO_LABELS[categoria as CategoriaCusto]}
                        </p>
                        <p className="text-lg font-bold">
                          {formatarMoeda(valor)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Resumo Consolidado */}
            {resumoConsolidado && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Consolidado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">
                        {formatarMoeda(resumoConsolidado.custoTotalConsolidado)}
                      </p>
                      <p className="text-sm text-gray-600">Total Geral</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">
                        {formatarMoeda(resumoConsolidado.custoPorMesMedio)}
                      </p>
                      <p className="text-sm text-gray-600">Média Mensal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">
                        {resumoConsolidado.totalMeses}
                      </p>
                      <p className="text-sm text-gray-600">Meses Registrados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Detalhes */}
          <TabsContent value="detalhes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custos do Período</CardTitle>
              </CardHeader>
              <CardContent>
                {custosVisualizacao.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Nenhum custo registrado para este período</p>
                    <Button onClick={() => setModalCustos(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Custo
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {custosVisualizacao.map((custo) => (
                        <TableRow key={custo.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{CATEGORIAS_CUSTO_ICONS[custo.categoria]}</span>
                              <span>{CATEGORIAS_CUSTO_LABELS[custo.categoria]}</span>
                            </div>
                          </TableCell>
                          <TableCell>{custo.descricao}</TableCell>
                          <TableCell className="font-medium">
                            {formatarMoeda(custo.valor)}
                          </TableCell>
                          <TableCell>
                            {custo.dataVencimento.toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={custo.dataPagamento ? 'default' : 'secondary'}>
                              {custo.dataPagamento ? 'Pago' : 'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Gráficos */}
          <TabsContent value="graficos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Evolução */}
              <Card>
                <CardHeader>
                  <CardTitle>Evolução dos Custos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dadosEvolucao}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => formatarMoeda(value)} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: '#ef4444' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Categorias */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dadosCategoria}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {dadosCategoria.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatarMoeda(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal */}
        <CustosOperacionaisModal
          isOpen={modalCustos}
          onClose={() => setModalCustos(false)}
          onConfirm={handleConfirmCustos}
          periodoInicial={periodoAtual || undefined}
        />
      </div>
    </Layout>
  );
}