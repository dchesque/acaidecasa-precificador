import React from "react";
import { BaseModal } from "./BaseModal";
import { useAppContext } from "@/contexts/AppContext";
import { Combinado } from "@/types/database";
import { formatarMoeda, calcularPrecoVendaCombinado, calcularEconomiaCombinado, verificarComboPrecoCompleto } from "@/utils/calculations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Calculator, TrendingUp, Eye, CheckCircle, AlertCircle } from "lucide-react";

interface CombinadoViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  combinado?: Combinado;
}

export const CombinadoViewModal = ({
  open,
  onOpenChange,
  combinado,
}: CombinadoViewModalProps) => {
  const { cardapio, getPrecoVendaItem } = useAppContext();

  if (!combinado) return null;

  // Calcular preços de venda
  const resultadoPrecos = calcularPrecoVendaCombinado(combinado, cardapio);
  const temPrecoCompleto = verificarComboPrecoCompleto(combinado, cardapio);

  // Calcular economia se há preços completos
  const economia = temPrecoCompleto && resultadoPrecos.precoVendaTotal > 0
    ? calcularEconomiaCombinado(combinado.precoCardapio || combinado.precoSugerido, resultadoPrecos.precoVendaTotal)
    : null;

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={`${combinado.nome}`}
      description="Informações detalhadas do combinado"
      size="lg"
    >
      <div className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="text-lg font-semibold">{combinado.nome}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={combinado.ativo ? "default" : "secondary"}>
                    {combinado.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </div>

            {combinado.descricao && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                <p className="text-sm">{combinado.descricao}</p>
              </div>
            )}

            {combinado.categoria && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                <div className="mt-1">
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: combinado.categoria.cor + '20',
                      color: combinado.categoria.cor,
                      borderColor: combinado.categoria.cor
                    }}
                  >
                    {combinado.categoria.nome}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Composição de Custos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Composição de Custos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Copo Base</div>
                  <div className="text-lg font-bold text-destructive">
                    {formatarMoeda(combinado.custoCopoBase)}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Complementos</div>
                  <div className="text-lg font-bold text-destructive">
                    {formatarMoeda(combinado.custoComplementos)}
                  </div>
                </div>
                <div className="text-center p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="text-sm text-destructive font-medium mb-1">Custo Total</div>
                  <div className="text-xl font-bold text-destructive">
                    {formatarMoeda(combinado.custoTotal)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Composição de Preços de Venda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Preços de Venda no Cardápio
              {temPrecoCompleto ? (
                <Badge variant="default" className="ml-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completo
                </Badge>
              ) : (
                <Badge variant="secondary" className="ml-2">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Incompleto
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Preços quando os itens são vendidos separadamente no cardápio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Copo Base */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Copo Base</h4>
                <div className="flex justify-between items-center">
                  <span>{combinado.copoBase?.nome || "Copo Base"}</span>
                  <span className="font-semibold">
                    {resultadoPrecos.precoCopoBase !== null ? (
                      <span className="text-green-600">{formatarMoeda(resultadoPrecos.precoCopoBase)}</span>
                    ) : (
                      <span className="text-muted-foreground">Não no cardápio</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Complementos */}
              {combinado.complementos && combinado.complementos.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Complementos</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resultadoPrecos.complementosComPreco.map((comp, index) => {
                        const itemNome = comp.tipo === 'INSUMO'
                          ? comp.insumo?.nome
                          : comp.receita?.nome;
                        const subtotal = comp.precoVenda ? comp.precoVenda * comp.quantidade : 0;

                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{itemNome}</div>
                                <Badge variant="outline" className="text-xs">
                                  {comp.tipo === 'INSUMO' ? 'Insumo' : 'Receita'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{comp.quantidade}</TableCell>
                            <TableCell className="text-right">
                              {comp.precoVenda ? (
                                <span className="text-green-600">{formatarMoeda(comp.precoVenda)}</span>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {subtotal > 0 ? (
                                <span className="text-green-600 font-medium">{formatarMoeda(subtotal)}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {comp.precoVenda ? (
                                <Badge variant="default" className="text-xs">
                                  No cardápio
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Ausente
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Totais */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-700 mb-1">Total Venda Individual</div>
                  <div className="text-lg font-bold text-green-600">
                    {resultadoPrecos.precoVendaTotal > 0 ? formatarMoeda(resultadoPrecos.precoVendaTotal) : "Incompleto"}
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-700 mb-1">Preço do Combo</div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatarMoeda(combinado.precoCardapio || combinado.precoSugerido)}
                  </div>
                </div>
                {economia && economia.temDesconto && (
                  <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm text-yellow-700 mb-1">Economia Cliente</div>
                    <div className="text-lg font-bold text-yellow-600">
                      {formatarMoeda(economia.economia)}
                    </div>
                    <div className="text-xs text-yellow-600">
                      {economia.porcentagemDesconto.toFixed(1)}% desconto
                    </div>
                  </div>
                )}
              </div>

              {!temPrecoCompleto && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-700 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Preços Incompletos</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Alguns itens deste combinado não estão disponíveis no cardápio com preços individuais.
                    Adicione-os ao cardápio para calcular a economia exata para o cliente.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseModal>
  );
};