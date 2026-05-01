"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Link as LinkIcon } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { formatarMoeda } from "@/utils/calculations";
import { toast } from "sonner";
import { VendaRegistrada } from "@/types/analise-vendas";

interface ProdutosSemMatchCardProps {
  vendas: VendaRegistrada[];
}

type Bucket = {
  produtoErpId: string;
  produtoNome: string;
  ocorrencias: number;
  valorTotal: number;
  vendaIds: string[];
};

/**
 * Lists every venda whose `statusMatch === 'not_found'`, grouped by ERP
 * product, and lets the operator bind the group to a cardápio item in one
 * click. Each binding fires `resolveProdutoMatch` for every venda in the
 * bucket — context handles the optimistic dispatch + Supabase persist.
 */
export const ProdutosSemMatchCard = ({ vendas }: ProdutosSemMatchCardProps) => {
  const { cardapio, resolveProdutoMatch } = useAppContext();
  const [selecoes, setSelecoes] = useState<Record<string, string>>({});

  const buckets = useMemo<Bucket[]>(() => {
    const acc = new Map<string, Bucket>();
    vendas
      .filter((v) => v.statusMatch === "not_found")
      .forEach((v) => {
        const key = v.produtoErpId || v.produtoNome;
        const existing = acc.get(key);
        if (existing) {
          existing.ocorrencias += 1;
          existing.valorTotal += v.precoTotalVendido;
          existing.vendaIds.push(v.id);
        } else {
          acc.set(key, {
            produtoErpId: v.produtoErpId,
            produtoNome: v.produtoNome,
            ocorrencias: 1,
            valorTotal: v.precoTotalVendido,
            vendaIds: [v.id],
          });
        }
      });
    return Array.from(acc.values()).sort((a, b) => b.ocorrencias - a.ocorrencias);
  }, [vendas]);

  if (buckets.length === 0) {
    return null;
  }

  const handleVincular = (bucket: Bucket) => {
    const itemId = selecoes[bucket.produtoErpId || bucket.produtoNome];
    if (!itemId) {
      toast.error("Selecione um item do cardápio antes de vincular.");
      return;
    }
    bucket.vendaIds.forEach((vendaId) => resolveProdutoMatch(vendaId, itemId));
    toast.success(
      `${bucket.ocorrencias} ${bucket.ocorrencias === 1 ? "venda vinculada" : "vendas vinculadas"} a "${cardapio.find((c) => c.id === itemId)?.nome}"`
    );
    setSelecoes((prev) => {
      const next = { ...prev };
      delete next[bucket.produtoErpId || bucket.produtoNome];
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
          Produtos sem vínculo no cardápio
          <Badge variant="secondary" className="ml-2">
            {buckets.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          Vendas importadas cujo produto do ERP não bate com nenhum item do cardápio.
          Vincule manualmente para que entrem nos cálculos de margem.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto (ERP)</TableHead>
                <TableHead className="text-right">Ocorrências</TableHead>
                <TableHead className="text-right">Faturado</TableHead>
                <TableHead className="min-w-[220px]">Vincular ao cardápio</TableHead>
                <TableHead className="w-[120px]">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buckets.map((bucket) => {
                const key = bucket.produtoErpId || bucket.produtoNome;
                return (
                  <TableRow key={key}>
                    <TableCell>
                      <div className="font-medium">{bucket.produtoNome}</div>
                      {bucket.produtoErpId && (
                        <div className="text-xs text-muted-foreground">
                          ID: {bucket.produtoErpId}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {bucket.ocorrencias}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatarMoeda(bucket.valorTotal)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={selecoes[key] ?? ""}
                        onValueChange={(value) =>
                          setSelecoes((prev) => ({ ...prev, [key]: value }))
                        }
                      >
                        <SelectTrigger
                          aria-label={`Selecionar item do cardápio para ${bucket.produtoNome}`}
                        >
                          <SelectValue placeholder="Selecione um item..." />
                        </SelectTrigger>
                        <SelectContent>
                          {cardapio.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              Nenhum item no cardápio
                            </div>
                          ) : (
                            cardapio.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.nome}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleVincular(bucket)}
                        disabled={!selecoes[key]}
                        aria-label={`Vincular ${bucket.ocorrencias} vendas de ${bucket.produtoNome}`}
                      >
                        <LinkIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                        Vincular
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
