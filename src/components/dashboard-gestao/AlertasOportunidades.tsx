"use client"

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  XCircle,
  Info,
  Lightbulb,
  TrendingUp,
  Target,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { formatarMoeda } from '@/utils/calculosFinanceiros';
import { DashboardGestaoData } from '@/utils/dashboardGestaoUtils';
import Link from 'next/link';

interface AlertasOportunidadesProps {
  data: DashboardGestaoData;
  meta?: number;
  loading?: boolean;
}

interface Alerta {
  tipo: 'critico' | 'atencao' | 'info';
  titulo: string;
  descricao: string;
  acao?: { label: string; link: string };
}

interface Oportunidade {
  titulo: string;
  descricao: string;
  potencial: number;
  acao?: { label: string; link: string };
}

export function AlertasOportunidades({ data, meta, loading = false }: AlertasOportunidadesProps) {
  const alertas = useMemo((): Alerta[] => {
    const result: Alerta[] = [];

    // Alerta: Prejuízo
    if (data.lucroLiquido < 0) {
      result.push({
        tipo: 'critico',
        titulo: '❌ PREJUÍZO DETECTADO',
        descricao: `Lucro negativo de ${formatarMoeda(data.lucroLiquido)}. Ação urgente necessária!`,
        acao: { label: 'Analisar Custos', link: '/custos-operacionais' }
      });
    }

    // Alerta: Margem Líquida Baixa
    if (data.margemLiquida < 10 && data.lucroLiquido >= 0) {
      result.push({
        tipo: 'atencao',
        titulo: '⚠️ Margem Líquida Baixa',
        descricao: `Margem de ${data.margemLiquida.toFixed(1)}% está abaixo do ideal (>15%). Revise preços e custos.`,
        acao: { label: 'Revisar Cardápio', link: '/cardapio' }
      });
    }

    // Alerta: Custos Operacionais Não Cadastrados
    if (data.custoOperacional === 0) {
      result.push({
        tipo: 'info',
        titulo: 'ℹ️ Custos Não Cadastrados',
        descricao: 'Cadastre os custos operacionais para uma análise completa do lucro líquido.',
        acao: { label: 'Cadastrar Custos', link: '/custos-operacionais' }
      });
    }

    // Alerta: CPV Alto
    const cpvPercentual = data.receita > 0 ? (data.cpv / data.receita) * 100 : 0;
    if (cpvPercentual > 45 && data.receita > 0) {
      result.push({
        tipo: 'atencao',
        titulo: '⚠️ CPV Elevado',
        descricao: `Custo dos Produtos (${cpvPercentual.toFixed(1)}%) está alto. Considere otimizar receitas ou negociar insumos.`,
        acao: { label: 'Ver Receitas', link: '/receitas' }
      });
    }

    return result;
  }, [data]);

  const oportunidades = useMemo((): Oportunidade[] => {
    const result: Oportunidade[] = [];

    // Oportunidade: Reduzir CPV
    const cpvPercentual = data.receita > 0 ? (data.cpv / data.receita) * 100 : 0;
    if (cpvPercentual > 40 && data.receita > 0) {
      const cpvIdeal = data.receita * 0.35;
      const reducao = data.cpv - cpvIdeal;
      const margemPotencial = data.margemLiquida + ((reducao / data.receita) * 100);

      result.push({
        titulo: 'Otimizar Custo dos Produtos',
        descricao: `Reduzindo CPV em ${formatarMoeda(reducao)} (≈${(reducao / data.cpv * 100).toFixed(0)}%), a margem pode chegar a ${margemPotencial.toFixed(1)}%`,
        potencial: reducao,
        acao: { label: 'Revisar Receitas', link: '/receitas' }
      });
    }

    // Oportunidade: Aumentar Vendas para Meta
    if (meta && meta > 0 && data.receita < meta) {
      const diferenca = meta - data.receita;
      const percentual = (diferenca / data.receita) * 100;
      const lucroAdicional = (diferenca * data.margemLiquida) / 100;

      result.push({
        titulo: 'Atingir Meta de Receita',
        descricao: `Meta de ${formatarMoeda(meta)} alcançável com +${percentual.toFixed(1)}% de vendas. Lucro adicional: ${formatarMoeda(lucroAdicional)}`,
        potencial: lucroAdicional,
        acao: { label: 'Estratégias de Venda', link: '/analise-vendas' }
      });
    }

    // Oportunidade: Aumentar Margem
    if (data.margemLiquida < 20 && data.margemLiquida > 0) {
      const aumentoNecessario = 20 - data.margemLiquida;
      const receitaAdicional = (data.receita * aumentoNecessario) / 100;

      result.push({
        titulo: 'Aumentar Margem para 20%',
        descricao: `Aumente preços ou reduza custos em ${formatarMoeda(receitaAdicional)} para alcançar margem de 20%`,
        potencial: receitaAdicional,
        acao: { label: 'Ajustar Preços', link: '/cardapio' }
      });
    }

    // Oportunidade: Reduzir Custos Operacionais
    const custoOpPercentual = data.receita > 0 ? (data.custoOperacional / data.receita) * 100 : 0;
    if (custoOpPercentual > 25 && data.custoOperacional > 0) {
      const custoIdeal = data.receita * 0.20;
      const reducao = data.custoOperacional - custoIdeal;
      const margemPotencial = data.margemLiquida + ((reducao / data.receita) * 100);

      result.push({
        titulo: 'Otimizar Custos Operacionais',
        descricao: `Reduzindo custos fixos em ${formatarMoeda(reducao)}, a margem pode chegar a ${margemPotencial.toFixed(1)}%`,
        potencial: reducao,
        acao: { label: 'Analisar Custos', link: '/custos-operacionais' }
      });
    }

    return result;
  }, [data, meta]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>⚠️ Alertas e Oportunidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAlertaIcon = (tipo: 'critico' | 'atencao' | 'info') => {
    if (tipo === 'critico') return <XCircle className="h-5 w-5" />;
    if (tipo === 'atencao') return <AlertTriangle className="h-5 w-5" />;
    return <Info className="h-5 w-5" />;
  };

  const getAlertaVariant = (tipo: 'critico' | 'atencao' | 'info') => {
    if (tipo === 'critico') return 'destructive';
    if (tipo === 'atencao') return 'default';
    return 'default';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Alertas e Oportunidades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alertas Críticos */}
        {alertas.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Alertas</h4>
            {alertas.map((alerta, index) => (
              <Alert key={index} variant={getAlertaVariant(alerta.tipo)} className={
                alerta.tipo === 'critico' ? 'border-red-300' :
                alerta.tipo === 'atencao' ? 'border-yellow-300' :
                'border-blue-300'
              }>
                <div className="flex items-start gap-3">
                  {getAlertaIcon(alerta.tipo)}
                  <div className="flex-1">
                    <AlertDescription>
                      <p className="font-semibold mb-1">{alerta.titulo}</p>
                      <p className="text-sm">{alerta.descricao}</p>
                      {alerta.acao && (
                        <Link href={alerta.acao.link}>
                          <Button variant="outline" size="sm" className="mt-2">
                            {alerta.acao.label}
                            <ExternalLink className="ml-2 h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        ) : (
          <Alert className="bg-green-50 border-green-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <AlertDescription>
                <p className="font-semibold text-green-900">Sem alertas críticos!</p>
                <p className="text-sm text-green-700">Negócio operando de forma saudável.</p>
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Oportunidades */}
        {oportunidades.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              💡 Oportunidades
            </h4>
            <div className="space-y-3">
              {oportunidades.map((oportunidade, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">{oportunidade.titulo}</p>
                      <p className="text-sm text-gray-700 mb-2">{oportunidade.descricao}</p>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-100 text-green-800">
                          <DollarSign className="h-3 w-3 mr-1" />
                          +{formatarMoeda(oportunidade.potencial)}
                        </Badge>
                        {oportunidade.acao && (
                          <Link href={oportunidade.acao.link}>
                            <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                              {oportunidade.acao.label} →
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
