import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { ReceitaCategoriaModal } from "./ReceitaCategoriaModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/contexts/AppContext";
import { Categoria } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { Plus, Search, Edit, Trash2, ChefHat, Palette } from "lucide-react";

interface ReceitaCategoriasManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReceitaCategoriasManagerModal = ({
  open,
  onOpenChange,
}: ReceitaCategoriasManagerModalProps) => {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | undefined>();

  const handleNewCategoria = () => {
    setEditingCategoria(undefined);
    setCategoriaModalOpen(true);
  };

  const handleEditCategoria = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setCategoriaModalOpen(true);
  };

  const handleDeleteCategoria = async (categoria: Categoria) => {
    const hasReceitas = state.receitas?.some(receita => receita.categoriaId === categoria.id);

    if (hasReceitas) {
      toast({
        title: "Não é possível excluir",
        description: "Esta categoria está sendo usada por receitas. Remova as receitas primeiro.",
        variant: "destructive",
      });
      return;
    }

    const ok = await confirm({
      title: "Excluir categoria",
      description: `Tem certeza que deseja excluir a categoria "${categoria.nome}"?`,
      destructive: true,
      confirmLabel: "Excluir",
    });
    if (ok) {
      dispatch({ type: 'DELETE_CATEGORIA', payload: categoria.id });
      toast({
        title: "Categoria excluída",
        description: `A categoria "${categoria.nome}" foi excluída com sucesso.`,
      });
    }
  };

  const filteredCategorias = state.categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count recipes per category
  const getReceitasCount = (categoriaId: string) => {
    return state.receitas?.filter(receita => receita.categoriaId === categoriaId).length || 0;
  };

  return (
    <>
      <BaseModal
        open={open}
        onOpenChange={onOpenChange}
        title="Gerenciar Categorias de Receitas"
        description="Crie, edite e organize suas categorias de receitas"
        size="lg"
      >
        <div className="space-y-4">
          {/* Header com busca e novo */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categorias de receitas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleNewCategoria} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </div>

          {/* Lista de categorias */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredCategorias.length === 0 ? (
              <div className="text-center py-8">
                <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  {searchTerm ? "Nenhuma categoria encontrada" : "Nenhuma categoria cadastrada"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm
                    ? "Tente ajustar sua pesquisa"
                    : "Crie sua primeira categoria para organizar as receitas"
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={handleNewCategoria} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Categoria
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCategorias.map((categoria) => {
                  const receitasCount = getReceitasCount(categoria.id);

                  return (
                    <div
                      key={categoria.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: categoria.cor || "#8B5CF6" }}
                        />
                        <div>
                          <div className="font-medium">{categoria.nome}</div>
                          {categoria.descricao && (
                            <div className="text-sm text-muted-foreground">
                              {categoria.descricao}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {receitasCount} {receitasCount === 1 ? 'receita' : 'receitas'}
                          </div>
                        </div>
                        <Badge variant={categoria.ativo ? "default" : "secondary"}>
                          {categoria.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategoria(categoria)}
                          aria-label={`Editar categoria ${categoria.nome}`}
                        >
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategoria(categoria)}
                          disabled={receitasCount > 0}
                          aria-label={`Excluir categoria ${categoria.nome}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Resumo */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                Total: {state.categorias.length} categorias
              </div>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Ativas: {state.categorias.filter(c => c.ativo).length}
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Com receitas: {state.categorias.filter(c => getReceitasCount(c.id) > 0).length}
              </div>
            </div>
          </div>
        </div>
      </BaseModal>

      {/* Modal de edição/criação */}
      <ReceitaCategoriaModal
        open={categoriaModalOpen}
        onOpenChange={setCategoriaModalOpen}
        categoria={editingCategoria}
      />
    </>
  );
};