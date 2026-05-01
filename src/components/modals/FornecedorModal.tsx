import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { FornecedorForm } from "@/components/forms/FornecedorForm";
import { useAppContext } from "@/contexts/AppContext";
import { FornecedorFormData } from "@/types/forms";
import { Fornecedor, Insumo, InsumoFornecedor } from "@/types/database";
import { formatarMoeda } from "@/utils/calculations";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createFornecedor as createFornecedorService, updateFornecedor as updateFornecedorService } from "@/services/fornecedoresService";
import { newId } from "@/lib/ids";

interface FornecedorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedor?: Fornecedor;
  mode?: 'create' | 'edit' | 'view';
}

export const FornecedorModal = ({
  open,
  onOpenChange,
  fornecedor,
  mode = 'create'
}: FornecedorModalProps) => {
  const { fornecedores, addFornecedor, updateFornecedor } = useAppContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const title = mode === 'create' ? 'Novo Fornecedor' :
                mode === 'edit' ? 'Editar Fornecedor' :
                'Visualizar Fornecedor';

  const handleSubmit = async (data: FornecedorFormData) => {
    setIsLoading(true);
    try {
      if (mode === 'create') {
        if (isSupabaseConfigured()) {
          const novoFornecedor = await createFornecedorService(data);
          addFornecedor(novoFornecedor);
        } else {
          const novoFornecedor: Fornecedor = {
            id: newId(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          addFornecedor(novoFornecedor);
        }

        toast({
          title: "Fornecedor criado",
          description: "O fornecedor foi criado com sucesso.",
        });
      } else if (mode === 'edit' && fornecedor) {
        if (isSupabaseConfigured()) {
          const fornecedorAtualizado = await updateFornecedorService(fornecedor.id, data);
          updateFornecedor(fornecedorAtualizado);
        } else {
          const fornecedorAtualizado: Fornecedor = {
            ...fornecedor,
            ...data,
            updatedAt: new Date()
          };
          updateFornecedor(fornecedorAtualizado);
        }

        toast({
          title: "Fornecedor atualizado",
          description: "O fornecedor foi atualizado com sucesso.",
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao processar fornecedor:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar o fornecedor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const renderViewMode = () => {
    if (!fornecedor) return null;

    const insumosFornecidos: Array<InsumoFornecedor & { insumo?: Insumo }> = [];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nome</label>
            <p className="text-lg font-semibold">{fornecedor.nome}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="mt-1">
              <Badge variant={fornecedor.ativo ? "default" : "secondary"}>
                {fornecedor.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        </div>

        {(fornecedor.contato || fornecedor.telefone || fornecedor.email) && (
          <div className="grid grid-cols-3 gap-4">
            {fornecedor.contato && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contato</label>
                <p>{fornecedor.contato}</p>
              </div>
            )}
            {fornecedor.telefone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                <p>{fornecedor.telefone}</p>
              </div>
            )}
            {fornecedor.email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p>{fornecedor.email}</p>
              </div>
            )}
          </div>
        )}

        {fornecedor.endereco && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Endereço</label>
            <p>{fornecedor.endereco}</p>
          </div>
        )}

        {fornecedor.cnpj && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">CNPJ</label>
            <p>{fornecedor.cnpj}</p>
          </div>
        )}

        {(fornecedor.prazoEntrega || fornecedor.pedidoMinimo) && (
          <div className="grid grid-cols-2 gap-4">
            {fornecedor.prazoEntrega && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Prazo de Entrega</label>
                <p>{fornecedor.prazoEntrega} dias</p>
              </div>
            )}
            {fornecedor.pedidoMinimo && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pedido Mínimo</label>
                <p>{formatarMoeda(Number(fornecedor.pedidoMinimo))}</p>
              </div>
            )}
          </div>
        )}

        {fornecedor.observacoes && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Observações</label>
            <p className="text-sm text-muted-foreground mt-1">{fornecedor.observacoes}</p>
          </div>
        )}

        {insumosFornecidos.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Insumos Fornecidos
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insumo</TableHead>
                  <TableHead>Preço Unitário</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insumosFornecidos.map((item: InsumoFornecedor & { insumo?: Insumo }) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell>{item.preco ? formatarMoeda(item.preco) : formatarMoeda(0)}</TableCell>
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
    );
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={mode === 'view' ?
        "Informações detalhadas do fornecedor" :
        mode === 'edit' ?
        "Edite as informações do fornecedor" :
        "Preencha as informações do novo fornecedor"
      }
      size="lg"
    >
      {mode === 'view' ? renderViewMode() : (
        <FornecedorForm
          fornecedor={fornecedor}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
    </BaseModal>
  );
};