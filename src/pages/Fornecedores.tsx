"use client"
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FornecedorModal } from "@/components/modals/FornecedorModal";
import { useAppContext } from "@/contexts/AppContext";
import { Fornecedor } from "@/types/database";
import { Plus, Users, Phone, Mail, Edit, Trash2, Search, Package } from "lucide-react";

const Fornecedores = () => {
  const { state, dispatch } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  const handleNewFornecedor = () => {
    setEditingFornecedor(undefined);
    setModalOpen(true);
  };

  const handleEditFornecedor = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor);
    setModalOpen(true);
  };

  const handleDeleteFornecedor = (fornecedor: Fornecedor) => {
    if (window.confirm(`Tem certeza que deseja excluir "${fornecedor.nome}"?`)) {
      dispatch({ type: 'DELETE_FORNECEDOR', payload: fornecedor.id });
    }
  };

  const filteredFornecedores = state.fornecedores.filter(fornecedor =>
    fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fornecedores</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus fornecedores e mantenha os contatos atualizados
            </p>
          </div>
          <Button onClick={handleNewFornecedor} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Fornecedor
          </Button>
        </div>

        <div className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <Input 
                    placeholder="Buscar fornecedor..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lista de Fornecedores */}
            <div className="grid gap-4">
              {filteredFornecedores.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum fornecedor encontrado</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {state.fornecedores.length === 0 
                        ? "Comece adicionando seus primeiros fornecedores ao sistema."
                        : "Tente ajustar os filtros para encontrar o que procura."
                      }
                    </p>
                    {state.fornecedores.length === 0 && (
                      <Button onClick={handleNewFornecedor}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Primeiro Fornecedor
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredFornecedores.map((fornecedor) => (
                  <Card key={fornecedor.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            {fornecedor.nome}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={fornecedor.ativo ? "default" : "secondary"}>
                            {fornecedor.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditFornecedor(fornecedor)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteFornecedor(fornecedor)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{fornecedor.telefone || "Não informado"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{fornecedor.email || "Não informado"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            Prazo: {fornecedor.prazoEntrega} dias
                          </span>
                        </div>
                      </div>
                      {fornecedor.observacoes && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm">{fornecedor.observacoes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
        </div>
      </div>

      <FornecedorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        fornecedor={editingFornecedor}
      />
    </Layout>
  );
};

export default Fornecedores;