"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Receipt, Zap, BarChart3 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { toast } from 'sonner';

// Componentes de Custos
import { CustoResumoCard } from '@/components/custos/CustoResumoCard';
import { LancamentoRapidoModal } from '@/components/custos/LancamentoRapidoModal';
import { LancamentoDetalhadoModal } from '@/components/custos/LancamentoDetalhadoModal';
import { CustoVisualizacao } from '@/components/custos/CustoVisualizacao';
import { EvolucaoCustosGrafico } from '@/components/custos/EvolucaoCustosGrafico';
import { ConversaoRapidoParaDetalhadoModal } from '@/components/custos/ConversaoRapidoParaDetalhadoModal';
import { ConsolidarDetalhadoModal } from '@/components/custos/ConsolidarDetalhadoModal';

// Tipos e Utilitários
import {
  CustoOperacional,
  CustoOperacionalRapidoInput,
  CustoOperacionalDetalhadoInput,
  CustoItemInput
} from '@/types/custos-operacionais';
import {
  buscarCustoPorMes,
  ordenarCustosPorMes,
  formatarMesReferenciaCompleto,
  formatarMoeda
} from '@/utils/custosUtils';

export default function CustosOperacionais() {
  // Context
  const {
    custosOperacionais = [],
    vendasAnalise,
    addCustoOperacional,
    updateCustoOperacional,
    deleteCustoOperacional
  } = useAppContext();
  const confirm = useConfirm();

  // Estado de modais
  const [modalRapido, setModalRapido] = useState(false);
  const [modalDetalhado, setModalDetalhado] = useState(false);
  const [modalConversaoDetalhado, setModalConversaoDetalhado] = useState(false);
  const [modalConsolidarRapido, setModalConsolidarRapido] = useState(false);

  // Estado da página
  const [mesReferencia, setMesReferencia] = useState<string>('');
  const [custoSelecionado, setCustoSelecionado] = useState<CustoOperacional | null>(null);

  // Inicializar com mês atual
  useEffect(() => {
    const mesAtual = new Date();
    const mesRef = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}`;
    setMesReferencia(mesRef);
  }, []);

  // Buscar custo do mês selecionado
  const custoDoMes = useMemo(() => {
    return buscarCustoPorMes(custosOperacionais, mesReferencia);
  }, [custosOperacionais, mesReferencia]);

  // Mapa de custos existentes por mês (para validação nos modais)
  const custosExistentesPorMes = useMemo(() => {
    const mapa = new Map<string, CustoOperacional>();
    custosOperacionais.forEach(custo => {
      mapa.set(custo.mesReferencia, custo);
    });
    return mapa;
  }, [custosOperacionais]);

  // Histórico: últimos 6 meses (exceto o atual)
  const historicoMeses = useMemo(() => {
    const custos = ordenarCustosPorMes(custosOperacionais, 'desc');
    return custos.filter(c => c.mesReferencia !== mesReferencia).slice(0, 6);
  }, [custosOperacionais, mesReferencia]);

  // ============================================================================
  // HANDLERS - LANÇAMENTO RÁPIDO
  // ============================================================================

  const handleConfirmarRapido = (input: CustoOperacionalRapidoInput) => {
    // Verificar se já existe custo para esse mês
    const custoExistente = buscarCustoPorMes(custosOperacionais, input.mesReferencia);

    if (custoExistente) {
      // Atualizar custo existente
      const custoAtualizado: CustoOperacional = {
        ...custoExistente,
        tipo: 'RAPIDO',
        valorTotal: input.valorTotal,
        observacoes: input.observacoes,
        itens: undefined, // Remover itens se houver
        updatedAt: new Date()
      };

      updateCustoOperacional(custoAtualizado);

      toast.success(
        `✅ Custo de ${formatarMesReferenciaCompleto(input.mesReferencia)} atualizado: ${formatarMoeda(input.valorTotal)}`
      );
    } else {
      // Criar novo custo
      const novoCusto: CustoOperacional = {
        id: `custo-${Date.now()}`,
        mesReferencia: input.mesReferencia,
        tipo: 'RAPIDO',
        valorTotal: input.valorTotal,
        observacoes: input.observacoes,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      addCustoOperacional(novoCusto);

      toast.success(
        `✅ Custo de ${formatarMesReferenciaCompleto(input.mesReferencia)} registrado: ${formatarMoeda(input.valorTotal)}`
      );
    }

    setModalRapido(false);
  };

  // ============================================================================
  // HANDLERS - LANÇAMENTO DETALHADO
  // ============================================================================

  const handleConfirmarDetalhado = (input: CustoOperacionalDetalhadoInput) => {
    const totalCalculado = input.itens.reduce((acc, item) => acc + item.valor, 0);

    // Verificar se já existe custo para esse mês
    const custoExistente = buscarCustoPorMes(custosOperacionais, input.mesReferencia);

    if (custoExistente && custoExistente.tipo === 'DETALHADO' && custoExistente.itens) {
      // Mesclar com custos existentes
      const itensExistentes = custoExistente.itens;
      const novosItens = input.itens.map((item, idx) => ({
        ...item,
        id: `item-${Date.now()}-${idx}`,
        ordem: itensExistentes.length + idx + 1
      }));

      const todosItens = [...itensExistentes, ...novosItens];
      const novoTotal = todosItens.reduce((acc, item) => acc + item.valor, 0);

      const custoAtualizado: CustoOperacional = {
        ...custoExistente,
        tipo: 'DETALHADO',
        valorTotal: novoTotal,
        itens: todosItens,
        observacoes: undefined, // Remover observações
        updatedAt: new Date()
      };

      updateCustoOperacional(custoAtualizado);

      toast.success(
        `✅ ${input.itens.length} custos adicionados para ${formatarMesReferenciaCompleto(input.mesReferencia)} (total: ${todosItens.length})`
      );
    } else {
      // Criar novo ou substituir se for rápido
      const novoCusto: CustoOperacional = {
        id: custoExistente?.id || `custo-${Date.now()}`,
        mesReferencia: input.mesReferencia,
        tipo: 'DETALHADO',
        valorTotal: totalCalculado,
        itens: input.itens.map((item, idx) => ({
          ...item,
          id: `item-${Date.now()}-${idx}`,
          ordem: idx + 1
        })),
        createdAt: custoExistente?.createdAt || new Date(),
        updatedAt: new Date()
      };

      if (custoExistente) {
        updateCustoOperacional(novoCusto);
      } else {
        addCustoOperacional(novoCusto);
      }

      toast.success(
        `✅ ${input.itens.length} custos ${custoExistente ? 'atualizados' : 'adicionados'} para ${formatarMesReferenciaCompleto(input.mesReferencia)}`
      );
    }

    setModalDetalhado(false);
  };

  // ============================================================================
  // HANDLERS - CONVERSÃO RÁPIDO → DETALHADO
  // ============================================================================

  const handleIniciarConversaoDetalhado = () => {
    if (custoDoMes && custoDoMes.tipo === 'RAPIDO') {
      setCustoSelecionado(custoDoMes);
      setModalConversaoDetalhado(true);
    }
  };

  const handleConfirmarConversaoDetalhado = (itens: CustoItemInput[]) => {
    if (!custoSelecionado) return;

    const totalCalculado = itens.reduce((acc, item) => acc + item.valor, 0);

    const custoConvertido: CustoOperacional = {
      ...custoSelecionado,
      tipo: 'DETALHADO',
      valorTotal: totalCalculado,
      itens: itens.map((item, idx) => ({
        ...item,
        id: `item-${Date.now()}-${idx}`,
        ordem: idx + 1
      })),
      observacoes: undefined, // Remover observações
      updatedAt: new Date()
    };

    updateCustoOperacional(custoConvertido);

    toast.success('✅ Custos detalhados com sucesso');

    setModalConversaoDetalhado(false);
    setCustoSelecionado(null);
  };

  // ============================================================================
  // HANDLERS - CONSOLIDAÇÃO DETALHADO → RÁPIDO
  // ============================================================================

  const handleIniciarConsolidacao = () => {
    if (custoDoMes && custoDoMes.tipo === 'DETALHADO') {
      setCustoSelecionado(custoDoMes);
      setModalConsolidarRapido(true);
    }
  };

  const handleConfirmarConsolidacao = (observacoes: string) => {
    if (!custoSelecionado) return;

    const custoConsolidado: CustoOperacional = {
      ...custoSelecionado,
      tipo: 'RAPIDO',
      observacoes,
      itens: undefined, // Remover itens
      updatedAt: new Date()
    };

    updateCustoOperacional(custoConsolidado);

    toast.success('✅ Custos consolidados em valor único');

    setModalConsolidarRapido(false);
    setCustoSelecionado(null);
  };

  // ============================================================================
  // HANDLERS - EDIÇÃO/EXCLUSÃO
  // ============================================================================

  const handleEditar = () => {
    if (!custoDoMes) return;

    setCustoSelecionado(custoDoMes);

    if (custoDoMes.tipo === 'RAPIDO') {
      setModalRapido(true);
    } else {
      setModalDetalhado(true);
    }
  };

  const handleExcluir = async () => {
    if (!custoDoMes) return;

    const ok = await confirm({
      title: "Excluir custos do mês",
      description: `Tem certeza que deseja excluir os custos de ${formatarMesReferenciaCompleto(mesReferencia)}?`,
      destructive: true,
      confirmLabel: "Excluir",
    });
    if (ok) {
      deleteCustoOperacional(custoDoMes.id);
      toast.success(`Custos de ${formatarMesReferenciaCompleto(mesReferencia)} excluídos`);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-12">
        {/* ================================================================
            HEADER
            ================================================================ */}
        <div className="space-y-3">
          {/* Título e Subtítulo */}
          <div className="flex items-center gap-3">
            <Receipt className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                💰 Custos Operacionais
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Registre custos mensais para calcular o lucro líquido real do seu negócio
              </p>
            </div>
          </div>

          {/* Botões de Ação (Lado a Lado) */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => {
                setCustoSelecionado(null);
                setModalRapido(true);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              ⚡ Lançamento Rápido
              <span className="ml-2 text-xs opacity-80">(valor único)</span>
            </Button>

            <Button
              onClick={() => {
                setCustoSelecionado(null);
                setModalDetalhado(true);
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              📊 Lançamento Detalhado
              <span className="ml-2 text-xs opacity-80">(por categoria)</span>
            </Button>
          </div>
        </div>

        {/* ================================================================
            CARD: Resumo do Mês Selecionado
            ================================================================ */}
        <CustoResumoCard
          custo={custoDoMes || null}
          mesReferencia={mesReferencia}
          vendas={vendasAnalise.vendasRegistradas}
          onMesChange={setMesReferencia}
        />

        {/* ================================================================
            VISUALIZAÇÃO DOS CUSTOS (Adaptativa)
            ================================================================ */}
        <CustoVisualizacao
          custo={custoDoMes || null}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
          onConverterParaDetalhado={handleIniciarConversaoDetalhado}
          onConsolidarParaRapido={handleIniciarConsolidacao}
        />

        {/* ================================================================
            GRÁFICO: Evolução Mensal (6 meses)
            ================================================================ */}
        <EvolucaoCustosGrafico
          custos={custosOperacionais}
          mesesExibir={6}
        />

        {/* ================================================================
            HISTÓRICO: Meses Anteriores (Accordion)
            ================================================================ */}
        {historicoMeses.length > 0 && (
          <div className="border rounded-lg">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                📜 Histórico - Meses Anteriores
                <span className="text-sm font-normal text-gray-600">
                  ({historicoMeses.length} {historicoMeses.length === 1 ? 'mês' : 'meses'})
                </span>
              </h3>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {historicoMeses.map((custo) => (
                <AccordionItem key={custo.id} value={custo.id}>
                  <AccordionTrigger className="px-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-medium">
                        {formatarMesReferenciaCompleto(custo.mesReferencia)}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          {custo.tipo === 'RAPIDO' ? '⚡ Rápido' : '📊 Detalhado'}
                        </span>
                        <span className="font-bold text-gray-900">
                          {formatarMoeda(custo.valorTotal)}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <CustoVisualizacao
                      custo={custo}
                      onEditar={() => {
                        setCustoSelecionado(custo);
                        setMesReferencia(custo.mesReferencia);
                        if (custo.tipo === 'RAPIDO') {
                          setModalRapido(true);
                        } else {
                          setModalDetalhado(true);
                        }
                      }}
                      onExcluir={async () => {
                        const ok = await confirm({
                          title: "Excluir custos do mês",
                          description: `Excluir custos de ${formatarMesReferenciaCompleto(custo.mesReferencia)}?`,
                          destructive: true,
                          confirmLabel: "Excluir",
                        });
                        if (ok) {
                          deleteCustoOperacional(custo.id);
                          toast.success(`Custos de ${formatarMesReferenciaCompleto(custo.mesReferencia)} excluídos`);
                        }
                      }}
                      onConverterParaDetalhado={() => {
                        setCustoSelecionado(custo);
                        setMesReferencia(custo.mesReferencia);
                        setModalConversaoDetalhado(true);
                      }}
                      onConsolidarParaRapido={() => {
                        setCustoSelecionado(custo);
                        setMesReferencia(custo.mesReferencia);
                        setModalConsolidarRapido(true);
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* ================================================================
            MODAIS
            ================================================================ */}

        {/* Modal: Lançamento Rápido */}
        <LancamentoRapidoModal
          isOpen={modalRapido}
          onClose={() => {
            setModalRapido(false);
            setCustoSelecionado(null);
          }}
          onConfirm={handleConfirmarRapido}
          custoExistente={custoSelecionado && custoSelecionado.tipo === 'RAPIDO' ? custoSelecionado : undefined}
          custosExistentesPorMes={custosExistentesPorMes}
        />

        {/* Modal: Lançamento Detalhado */}
        <LancamentoDetalhadoModal
          isOpen={modalDetalhado}
          onClose={() => {
            setModalDetalhado(false);
            setCustoSelecionado(null);
          }}
          onConfirm={handleConfirmarDetalhado}
          custoExistente={custoSelecionado && custoSelecionado.tipo === 'DETALHADO' ? custoSelecionado : undefined}
          custosExistentesPorMes={custosExistentesPorMes}
        />

        {/* Modal: Conversão Rápido → Detalhado */}
        {custoSelecionado && custoSelecionado.tipo === 'RAPIDO' && (
          <ConversaoRapidoParaDetalhadoModal
            isOpen={modalConversaoDetalhado}
            onClose={() => {
              setModalConversaoDetalhado(false);
              setCustoSelecionado(null);
            }}
            custo={custoSelecionado}
            onConfirm={handleConfirmarConversaoDetalhado}
          />
        )}

        {/* Modal: Consolidação Detalhado → Rápido */}
        {custoSelecionado && custoSelecionado.tipo === 'DETALHADO' && (
          <ConsolidarDetalhadoModal
            isOpen={modalConsolidarRapido}
            onClose={() => {
              setModalConsolidarRapido(false);
              setCustoSelecionado(null);
            }}
            custo={custoSelecionado}
            onConfirm={handleConfirmarConsolidacao}
          />
        )}
      </div>
    </Layout>
  );
}
