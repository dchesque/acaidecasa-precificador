import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  ChevronRight
} from 'lucide-react';
import { PeriodoSelectorProps, PeriodoImportacao, StatusPeriodo } from '@/types/periodo';
import {
  gerarUltimos12Meses,
  criarPeriodoMesCompleto,
  criarPeriodoCustomizado,
  formatarPeriodoDisplay,
  classificarPeriodo
} from '@/utils/periodoUtils';
import { useAppContext } from '@/contexts/AppContext';

export const PeriodSelector: React.FC<PeriodoSelectorProps> = ({
  onPeriodSelect,
  tipo,
  periodoAtual,
  showAdvancedMode = true,
  disabled = false
}) => {
  const { state } = useAppContext();
  const [tabAtiva, setTabAtiva] = useState<'mensal' | 'personalizado'>('mensal');
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>('');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [statusPeriodos, setStatusPeriodos] = useState<Record<string, StatusPeriodo>>({});

  const meses = gerarUltimos12Meses();

  // Calcular status dos períodos
  useEffect(() => {
    const novosStatus: Record<string, StatusPeriodo> = {};

    meses.forEach(mes => {
      // Aqui você calcularia o status real baseado nos dados
      // Por enquanto, simulando o cálculo
      const vendas = state.vendasAnalise?.vendasRegistradas || [];
      const custos: any[] = []; // TODO: Pegar custos do contexto quando implementado

      const status: StatusPeriodo = {
        periodo: mes.mesReferencia,
        possuiVendas: vendas.some(v => {
          const mesVenda = `${v.dataVenda.getFullYear()}-${String(v.dataVenda.getMonth() + 1).padStart(2, '0')}`;
          return mesVenda === mes.mesReferencia;
        }),
        possuiCustos: false, // TODO: Implementar quando custos estiverem no contexto
        vendasStatus: 'PARCIAL', // TODO: Calcular baseado nos dados reais
        custosStatus: 'VAZIO',
        consistente: false,
        diasVendas: 0,
        totalDias: mes.diasTotais,
        categoriasComCustos: [],
        totalCategorias: 8
      };

      novosStatus[mes.mesReferencia] = status;
    });

    setStatusPeriodos(novosStatus);
  }, [state.vendasAnalise?.vendasRegistradas, meses]);

  // Definir período inicial
  useEffect(() => {
    if (periodoAtual) {
      setPeriodoSelecionado(periodoAtual.mesReferencia);
      if (periodoAtual.tipo === 'PERIODO_CUSTOM') {
        setTabAtiva('personalizado');
        setDataInicio(periodoAtual.dataInicio.toISOString().split('T')[0]);
        setDataFim(periodoAtual.dataFim.toISOString().split('T')[0]);
      }
    } else {
      // Sugerir o mês passado como padrão
      const mesPassado = new Date();
      mesPassado.setMonth(mesPassado.getMonth() - 1);
      const mesRef = `${mesPassado.getFullYear()}-${String(mesPassado.getMonth() + 1).padStart(2, '0')}`;
      setPeriodoSelecionado(mesRef);
    }
  }, [periodoAtual]);

  const obterIconeStatus = (status: StatusPeriodo) => {
    if (status.vendasStatus === 'COMPLETO' && status.custosStatus === 'COMPLETO') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (status.vendasStatus !== 'VAZIO' || status.custosStatus !== 'VAZIO') {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    return <AlertTriangle className="w-4 h-4 text-gray-400" />;
  };

  const obterBadgeStatus = (status: StatusPeriodo) => {
    if (status.vendasStatus === 'COMPLETO' && status.custosStatus === 'COMPLETO') {
      return <Badge variant="default" className="bg-green-100 text-green-800">✅ Completo</Badge>;
    }
    if (status.vendasStatus === 'PARCIAL' || status.custosStatus === 'PARCIAL') {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">⏳ Parcial</Badge>;
    }
    return <Badge variant="outline" className="text-gray-500">⚠️ Sem dados</Badge>;
  };

  const handleMensalSelect = (mesReferencia: string) => {
    setPeriodoSelecionado(mesReferencia);
    const periodo = criarPeriodoMesCompleto(mesReferencia);
    onPeriodSelect(periodo);
  };

  const handlePersonalizadoSelect = () => {
    if (!dataInicio || !dataFim) return;

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (inicio > fim) {
      return;
    }

    const periodo = criarPeriodoCustomizado(inicio, fim);
    onPeriodSelect(periodo);
  };

  const validarDatasPersonalizadas = (): { valido: boolean; erro?: string } => {
    if (!dataInicio || !dataFim) {
      return { valido: false, erro: 'Selecione ambas as datas' };
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (inicio > fim) {
      return { valido: false, erro: 'Data de início deve ser anterior à data de fim' };
    }

    const diffDays = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 365) {
      return { valido: false, erro: 'Período não pode ser maior que 1 ano' };
    }

    return { valido: true };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Seleção de Período - {tipo === 'vendas' ? 'Vendas' : 'Custos Operacionais'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={tabAtiva} onValueChange={(value) => setTabAtiva(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mensal" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Mensal (Recomendado)
            </TabsTrigger>
            <TabsTrigger value="personalizado" disabled={!showAdvancedMode}>
              Personalizado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mensal" className="space-y-4">
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Selecione um mês completo para melhor análise. Períodos mensais facilitam
                comparações e relatórios gerenciais.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Mês de Referência</Label>
              <Select
                value={periodoSelecionado}
                onValueChange={handleMensalSelect}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um mês" />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((mes) => {
                    const status = statusPeriodos[mes.mesReferencia];
                    const classificacao = classificarPeriodo(criarPeriodoMesCompleto(mes.mesReferencia));

                    return (
                      <SelectItem key={mes.mesReferencia} value={mes.mesReferencia}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            {status && obterIconeStatus(status)}
                            <span>{mes.nomeCompleto}</span>
                            {classificacao === 'PRESENTE' && (
                              <Badge variant="outline" className="text-xs">Atual</Badge>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {periodoSelecionado && statusPeriodos[periodoSelecionado] && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Status do Período</h4>
                  {obterBadgeStatus(statusPeriodos[periodoSelecionado])}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Vendas:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={
                        statusPeriodos[periodoSelecionado].vendasStatus === 'COMPLETO' ? 'text-green-600' :
                        statusPeriodos[periodoSelecionado].vendasStatus === 'PARCIAL' ? 'text-yellow-600' :
                        'text-gray-400'
                      }>
                        {statusPeriodos[periodoSelecionado].vendasStatus === 'COMPLETO' ? '✅ Completo' :
                         statusPeriodos[periodoSelecionado].vendasStatus === 'PARCIAL' ? '⏳ Parcial' :
                         '⚠️ Sem dados'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-600">Custos:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={
                        statusPeriodos[periodoSelecionado].custosStatus === 'COMPLETO' ? 'text-green-600' :
                        statusPeriodos[periodoSelecionado].custosStatus === 'PARCIAL' ? 'text-yellow-600' :
                        'text-gray-400'
                      }>
                        {statusPeriodos[periodoSelecionado].custosStatus === 'COMPLETO' ? '✅ Completo' :
                         statusPeriodos[periodoSelecionado].custosStatus === 'PARCIAL' ? '⏳ Parcial' :
                         '⚠️ Sem dados'}
                      </span>
                    </div>
                  </div>
                </div>

                {!statusPeriodos[periodoSelecionado].consistente && (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      Período com dados incompletos. Para análise precisa, certifique-se de ter
                      tanto vendas quanto custos operacionais registrados.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="personalizado" className="space-y-4">
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Defina um período customizado. Recomendamos períodos de até 1 mês para melhor análise.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data-inicio">Data de Início</Label>
                <Input
                  id="data-inicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-fim">Data de Fim</Label>
                <Input
                  id="data-fim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  disabled={disabled}
                />
              </div>
            </div>

            {dataInicio && dataFim && (
              <div className="p-4 bg-gray-50 rounded-lg">
                {(() => {
                  const validacao = validarDatasPersonalizadas();
                  if (!validacao.valido) {
                    return (
                      <Alert variant="destructive">
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>{validacao.erro}</AlertDescription>
                      </Alert>
                    );
                  }

                  const inicio = new Date(dataInicio);
                  const fim = new Date(dataFim);
                  const diffDays = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <div className="space-y-2">
                      <h4 className="font-medium">Período Selecionado</h4>
                      <p className="text-sm text-gray-600">
                        {inicio.toLocaleDateString('pt-BR')} - {fim.toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total: {diffDays} dia{diffDays !== 1 ? 's' : ''}
                      </p>
                      <Button
                        onClick={handlePersonalizadoSelect}
                        disabled={disabled}
                        className="w-full mt-2"
                      >
                        Confirmar Período
                      </Button>
                    </div>
                  );
                })()}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};