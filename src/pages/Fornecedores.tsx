"use client"
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FornecedorModal } from "@/components/modals/FornecedorModal";
import { FornecedorViewModal } from "@/components/modals/FornecedorViewModal";
import { useAppContext } from "@/contexts/AppContext";
import { Fornecedor, Insumo } from "@/types/database";
import { formatarMoeda } from "@/utils/calculations";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchFornecedores, deleteFornecedor as deleteFornecedorService } from "@/services/fornecedoresService";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Phone, Mail, Edit, Trash2, Search, Package, Eye, Clock, DollarSign, MessageCircle } from "lucide-react";

const Fornecedores = () => {
  const { state, dispatch } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | undefined>();
  const [viewingFornecedor, setViewingFornecedor] = useState<Fornecedor | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const supabaseEnabled = isSupabaseConfigured();
  const { toast } = useToast();

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

  const handleDeleteFornecedor = async (fornecedor: Fornecedor) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${fornecedor.nome}"?`)) {
      return;
    }

    try {
      if (supabaseEnabled) {
        await deleteFornecedorService(fornecedor.id);
      }

      dispatch({ type: 'DELETE_FORNECEDOR', payload: fornecedor.id });
      toast({
        title: "Fornecedor removido",
        description: "Fornecedor excluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir fornecedor", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o fornecedor agora.",
        variant: "destructive",
      });
    }
  };

  // Dados mockados temporários para desenvolvimento
  const fornecedoresMock = [
    {
      id: "forn1",
      nome: "Distribuidora Amazônia",
      contato: "João Silva",
      telefone: "(11) 99999-9999",
      email: "joao@amazonia.com.br",
      endereco: "Rua das Frutas, 123 - São Paulo/SP",
      cnpj: "12.345.678/0001-90",
      prazoEntrega: 2,
      pedidoMinimo: 500,
      observacoes: "Fornecedor de açaí premium",
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "forn2",
      nome: "Embalagens Sustentáveis",
      contato: "Maria Santos",
      telefone: "(11) 88888-8888",
      email: "maria@embalagens.com.br",
      endereco: "Av. Industrial, 456 - São Paulo/SP",
      cnpj: "98.765.432/0001-10",
      prazoEntrega: 1,
      pedidoMinimo: 1000,
      observacoes: "Copos e embalagens biodegradáveis",
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "forn3",
      nome: "Hortifruti Central",
      contato: "Pedro Oliveira",
      telefone: "(11) 77777-7777",
      email: "pedro@hortifruti.com.br",
      endereco: "Mercado Central, Box 789 - São Paulo/SP",
      cnpj: "11.222.333/0001-44",
      prazoEntrega: 1,
      pedidoMinimo: 200,
      observacoes: "Frutas frescas diariamente",
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "forn4",
      nome: "Doces & Complementos",
      contato: "Ana Costa",
      telefone: "(11) 66666-6666",
      email: "ana@doces.com.br",
      endereco: "Rua dos Doces, 321 - São Paulo/SP",
      cnpj: "55.666.777/0001-88",
      prazoEntrega: 3,
      pedidoMinimo: 300,
      observacoes: "Granola, caldas e complementos",
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  useEffect(() => {
    if (!supabaseEnabled) {
      return;
    }

    const loadFromSupabase = async () => {
      try {
        setSyncingSupabase(true);
        const fornecedoresRemotos = await fetchFornecedores();
        if (fornecedoresRemotos.length > 0) {
          dispatch({ type: 'SET_FORNECEDORES', payload: fornecedoresRemotos });
        }
      } catch (error) {
        console.error('Erro ao carregar fornecedores do Supabase', error);
      } finally {
        setSyncingSupabase(false);
      }
    };

    loadFromSupabase();
  }, [dispatch, supabaseEnabled]);

  // Use mock data for development, fallback to real data if available
  const fornecedoresData = state.fornecedores.length > 0 ? state.fornecedores : fornecedoresMock;

  const prazos = fornecedoresData
    .map((fornecedor) => fornecedor.prazoEntrega)
    .filter((value): value is number => typeof value === "number" && !Number.isNaN(value));

  const pedidosMinimos = fornecedoresData
    .map((fornecedor) => fornecedor.pedidoMinimo)
    .filter((value): value is number => typeof value === "number" && !Number.isNaN(value));

  const filteredFornecedores = fornecedoresData.filter(fornecedor =>
    fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalFornecedores: fornecedoresData.filter((f) => f.ativo).length,
    fornecedoresInativos: fornecedoresData.filter((f) => !f.ativo).length,
    prazoMedio: prazos.length > 0
      ? Math.round(prazos.reduce((acc, dias) => acc + dias, 0) / prazos.length)
      : null,
    pedidoMinimoMedio: pedidosMinimos.length > 0
      ? pedidosMinimos.reduce((acc, valor) => acc + valor, 0) / pedidosMinimos.length
      : null,
    fornecedoresComEmail: fornecedoresData.filter((f) => f.email).length,
    fornecedoresComTelefone: fornecedoresData.filter((f) => f.telefone).length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fornecedores</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus fornecedores e mantenha os contatos atualizados
            </p>
            {supabaseEnabled && (
              <p className="text-xs text-muted-foreground mt-1">
                {syncingSupabase ? "Sincronizando com Supabase..." : "Supabase conectado"}
              </p>
            )}
          </div>
          <Button onClick={handleNewFornecedor} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Fornecedor
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalFornecedores}</div>
              <p className="text-xs text-muted-foreground">
                {stats.fornecedoresInativos > 0 && `${stats.fornecedoresInativos} inativos`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prazo Médio</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.prazoMedio !== null ? stats.prazoMedio : "-"}</div>
              <p className="text-xs text-muted-foreground">
                {stats.prazoMedio !== null ? "dias de entrega" : "Sem dados cadastrados"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedido Médio</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pedidoMinimoMedio !== null ? formatarMoeda(stats.pedidoMinimoMedio) : "-"}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pedidoMinimoMedio !== null ? "valor minimo medio" : "Sem dados cadastrados"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Contato</CardTitle>
              <MessageCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{Math.max(stats.fornecedoresComEmail, stats.fornecedoresComTelefone)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.fornecedoresComEmail} emails, {stats.fornecedoresComTelefone} telefones
              </p>
            </CardContent>
          </Card>
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
                <div className="grid grid-cols-4 gap-4">
                  <Input 
                    placeholder="Buscar fornecedor..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div></div>
                  <div></div>
                  <div></div>
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
                    {fornecedoresData.length === 0 
                      ? "Comece adicionando seus primeiros fornecedores ao sistema."
                      : "Tente ajustar os filtros para encontrar o que procura."
                    }
                  </p>
                  {fornecedoresData.length === 0 && (
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
                      <TableHead>Produtos Vinculados</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Pedido Mínimo</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                      <TableHead className="w-16">Status</TableHead>
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
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              // Encontrar insumos vinculados a este fornecedor
                              const insumosVinculados = state.insumoFornecedores
                                .filter(inf => inf.fornecedorId === fornecedor.id && inf.ativo)
                                .map((inf) => state.insumos.find((i) => i.id === inf.insumoId))
                                .filter((insumo): insumo is Insumo => Boolean(insumo));

                              if (insumosVinculados.length === 0) {
                                return (
                                  <span className="text-xs text-muted-foreground">
                                    Nenhum produto
                                  </span>
                                );
                              }

                              const visibleInsumos = insumosVinculados.slice(0, 2);
                              const remainingCount = insumosVinculados.length - 2;

                              return (
                                <>
                                  {visibleInsumos.map((insumo) => (
                                    <Badge 
                                      key={insumo.id}
                                      variant="secondary" 
                                      className="text-xs" 
                                      style={{ 
                                        backgroundColor: insumo.categoria?.cor ? insumo.categoria.cor + '20' : '#6b728020', 
                                        color: insumo.categoria?.cor || '#6b7280', 
                                        borderColor: insumo.categoria?.cor || '#6b7280'
                                      }}
                                      title={insumo.nome}
                                    >
                                      {insumo.nome.length > 12 ? insumo.nome.substring(0, 12) + '...' : insumo.nome}
                                    </Badge>
                                  ))}
                                  {remainingCount > 0 && (
                                    <Badge 
                                      variant="outline"
                                      className="text-xs bg-gray-50 hover:bg-gray-100 cursor-help" 
                                      title={insumosVinculados.slice(2).map(i => i.nome).join(', ')}
                                    >
                                      +{remainingCount}
                                    </Badge>
                                  )}
                                </>
                              );
                            })()}
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
                          <span className="text-sm">{typeof fornecedor.prazoEntrega === "number" ? `${fornecedor.prazoEntrega} dias` : "-"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{typeof fornecedor.pedidoMinimo === "number" ? formatarMoeda(fornecedor.pedidoMinimo) : "-"}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center gap-1 justify-center">
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
                        <TableCell>
                          <div className="w-2 h-2 rounded-full mx-auto" 
                               style={{backgroundColor: fornecedor.ativo ? '#22c55e' : '#6b7280'}} 
                               title={fornecedor.ativo ? "Ativo" : "Inativo"}
                          />
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
