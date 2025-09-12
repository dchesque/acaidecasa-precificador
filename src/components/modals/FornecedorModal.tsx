import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { FornecedorForm } from "@/components/forms/FornecedorForm";
import { useAppContext } from "@/contexts/AppContext";
import { FornecedorFormData } from "@/types/forms";
import { Fornecedor } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package } from "lucide-react";

interface FornecedorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedor?: Fornecedor;
  onFornecedorCreated?: (fornecedor: Fornecedor) => void;
}

export const FornecedorModal = ({
  open,
  onOpenChange,
  fornecedor,
  onFornecedorCreated,
}: FornecedorModalProps) => {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: FornecedorFormData) => {
    setIsLoading(true);
    try {
      const now = new Date();
      
      if (fornecedor) {
        // Update existing supplier
        const updatedFornecedor: Fornecedor = {
          ...fornecedor,
          ...data,
          updatedAt: now,
        };
        dispatch({ type: 'UPDATE_FORNECEDOR', payload: updatedFornecedor });
        toast({
          title: "Fornecedor atualizado",
          description: "Fornecedor atualizado com sucesso!",
        });
      } else {
        // Create new supplier
        const newFornecedor: Fornecedor = {
          ...data,
          id: Date.now().toString(),
          createdAt: now,
          updatedAt: now,
        } as Fornecedor;
        dispatch({ type: 'ADD_FORNECEDOR', payload: newFornecedor });
        toast({
          title: "Fornecedor criado",
          description: "Novo fornecedor criado com sucesso!",
        });
        
        // Call callback if provided
        if (onFornecedorCreated) {
          onFornecedorCreated(newFornecedor);
        }
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar fornecedor. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Get linked insumos when editing
  const linkedInsumos = fornecedor ? state.insumoFornecedores
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
    .filter(item => item.insumo) : [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={fornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
      description={
        fornecedor 
          ? "Edite as informações do fornecedor" 
          : "Adicione um novo fornecedor ao sistema"
      }
      size="xl"
    >
      <div className="space-y-6">
        <FornecedorForm
          fornecedor={fornecedor}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />

        {/* Show linked insumos when editing */}
        {fornecedor && (
          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Insumos Vinculados</h3>
              <Badge variant="outline">
                {linkedInsumos.length} {linkedInsumos.length === 1 ? 'item' : 'itens'}
              </Badge>
            </div>
            
            {linkedInsumos.length === 0 ? (
              <div className="text-center py-6">
                <Package className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">Nenhum insumo vinculado a este fornecedor</p>
              </div>
            ) : (
              <div className="border rounded-md max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Insumo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço Bruto</TableHead>
                      <TableHead>Preço c/ Desconto</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linkedInsumos.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{item.insumo?.nome}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.unidadeMedida?.nome}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.categoria && (
                            <Badge 
                              variant="outline"
                              className="text-xs"
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
                          <Badge variant="outline" className="text-xs border-blue-200 bg-blue-50 text-blue-700">
                            {formatCurrency(item.precoBruto)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.precoComDesconto ? (
                            <Badge variant="outline" className="text-xs border-green-200 bg-green-50 text-green-700">
                              {formatCurrency(item.precoComDesconto)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.ativo ? "default" : "secondary"} className="text-xs">
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
        )}
      </div>
    </BaseModal>
  );
};