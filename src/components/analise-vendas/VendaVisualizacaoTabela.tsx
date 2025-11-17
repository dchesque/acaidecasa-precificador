"use client"

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Package
} from 'lucide-react';
import { formatarMoeda } from '@/utils/calculosFinanceiros';
import { VendaRegistrada, StatusVenda } from '@/types/analise-vendas';

interface VendaVisualizacaoTabelaProps {
  vendas: VendaRegistrada[];
  loading?: boolean;
}

type OrdenacaoTipo = 'data' | 'produto' | 'valor' | 'margem';
type DirecaoOrdenacao = 'asc' | 'desc';

const ITENS_POR_PAGINA = 20;

export function VendaVisualizacaoTabela({ vendas, loading = false }: VendaVisualizacaoTabelaProps) {
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusVenda | 'todos'>('todos');
  const [ordenacao, setOrdenacao] = useState<OrdenacaoTipo>('data');
  const [direcao, setDirecao] = useState<DirecaoOrdenacao>('desc');
  const [paginaAtual, setPaginaAtual] = useState(1);

  // Filtrar e ordenar vendas
  const vendasProcessadas = useMemo(() => {
    let resultado = [...vendas];

    // Filtrar por busca
    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(v =>
        v.produtoNome.toLowerCase().includes(buscaLower) ||
        v.produtoErpId.toLowerCase().includes(buscaLower)
      );
    }

    // Filtrar por status
    if (statusFiltro !== 'todos') {
      resultado = resultado.filter(v => v.statusAnalise === statusFiltro);
    }

    // Ordenar
    resultado.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (ordenacao) {
        case 'data':
          valorA = new Date(a.dataVenda).getTime();
          valorB = new Date(b.dataVenda).getTime();
          break;
        case 'produto':
          valorA = a.produtoNome.toLowerCase();
          valorB = b.produtoNome.toLowerCase();
          break;
        case 'valor':
          valorA = a.precoTotalVendido;
          valorB = b.precoTotalVendido;
          break;
        case 'margem':
          valorA = a.margemReal;
          valorB = b.margemReal;
          break;
        default:
          valorA = a.dataVenda;
          valorB = b.dataVenda;
      }

      if (valorA < valorB) return direcao === 'asc' ? -1 : 1;
      if (valorA > valorB) return direcao === 'asc' ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [vendas, busca, statusFiltro, ordenacao, direcao]);

  // Paginação
  const totalPaginas = Math.ceil(vendasProcessadas.length / ITENS_POR_PAGINA);
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const fim = inicio + ITENS_POR_PAGINA;
  const vendasPaginadas = vendasProcessadas.slice(inicio, fim);

  const handleOrdenacaoChange = (novaOrdenacao: OrdenacaoTipo) => {
    if (ordenacao === novaOrdenacao) {
      setDirecao(direcao === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenacao(novaOrdenacao);
      setDirecao('desc');
    }
    setPaginaAtual(1);
  };

  const getStatusBadge = (status: StatusVenda) => {
    const configs = {
      ok: { label: '✅ OK', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      divergencia: { label: '⚠️ Baixa', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      prejuizo: { label: '❌ Prej', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' }
    };
    const config = configs[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendas do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
            </div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (vendas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendas do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Package className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">Nenhuma venda importada</p>
            <p className="text-sm">Importe vendas para começar a análise</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Vendas do Período</CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{vendasProcessadas.length} de {vendas.length} vendas</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros Inline */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="🔍 Buscar produto..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPaginaAtual(1);
              }}
              className="pl-10"
            />
          </div>
          <Select value={statusFiltro} onValueChange={(v) => {
            setStatusFiltro(v as StatusVenda | 'todos');
            setPaginaAtual(1);
          }}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ok">✅ OK</SelectItem>
              <SelectItem value="divergencia">⚠️ Alerta</SelectItem>
              <SelectItem value="prejuizo">❌ Prejuízo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ordenacao} onValueChange={(v) => handleOrdenacaoChange(v as OrdenacaoTipo)}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="data">Data</SelectItem>
              <SelectItem value="produto">Produto</SelectItem>
              <SelectItem value="valor">Valor</SelectItem>
              <SelectItem value="margem">Margem</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela Desktop */}
        <div className="hidden md:block rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleOrdenacaoChange('data')}
                  >
                    Data
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleOrdenacaoChange('produto')}
                  >
                    Produto
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Qtd</TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleOrdenacaoChange('valor')}
                  >
                    Valor
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleOrdenacaoChange('margem')}
                  >
                    Margem
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendasPaginadas.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell className="font-medium">
                    {new Date(venda.dataVenda).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{venda.produtoNome}</span>
                      {venda.statusMatch === 'not_found' && (
                        <span className="text-xs text-orange-600">Sem match</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{venda.quantidade}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatarMoeda(venda.precoTotalVendido)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={
                      venda.margemReal >= 50 ? 'text-green-600 font-medium' :
                      venda.margemReal >= 20 ? 'text-yellow-600' :
                      'text-red-600 font-medium'
                    }>
                      {venda.margemReal.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(venda.statusAnalise)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Cards Mobile */}
        <div className="md:hidden space-y-3">
          {vendasPaginadas.map((venda) => (
            <Card key={venda.id} className="border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{venda.produtoNome}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(venda.dataVenda).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {getStatusBadge(venda.statusAnalise)}
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Qtd</p>
                    <p className="font-medium">{venda.quantidade}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Valor</p>
                    <p className="font-medium">{formatarMoeda(venda.precoTotalVendido)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Margem</p>
                    <p className={`font-medium ${
                      venda.margemReal >= 50 ? 'text-green-600' :
                      venda.margemReal >= 20 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {venda.margemReal.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-600">
              Página {paginaAtual} de {totalPaginas}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                let pageNum;
                if (totalPaginas <= 5) {
                  pageNum = i + 1;
                } else if (paginaAtual <= 3) {
                  pageNum = i + 1;
                } else if (paginaAtual >= totalPaginas - 2) {
                  pageNum = totalPaginas - 4 + i;
                } else {
                  pageNum = paginaAtual - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={paginaAtual === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPaginaAtual(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
