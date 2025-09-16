import { BaseModal } from "./BaseModal";
import { useAppContext } from "@/contexts/AppContext";
import { Fornecedor } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, Phone, Mail, Package, MapPin, Calendar, Clock } from "lucide-react";

interface FornecedorViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedor?: Fornecedor;
}

export const FornecedorViewModal = ({
  open,
  onOpenChange,
  fornecedor,
}: FornecedorViewModalProps) => {
  const { state } = useAppContext();

  if (!fornecedor) return null;

  const linkedInsumos = state.insumoFornecedores
    .filter(insumoFornecedor => 
      insumoFornecedor.fornecedorId === fornecedor.id && insumoFornecedor.ativo
    )
    .map(insumoFornecedor => {
      const insumo = state.insumos.find(i => i.id === insumoFornecedor.insumoId);
      const categoria = insumo ? state.categorias.find(c => c.id === insumo.categoriaId) : null;
      const unidadeMedida = insumo ? state.unidadesMedida.find(u => u.id === insumo.unidadeMedidaId) : null;
      
      return {
        ...insumoFornecedor,
        insumo,
        categoria,
        unidadeMedida,
      };
    })
    .filter(item => item.insumo);

  const formatCurrency = (value?: number) => {
    if (typeof value !== "number") {
      return "-";
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Fornecedor: ${fornecedor.nome}`}
      description="Visualização completa dos dados do fornecedor"
      size="xl"
    >
      <div className="space-y-6">
        {/* Informações do Fornecedor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Informações Gerais</h3>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Nome:</span>
                <p className="text-sm">{fornecedor.nome}</p>
              </div>
              
              {fornecedor.cnpj && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">CNPJ:</span>
                  <p className="text-sm">{fornecedor.cnpj}</p>
                </div>
              )}
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                <div className="mt-1">
                  <Badge variant={fornecedor.ativo ? "default" : "secondary"}>
                    {fornecedor.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Contato</h3>
            </div>
            
            <div className="space-y-2">
              {fornecedor.telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{fornecedor.telefone}</span>
                </div>
              )}
              
              {fornecedor.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{fornecedor.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Condições Comerciais */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Condições Comerciais</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Prazo de Entrega:</span>
              <p className="text-sm flex items-center gap-1 mt-1">
                <Clock className="w-4 h-4" />
                {typeof fornecedor.prazoEntrega === "number" ? `${fornecedor.prazoEntrega} dias` : "-"}
              </p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-muted-foreground">Pedido Mínimo:</span>
              <p className="text-sm mt-1">{formatCurrency(fornecedor.pedidoMinimo)}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-muted-foreground">Cadastrado em:</span>
              <p className="text-sm flex items-center gap-1 mt-1">
                <Calendar className="w-4 h-4" />
                {formatDate(fornecedor.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Observações */}
        {fornecedor.observacoes && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Observações</h3>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              {fornecedor.observacoes}
            </p>
          </div>
        )}

        {/* Insumos Vinculados */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Insumos Vinculados</h3>
            <Badge variant="outline">
              {linkedInsumos.length} {linkedInsumos.length === 1 ? 'item' : 'itens'}
            </Badge>
          </div>
          
          {linkedInsumos.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhum insumo vinculado a este fornecedor</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Insumo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço Bruto</TableHead>
                    <TableHead>Preço c/ Desconto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linkedInsumos.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.insumo?.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.unidadeMedida?.nome}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.categoria && (
                          <Badge 
                            variant="outline"
                            style={{ 
                              backgroundColor: `${item.categoria.cor}20`,
                              borderColor: item.categoria.cor,
                              color: item.categoria.cor
                            }}
                          >
                            {item.categoria.nome}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                          {formatCurrency(item.precoBruto)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.precoComDesconto ? (
                          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                            {formatCurrency(item.precoComDesconto)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {item.quantidadeComprada} {item.unidadeMedida?.sigla}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.ativo ? "default" : "secondary"}>
                          {item.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};
