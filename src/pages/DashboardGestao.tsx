"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  Calendar as CalendarIcon,
  Download,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppContext } from '@/contexts/AppContext';
import {
  formatarMoeda,
  formatarPercentual,
  calcularLucroLiquido,
  calcularMargemLiquida,
  calcularPontoEquilibrio,
  calcularTaxaAbsorcao,
  calcularVariacaoPercentual,
  obterNomeMes
} from '@/utils/calculosFinanceiros';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPieChart,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import { DashboardGestaoMetricas, PeriodoDashboard } from '@/types/financeiro';
import { CustosOperacionaisService } from '@/services/custosOperacionaisService';

const CORES_GRAFICO = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

const DashboardGestao = () => {
  const { vendasAnalise, custosOperacionais, dashboardGestao, setDashboardGestaoPeriodo, setDashboardGestaoLoading } = useAppContext();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState<DashboardGestaoMetricas | null>(null);
  const [periodo, setPeriodo] = useState<PeriodoDashboard>(() => {
    // Verificar se há parâmetros de URL para período
    const inicioParam = searchParams.get('inicio');
    const fimParam = searchParams.get('fim');

    if (inicioParam && fimParam) {
      return {
        inicio: new Date(inicioParam),
        fim: new Date(fimParam)
      };
    }

    return {
      inicio: startOfMonth(subMonths(new Date(), 11)),
      fim: endOfMonth(new Date())
    };
  });
  const [evolucaoData, setEvolucaoData] = useState<any[]>([]);
  const [comparacaoData, setComparacaoData] = useState<any[]>([]);
  const [composicaoData, setComposicaoData] = useState<any[]>([]);
  const [resumoMensal, setResumoMensal] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [periodo, vendasAnalise.dashboardData, custosOperacionais]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setDashboardGestaoLoading(true);

      // Calcular métricas do período
      const metrics = await calcularMetricasPeriodo();
      setMetricas(metrics);

      // Carregar dados para gráficos
      await Promise.all([
        loadEvolucaoData(),
        loadComparacaoData(),
        loadComposicaoData(),
        loadResumoMensalData(),
        checkAlertas(metrics)
      ]);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
      setDashboardGestaoLoading(false);
    }
  };

  const calcularMetricasPeriodo = async (): Promise<DashboardGestaoMetricas> => {
    // Dados de vendas do período
    const vendasDashboard = vendasAnalise.dashboardData;
    const receita = vendasDashboard?.totalReceita || 0;
    const cpv = vendasDashboard?.totalCPV || 0;
    const lucroBruto = receita - cpv;

    // Custos operacionais do período
    const mesInicio = periodo.inicio.getMonth() + 1;
    const anoInicio = periodo.inicio.getFullYear();
    const mesFim = periodo.fim.getMonth() + 1;
    const anoFim = periodo.fim.getFullYear();

    let custoOperacional = 0;
    for (let ano = anoInicio; ano <= anoFim; ano++) {
      const mesInicioAno = ano === anoInicio ? mesInicio : 1;
      const mesFimAno = ano === anoFim ? mesFim : 12;

      for (let mes = mesInicioAno; mes <= mesFimAno; mes++) {
        const custo = custosOperacionais.find(c => c.mes === mes && c.ano === ano);
        if (custo) {
          custoOperacional += custo.valor;
        }
      }
    }

    const lucroLiquido = calcularLucroLiquido(lucroBruto, custoOperacional);
    const margemLiquida = calcularMargemLiquida(lucroLiquido, receita);
    const margemBrutaPercentual = receita > 0 ? (lucroBruto / receita) * 100 : 0;
    const pontoEquilibrio = calcularPontoEquilibrio(custoOperacional, margemBrutaPercentual);
    const taxaAbsorcao = calcularTaxaAbsorcao(custoOperacional, receita);

    // Ticket médio necessário (assumindo média de vendas do período)
    const quantidadeVendas = vendasDashboard?.quantidadeVendas || 1;
    const ticketMedioNecessario = pontoEquilibrio / quantidadeVendas;

    return {
      receita,
      cpv,
      lucroBruto,
      custoOperacional,
      lucroLiquido,
      margemLiquida,
      pontoEquilibrio,
      taxaAbsorcao,
      ticketMedioNecessario
    };
  };

  const loadEvolucaoData = async () => {
    const meses = [];
    const dataAtual = new Date();

    for (let i = 11; i >= 0; i--) {
      const data = subMonths(dataAtual, i);
      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();

      // Buscar dados de vendas (mock - idealmente viria do serviço)
      const receitaMes = Math.random() * 50000 + 30000; // Mock data
      const cpvMes = receitaMes * (0.4 + Math.random() * 0.2);
      const lucroBrutoMes = receitaMes - cpvMes;

      // Buscar custo operacional
      const custoMes = custosOperacionais.find(c => c.mes === mes && c.ano === ano)?.valor || 0;
      const lucroLiquidoMes = lucroBrutoMes - custoMes;
      const margemLiquidaMes = calcularMargemLiquida(lucroLiquidoMes, receitaMes);

      meses.push({
        periodo: `${obterNomeMes(mes).substr(0, 3)}/${ano}`,
        receita: receitaMes,
        cpv: cpvMes,
        lucroBruto: lucroBrutoMes,
        custoOperacional: custoMes,
        lucroLiquido: lucroLiquidoMes,
        margemLiquida: margemLiquidaMes
      });
    }

    setEvolucaoData(meses);
  };

  const loadComparacaoData = async () => {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth() + 1;
    const anoAtual = dataAtual.getFullYear();

    // Dados do mês atual, anterior e mesmo mês do ano anterior
    const comparacao = [
      {
        periodo: 'Mês Atual',
        receita: 45000,
        lucroBruto: 27000,
        lucroLiquido: 5000,
        cor: '#8B5CF6'
      },
      {
        periodo: 'Mês Anterior',
        receita: 42000,
        lucroBruto: 25000,
        lucroLiquido: 3000,
        cor: '#06B6D4'
      },
      {
        periodo: 'Ano Anterior',
        receita: 38000,
        lucroBruto: 22000,
        lucroLiquido: 1000,
        cor: '#10B981'
      }
    ];

    setComparacaoData(comparacao);
  };

  const loadComposicaoData = async () => {
    if (!metricas) return;

    const composicao = [
      {
        name: 'CPV',
        value: metricas.cpv,
        color: '#EF4444'
      },
      {
        name: 'Custo Operacional',
        value: metricas.custoOperacional,
        color: '#F59E0B'
      },
      {
        name: 'Lucro Líquido',
        value: metricas.lucroLiquido,
        color: '#10B981'
      }
    ];

    setComposicaoData(composicao);
  };

  const loadResumoMensalData = async () => {
    // Usar os mesmos dados da evolução para o resumo mensal
    setResumoMensal(evolucaoData);
  };

  const checkAlertas = async (metrics: DashboardGestaoMetricas) => {
    const novosAlertas = [];

    if (metrics.margemLiquida < 10) {
      novosAlertas.push({
        tipo: 'warning',
        titulo: 'Margem Líquida Baixa',
        descricao: `Margem líquida de ${formatarPercentual(metrics.margemLiquida)} está abaixo do recomendado (10%)`
      });
    }

    if (metrics.taxaAbsorcao > 50) {
      novosAlertas.push({
        tipo: 'error',
        titulo: 'Custo Operacional Alto',
        descricao: `Custos operacionais representam ${formatarPercentual(metrics.taxaAbsorcao)} da receita`
      });
    }

    if (metrics.lucroLiquido < 0) {
      novosAlertas.push({
        tipo: 'error',
        titulo: 'Lucro Líquido Negativo',
        descricao: 'O negócio está operando com prejuízo no período'
      });
    }

    setAlertas(novosAlertas);
  };

  const handlePeriodoChange = (novoInicio: Date, novoFim: Date) => {
    const novoPeriodo = { inicio: novoInicio, fim: novoFim };
    setPeriodo(novoPeriodo);
    setDashboardGestaoPeriodo(novoPeriodo);
  };

  const exportarRelatorio = async () => {
    // Implementar exportação para PDF
    console.log('Exportar relatório');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Gestão</h1>
          <p className="text-gray-600 mt-1">Visão consolidada do desempenho financeiro</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportarRelatorio}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filtros de Período */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2">
              <Label>Período de Análise</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(periodo.inicio, 'dd/MM/yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={periodo.inicio}
                      onSelect={(date) => date && handlePeriodoChange(date, periodo.fim)}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <span className="self-center">até</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(periodo.fim, 'dd/MM/yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={periodo.fim}
                      onSelect={(date) => date && handlePeriodoChange(periodo.inicio, date)}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button onClick={loadDashboardData}>
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="space-y-3">
          {alertas.map((alerta, index) => (
            <Alert key={index} variant={alerta.tipo === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alerta.titulo}:</strong> {alerta.descricao}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* KPIs Principais */}
      {metricas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarMoeda(metricas.receita)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Bruto</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatarMoeda(metricas.lucroBruto)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
              {metricas.lucroLiquido >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metricas.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatarMoeda(metricas.lucroLiquido)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Margem Líquida</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metricas.margemLiquida >= 10 ? 'text-green-600' : 'text-yellow-600'}`}>
                {formatarPercentual(metricas.margemLiquida)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ponto de Equilíbrio</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarMoeda(metricas.pontoEquilibrio)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Absorção</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metricas.taxaAbsorcao <= 50 ? 'text-green-600' : 'text-red-600'}`}>
                {formatarPercentual(metricas.taxaAbsorcao)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      <Tabs defaultValue="evolucao" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          <TabsTrigger value="composicao">Composição</TabsTrigger>
          <TabsTrigger value="comparacao">Comparação</TabsTrigger>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
        </TabsList>

        <TabsContent value="evolucao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal - Últimos 12 Meses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={evolucaoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(value) => formatarMoeda(value)} />
                    <Tooltip formatter={(value: number) => formatarMoeda(value)} />
                    <Bar dataKey="receita" fill="#8B5CF6" name="Receita" />
                    <Bar dataKey="lucroBruto" fill="#06B6D4" name="Lucro Bruto" />
                    <Line type="monotone" dataKey="lucroLiquido" stroke="#10B981" strokeWidth={3} name="Lucro Líquido" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="composicao">
          <Card>
            <CardHeader>
              <CardTitle>Composição da Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Tooltip formatter={(value: number) => formatarMoeda(value)} />
                    <RechartsPieChart data={composicaoData}>
                      {composicaoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparacao">
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Períodos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={comparacaoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(value) => formatarMoeda(value)} />
                    <Tooltip formatter={(value: number) => formatarMoeda(value)} />
                    <Bar dataKey="receita" fill="#8B5CF6" name="Receita" />
                    <Bar dataKey="lucroBruto" fill="#06B6D4" name="Lucro Bruto" />
                    <Bar dataKey="lucroLiquido" fill="#10B981" name="Lucro Líquido" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resumo">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Mensal Detalhado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mês</TableHead>
                      <TableHead>Receita</TableHead>
                      <TableHead>CPV</TableHead>
                      <TableHead>Lucro Bruto</TableHead>
                      <TableHead>Custo Op.</TableHead>
                      <TableHead>Lucro Líquido</TableHead>
                      <TableHead>Margem %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumoMensal.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.periodo}</TableCell>
                        <TableCell>{formatarMoeda(item.receita)}</TableCell>
                        <TableCell>{formatarMoeda(item.cpv)}</TableCell>
                        <TableCell>{formatarMoeda(item.lucroBruto)}</TableCell>
                        <TableCell>{formatarMoeda(item.custoOperacional)}</TableCell>
                        <TableCell className={item.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatarMoeda(item.lucroLiquido)}
                        </TableCell>
                        <TableCell className={item.margemLiquida >= 10 ? 'text-green-600' : 'text-yellow-600'}>
                          {formatarPercentual(item.margemLiquida)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardGestao;