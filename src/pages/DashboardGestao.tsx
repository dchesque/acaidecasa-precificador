"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  Target,
  Percent,
  BarChart3,
  TrendingDown,
  ShoppingCart,
  Calculator,
  TrendingUp,
  Award,
  Activity,
  Flag,
  Calendar as CalendarIcon,
  Download
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
  calcularLucroPorVenda,
  calcularMetaFaturamento,
  calcularProgressoMeta,
  analisarTendenciaNegocio,
  encontrarMelhorPiorMes,
  calcularProjecao,
  obterNomeMesAbreviado
} from '@/utils/calculosFinanceiros';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { DashboardGestaoMetricas, PeriodoDashboard, AlertaFinanceiro, MetricaComparativa } from '@/types/financeiro';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AlertCard } from '@/components/dashboard/AlertCard';

const DashboardGestao = () => {
  const { vendasAnalise, custosOperacionais, setDashboardGestaoPeriodo, setDashboardGestaoLoading } = useAppContext();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState<DashboardGestaoMetricas | null>(null);
  const [comparativas, setComparativas] = useState<MetricaComparativa | null>(null);
  const [periodo, setPeriodo] = useState<PeriodoDashboard>(() => {
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
  const [alertas, setAlertas] = useState<AlertaFinanceiro[]>([]);
  const [metaLucro, setMetaLucro] = useState<number>(5000);
  const [resumoMensal, setResumoMensal] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [periodo, vendasAnalise.dashboardData, custosOperacionais]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setDashboardGestaoLoading(true);

      const metrics = await calcularMetricasPeriodo();
      setMetricas(metrics);

      await Promise.all([
        loadEvolucaoData(),
        loadComparativas(metrics),
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
    const vendasDashboard = vendasAnalise.dashboardData;
    const receita = vendasDashboard?.totalReceita || 0;
    const cpv = vendasDashboard?.totalCPV || 0;
    const lucroBruto = receita - cpv;

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

      const receitaMes = Math.random() * 50000 + 30000;
      const cpvMes = receitaMes * (0.4 + Math.random() * 0.2);
      const lucroBrutoMes = receitaMes - cpvMes;

      const custoMes = custosOperacionais.find(c => c.mes === mes && c.ano === ano)?.valor || 0;
      const lucroLiquidoMes = lucroBrutoMes - custoMes;

      meses.push({
        periodo: `${obterNomeMesAbreviado(mes)}/${ano}`,
        receita: receitaMes,
        lucroBruto: lucroBrutoMes,
        lucroLiquido: lucroLiquidoMes
      });
    }

    setEvolucaoData(meses);
  };

  const loadComparativas = async (metrics: DashboardGestaoMetricas) => {
    const dadosUltimos12Meses = evolucaoData.map(item => item.lucroLiquido);
    const tendencia = analisarTendenciaNegocio(dadosUltimos12Meses.slice(-3));
    const melhorPior = encontrarMelhorPiorMes(
      evolucaoData.map(item => ({ periodo: item.periodo, valor: item.lucroLiquido }))
    );
    const projecao = calcularProjecao(dadosUltimos12Meses, 1);

    setComparativas({
      melhorMes: {
        periodo: melhorPior.melhor.periodo,
        valor: melhorPior.melhor.valor,
        tipo: 'lucro'
      },
      piorMes: {
        periodo: melhorPior.pior.periodo,
        valor: melhorPior.pior.valor,
        tipo: 'lucro'
      },
      tendencia: tendencia.status,
      projecaoProximoMes: projecao[0] || 0
    });
  };

  const loadResumoMensalData = async () => {
    setResumoMensal(evolucaoData);
  };

  const checkAlertas = async (metrics: DashboardGestaoMetricas) => {
    const novosAlertas: AlertaFinanceiro[] = [];

    if (metrics.lucroLiquido < 0) {
      novosAlertas.push({
        id: 'prejuizo',
        tipo: 'danger',
        titulo: 'PREJUÍZO DETECTADO',
        descricao: `Lucro líquido negativo: ${formatarMoeda(metrics.lucroLiquido)}`,
        acao: {
          label: 'Ver Custos',
          onClick: () => console.log('Navegar para custos')
        },
        createdAt: new Date()
      });
    }

    if (metrics.margemLiquida < 10) {
      novosAlertas.push({
        id: 'margem-baixa',
        tipo: 'warning',
        titulo: 'Margem Líquida Baixa',
        descricao: `Margem de ${formatarPercentual(metrics.margemLiquida)} está abaixo do recomendado (10%)`,
        acao: {
          label: 'Analisar Preços',
          onClick: () => console.log('Navegar para preços')
        },
        createdAt: new Date()
      });
    }

    if (metrics.taxaAbsorcao > 50) {
      novosAlertas.push({
        id: 'custo-alto',
        tipo: 'warning',
        titulo: 'Custos Operacionais Altos',
        descricao: `Custos representam ${formatarPercentual(metrics.taxaAbsorcao)} da receita`,
        acao: {
          label: 'Revisar Custos',
          onClick: () => console.log('Navegar para custos operacionais')
        },
        createdAt: new Date()
      });
    }

    if (custoOperacionais.length === 0) {
      novosAlertas.push({
        id: 'sem-dados',
        tipo: 'info',
        titulo: 'Sem Dados de Custos',
        descricao: 'Nenhum custo operacional cadastrado para o período',
        acao: {
          label: 'Cadastrar Custos',
          onClick: () => console.log('Navegar para cadastro de custos')
        },
        createdAt: new Date()
      });
    }

    const metaReceita = calcularMetaFaturamento(metaLucro, metrics.margemLiquida);
    const progressoMeta = calcularProgressoMeta(metrics.receita, metaReceita);

    if (progressoMeta >= 100) {
      novosAlertas.push({
        id: 'meta-atingida',
        tipo: 'success',
        titulo: 'Meta Atingida!',
        descricao: `Parabéns! Meta de faturamento superada em ${formatarPercentual(progressoMeta - 100)}`,
        createdAt: new Date()
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
    console.log('Exportar relatório');
  };

  const dismissAlert = (alertId: string) => {
    setAlertas(prev => prev.filter(alert => alert.id !== alertId));
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  const quantidadeVendas = vendasAnalise.dashboardData?.quantidadeVendas || 1;
  const lucroPorVenda = metricas ? calcularLucroPorVenda(metricas.lucroLiquido, quantidadeVendas) : 0;
  const metaReceita = metricas ? calcularMetaFaturamento(metaLucro, metricas.margemLiquida) : 0;
  const progressoMeta = metricas ? calcularProgressoMeta(metricas.receita, metaReceita) : 0;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard de Gestão</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Visão executiva do desempenho financeiro</p>
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

        {/* Seção de Alertas */}
        {alertas.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Alertas Inteligentes</h2>
            <div className="grid gap-3">
              {alertas.map((alerta) => (
                <AlertCard
                  key={alerta.id}
                  alerta={alerta}
                  onDismiss={() => dismissAlert(alerta.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Seção 1: Métricas Fundamentais */}
        {metricas && (
          <>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Métricas Fundamentais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  titulo="Lucro Líquido"
                  valor={formatarMoeda(metricas.lucroLiquido)}
                  subtexto="Lucro Bruto - Custos Operacionais"
                  icone={<DollarSign />}
                  cor={metricas.lucroLiquido >= 0 ? 'green' : 'red'}
                  badge={{
                    texto: metricas.lucroLiquido >= 0 ? 'Positivo' : 'Negativo',
                    variante: metricas.lucroLiquido >= 0 ? 'success' : 'danger'
                  }}
                />

                <MetricCard
                  titulo="Margem Líquida"
                  valor={formatarPercentual(metricas.margemLiquida)}
                  subtexto="(Lucro Líquido ÷ Receita) × 100"
                  icone={<Percent />}
                  cor={metricas.margemLiquida >= 15 ? 'green' : metricas.margemLiquida >= 5 ? 'yellow' : 'red'}
                  trend={metricas.margemLiquida >= 10 ? 'up' : 'down'}
                />

                <MetricCard
                  titulo="Ponto de Equilíbrio"
                  valor={formatarMoeda(metricas.pontoEquilibrio)}
                  subtexto="Faturamento necessário para zerar"
                  icone={<Target />}
                  cor="blue"
                  progress={{
                    valor: metricas.receita,
                    max: metricas.pontoEquilibrio,
                    label: "Atingido"
                  }}
                />

                <MetricCard
                  titulo="Receita vs Custos Totais"
                  valor={formatarMoeda(metricas.receita)}
                  subtexto={`Custos: ${formatarMoeda(metricas.cpv + metricas.custoOperacional)}`}
                  icone={<BarChart3 />}
                  cor="purple"
                  extra={
                    <div className="flex space-x-2">
                      <div className="h-2 bg-blue-500 rounded flex-1" style={{ width: '60%' }} />
                      <div className="h-2 bg-red-500 rounded flex-1" style={{ width: '40%' }} />
                    </div>
                  }
                />
              </div>
            </div>

            {/* Seção 2: Indicadores de Eficiência */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Indicadores de Eficiência</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  titulo="Taxa de Absorção"
                  valor={formatarPercentual(metricas.taxaAbsorcao)}
                  subtexto="% da receita gasto com custos operacionais"
                  icone={<TrendingDown />}
                  cor={metricas.taxaAbsorcao <= 30 ? 'green' : metricas.taxaAbsorcao <= 50 ? 'yellow' : 'red'}
                />

                <MetricCard
                  titulo="Lucro por Venda"
                  valor={formatarMoeda(lucroPorVenda)}
                  subtexto={`Base: ${quantidadeVendas} vendas no período`}
                  icone={<ShoppingCart />}
                  cor="blue"
                />

                <MetricCard
                  titulo="Ticket Médio Necessário"
                  valor={formatarMoeda(metricas.ticketMedioNecessario)}
                  subtexto={`Ticket atual: ${formatarMoeda(metricas.receita / quantidadeVendas)}`}
                  icone={<Calculator />}
                  cor="orange"
                />
              </div>
            </div>

            {/* Seção 3: Análises Comparativas */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Análises Comparativas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  titulo="Evolução da Margem"
                  valor={metricas.margemLiquida >= 10 ? "↑ Melhorando" : "↓ Piorando"}
                  subtexto={`${formatarPercentual(Math.abs(metricas.margemLiquida - 10))}`}
                  icone={metricas.margemLiquida >= 10 ? <TrendingUp /> : <TrendingDown />}
                  cor={metricas.margemLiquida >= 10 ? 'green' : 'red'}
                />

                {comparativas && (
                  <MetricCard
                    titulo="Melhor vs Pior Mês"
                    valor={formatarMoeda(comparativas.melhorMes.valor)}
                    subtexto={`Pior: ${formatarMoeda(comparativas.piorMes.valor)}`}
                    icone={<Award />}
                    cor="blue"
                    extra={
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Δ {formatarMoeda(comparativas.melhorMes.valor - comparativas.piorMes.valor)}
                      </p>
                    }
                  />
                )}

                {comparativas && (
                  <MetricCard
                    titulo="Tendência do Negócio"
                    valor={
                      comparativas.tendencia === 'crescimento' ? '📈 Crescimento' :
                      comparativas.tendencia === 'queda' ? '📉 Queda' : '➡️ Estável'
                    }
                    subtexto="Análise últimos 3 meses"
                    icone={<Activity />}
                    cor={
                      comparativas.tendencia === 'crescimento' ? 'green' :
                      comparativas.tendencia === 'queda' ? 'red' : 'yellow'
                    }
                    extra={
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Projeção: {formatarMoeda(comparativas.projecaoProximoMes)}
                      </p>
                    }
                  />
                )}

                <MetricCard
                  titulo="Meta de Faturamento"
                  valor={formatarMoeda(metaReceita)}
                  subtexto={`Para lucro de ${formatarMoeda(metaLucro)}`}
                  icone={<Flag />}
                  cor="purple"
                  progress={{
                    valor: progressoMeta,
                    max: 100,
                    label: `${Math.round(progressoMeta)}% atingido`
                  }}
                  extra={
                    <div className="space-y-2">
                      <Label htmlFor="meta-lucro" className="text-xs">Meta de Lucro Desejado:</Label>
                      <Input
                        id="meta-lucro"
                        type="number"
                        value={metaLucro}
                        onChange={(e) => setMetaLucro(Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                    </div>
                  }
                />
              </div>
            </div>
          </>
        )}

        {/* Gráfico de Evolução Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal - Últimos 12 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucaoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(value) => formatarMoeda(value)} />
                  <Tooltip formatter={(value: number) => formatarMoeda(value)} />
                  <Line
                    type="monotone"
                    dataKey="receita"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    name="Receita"
                  />
                  <Line
                    type="monotone"
                    dataKey="lucroBruto"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Lucro Bruto"
                  />
                  <Line
                    type="monotone"
                    dataKey="lucroLiquido"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    name="Lucro Líquido"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabela Resumo Mensal (Opcional/Colapsável) */}
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
                    <TableHead>Lucro Bruto</TableHead>
                    <TableHead>Lucro Líquido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evolucaoData.slice(-6).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.periodo}</TableCell>
                      <TableCell>{formatarMoeda(item.receita)}</TableCell>
                      <TableCell>{formatarMoeda(item.lucroBruto)}</TableCell>
                      <TableCell className={item.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatarMoeda(item.lucroLiquido)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DashboardGestao;