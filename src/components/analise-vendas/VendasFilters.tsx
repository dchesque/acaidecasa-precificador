"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Filter,
  Calendar as CalendarIcon,
  Search,
  X,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { FiltrosVendas } from '@/types/analise-vendas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VendasFiltersProps {
  filtros: FiltrosVendas;
  onUpdateFiltros: (filtros: Partial<FiltrosVendas>) => void;
  onLimparFiltros: () => void;
  totalVendas: number;
  vendasFiltradas: number;
}

export const VendasFilters: React.FC<VendasFiltersProps> = ({
  filtros,
  onUpdateFiltros,
  onLimparFiltros,
  totalVendas,
  vendasFiltradas
}) => {
  const [expandido, setExpandido] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filtros.produto);

  const temFiltrosAtivos =
    filtros.periodo.inicio !== null ||
    filtros.periodo.fim !== null ||
    filtros.produto !== '' ||
    filtros.statusAnalise !== 'todos' ||
    filtros.statusMatch !== 'todos' ||
    filtros.vendedor !== '';

  const handleSearch = () => {
    onUpdateFiltros({ produto: searchTerm });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Selecionar data';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
          {temFiltrosAtivos && (
            <Badge className="bg-blue-100 text-blue-800">
              {vendasFiltradas} de {totalVendas} vendas
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {temFiltrosAtivos && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onLimparFiltros}
            >
              <X className="h-4 w-4 mr-1" />
              Limpar filtros
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setExpandido(!expandido)}
          >
            {expandido ? 'Ocultar' : 'Mostrar'} filtros avançados
          </Button>
        </div>
      </div>

      {/* Filtros básicos sempre visíveis */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Busca por produto */}
        <div className="col-span-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>Buscar</Button>
          </div>
        </div>

        {/* Status de análise */}
        <div>
          <Select
            value={filtros.statusAnalise}
            onValueChange={(value) => onUpdateFiltros({ statusAnalise: value as FiltrosVendas['statusAnalise'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ok">OK</SelectItem>
              <SelectItem value="divergencia">Com divergência</SelectItem>
              <SelectItem value="prejuizo">Com prejuízo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ordenação */}
        <div>
          <Select
            value={`${filtros.orderBy}-${filtros.orderDirection}`}
            onValueChange={(value) => {
              const [orderBy, orderDirection] = value.split('-');
              onUpdateFiltros({
                orderBy: orderBy as FiltrosVendas['orderBy'],
                orderDirection: orderDirection as FiltrosVendas['orderDirection']
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="data-desc">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Data (mais recente)
                </div>
              </SelectItem>
              <SelectItem value="data-asc">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Data (mais antiga)
                </div>
              </SelectItem>
              <SelectItem value="valor-desc">
                <div className="flex items-center gap-2">
                  <SortDesc className="h-4 w-4" />
                  Valor (maior)
                </div>
              </SelectItem>
              <SelectItem value="valor-asc">
                <div className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4" />
                  Valor (menor)
                </div>
              </SelectItem>
              <SelectItem value="divergencia-desc">
                <div className="flex items-center gap-2">
                  <SortDesc className="h-4 w-4" />
                  Divergência (maior)
                </div>
              </SelectItem>
              <SelectItem value="margem-desc">
                <div className="flex items-center gap-2">
                  <SortDesc className="h-4 w-4" />
                  Margem (maior)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtros avançados */}
      {expandido && (
        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Período - Data inicial */}
          <div>
            <Label className="text-sm">Data inicial</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDate(filtros.periodo.inicio)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filtros.periodo.inicio || undefined}
                  onSelect={(date) => onUpdateFiltros({
                    periodo: { ...filtros.periodo, inicio: date || null }
                  })}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Período - Data final */}
          <div>
            <Label className="text-sm">Data final</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDate(filtros.periodo.fim)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filtros.periodo.fim || undefined}
                  onSelect={(date) => onUpdateFiltros({
                    periodo: { ...filtros.periodo, fim: date || null }
                  })}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status de match */}
          <div>
            <Label className="text-sm">Vínculo com cardápio</Label>
            <Select
              value={filtros.statusMatch}
              onValueChange={(value) => onUpdateFiltros({ statusMatch: value as FiltrosVendas['statusMatch'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status do match" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="matched">Vinculados</SelectItem>
                <SelectItem value="not_found">Não encontrados</SelectItem>
                <SelectItem value="manual">Vinculados manualmente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vendedor */}
          <div>
            <Label className="text-sm">Vendedor</Label>
            <Input
              placeholder="Nome do vendedor..."
              value={filtros.vendedor}
              onChange={(e) => onUpdateFiltros({ vendedor: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Atalhos de período */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-gray-600">Atalhos:</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const hoje = new Date();
              onUpdateFiltros({
                periodo: {
                  inicio: hoje,
                  fim: hoje
                }
              });
            }}
          >
            Hoje
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const hoje = new Date();
              const seteDiasAtras = new Date(hoje);
              seteDiasAtras.setDate(hoje.getDate() - 7);
              onUpdateFiltros({
                periodo: {
                  inicio: seteDiasAtras,
                  fim: hoje
                }
              });
            }}
          >
            Últimos 7 dias
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const hoje = new Date();
              const trintaDiasAtras = new Date(hoje);
              trintaDiasAtras.setDate(hoje.getDate() - 30);
              onUpdateFiltros({
                periodo: {
                  inicio: trintaDiasAtras,
                  fim: hoje
                }
              });
            }}
          >
            Últimos 30 dias
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const hoje = new Date();
              const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
              const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
              onUpdateFiltros({
                periodo: {
                  inicio: inicioMes,
                  fim: fimMes
                }
              });
            }}
          >
            Este mês
          </Button>
        </div>
      </div>
    </div>
  );
};

// Componente Badge inline
const Badge: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);