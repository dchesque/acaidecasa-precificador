"use client"
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FornecedorModal } from "@/components/modals/FornecedorModal";
import { FornecedorViewModal } from "@/components/modals/FornecedorViewModal";
import { useAppContext } from "@/contexts/AppContext";
import { Fornecedor } from "@/types/database";
import { Plus, Users, Phone, Mail, Edit, Trash2, Search, Package, Eye } from "lucide-react";

const Fornecedores = () => {
  const { state, dispatch } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | undefined>();
  const [viewingFornecedor, setViewingFornecedor] = useState<Fornecedor | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  const handleNewFornecedor = () => {
    setEditingFornecedor(undefined);
    setModalOpen(true);
  };

  const handleViewFornecedor = (fornecedor: Fornecedor) => {
    setViewingFornecedor(fornecedor);
    setViewModalOpen(true);
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
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Pedido Mínimo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFornecedores.map((fornecedor) => (
                      <TableRow key={fornecedor.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{fornecedor.nome}</div>
                            {fornecedor.cnpj && (
                              <div className="text-sm text-muted-foreground">CNPJ: {fornecedor.cnpj}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {fornecedor.telefone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="w-3 h-3" />
                                {fornecedor.telefone}
                              </div>
                            )}
                            {fornecedor.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="w-3 h-3" />
                                {fornecedor.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{fornecedor.prazoEntrega} dias</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">R$ {fornecedor.pedidoMinimo.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={fornecedor.ativo ? "default" : "secondary"}>
                            {fornecedor.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewFornecedor(fornecedor)}
                              title="Visualizar fornecedor"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditFornecedor(fornecedor)}
                              title="Editar fornecedor"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteFornecedor(fornecedor)}
                              title="Excluir fornecedor"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
        </div>
      </div>

      <FornecedorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        fornecedor={editingFornecedor}
      />

      <FornecedorViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        fornecedor={viewingFornecedor}
      />
    </Layout>
  );
};

export default Fornecedores;