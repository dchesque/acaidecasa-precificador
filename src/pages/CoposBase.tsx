"use client"
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopoBaseModal } from "@/components/modals/CopoBaseModal";
import { useAppContext } from "@/contexts/AppContext";
import { CopoBase } from "@/types/database";
import { formatarMoeda } from "@/utils/calculations";
import { Plus, Coffee, Calculator, Edit, Trash2, Search, Package, Eye, Layers } from "lucide-react";

const CoposBase = () => {
  const { state, dispatch } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingCopoBase, setEditingCopoBase] = useState<CopoBase | undefined>();
  const [viewingCopoBase, setViewingCopoBase] = useState<CopoBase | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState<"complete" | "by-category">("by-category");

  // Dados mockados consistentes com outras páginas
  const coposBaseMock = [
    {
      id: "COPO001",
      nome: "Copo 300ml Premium",
      descricao: "Base de açaí premium 300ml com banana - tamanho ideal",
      categoriaId: "cat1",
      categoria: { id: "cat1", nome: "Premium", cor: "#8b5cf6", ativo: true },
      insumoBaseId: "INS001",
      insumoBase: { id: "INS001", nome: "Açaí Premium", unidadeMedida: { sigla: "g" } },
      quantidadeBase: 200, // 200g de açaí
      custoBase: 2.50, // 200 * 0.0125
      custoInsumos: 2.00, // embalagem + complementos
      custoTotal: 4.50,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      insumos: [
        {
          id: "ins1",
          insumoId: "INS006",
          quantidade: 1,
          custo: 0.35, // Copo 300ml
          insumo: { id: "INS006", nome: "Copo 300ml", unidadeMedida: { sigla: "un" } }
        },
        {
          id: "ins2",
          insumoId: "INS002",
          quantidade: 80, // 80g banana
          custo: 0.26, // 80 * 0.0032
          insumo: { id: "INS002", nome: "Banana Prata", unidadeMedida: { sigla: "g" } }
        }
      ]
    },
    {
      id: "COPO002",
      nome: "Copo 500ml Tradicional",
      descricao: "Base de açaí tradicional 500ml com banana e granola",
      categoriaId: "cat2",
      categoria: { id: "cat2", nome: "Tradicional", cor: "#06b6d4", ativo: true },
      insumoBaseId: "INS001",
      insumoBase: { id: "INS001", nome: "Açaí Premium", unidadeMedida: { sigla: "g" } },
      quantidadeBase: 350, // 350g de açaí
      custoBase: 4.38, // 350 * 0.0125
      custoInsumos: 1.82, // embalagem + complementos
      custoTotal: 6.20,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      insumos: [
        {
          id: "ins3",
          insumoId: "INS007",
          quantidade: 1,
          custo: 0.48, // Copo 500ml
          insumo: { id: "INS007", nome: "Copo 500ml", unidadeMedida: { sigla: "un" } }
        },
        {
          id: "ins4",
          insumoId: "INS002",
          quantidade: 100, // 100g banana
          custo: 0.32, // 100 * 0.0032
          insumo: { id: "INS002", nome: "Banana Prata", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ins5",
          insumoId: "INS003",
          quantidade: 25, // 25g granola
          custo: 0.22, // 25 * 0.0089
          insumo: { id: "INS003", nome: "Granola Artesanal", unidadeMedida: { sigla: "g" } }
        }
      ]
    },
    {
      id: "COPO003",
      nome: "Copo 400ml Especial",
      descricao: "Base nutritiva com açaí, aveia e banana - opção saudável",
      categoriaId: "cat3",
      categoria: { id: "cat3", nome: "Saudável", cor: "#10b981", ativo: true },
      insumoBaseId: "INS001",
      insumoBase: { id: "INS001", nome: "Açaí Premium", unidadeMedida: { sigla: "g" } },
      quantidadeBase: 250, // 250g de açaí
      custoBase: 3.13, // 250 * 0.0125
      custoInsumos: 0.72, // embalagem + complementos
      custoTotal: 3.85,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      insumos: [
        {
          id: "ins6",
          insumoId: "INS006", // Usando copo 300ml (mais próximo de 400ml)
          quantidade: 1,
          custo: 0.35,
          insumo: { id: "INS006", nome: "Copo 300ml", unidadeMedida: { sigla: "un" } }
        },
        {
          id: "ins7",
          insumoId: "INS005",
          quantidade: 30, // 30g aveia
          custo: 0.14, // 30 * 0.0048
          insumo: { id: "INS005", nome: "Aveia em Flocos", unidadeMedida: { sigla: "g" } }
        },
        {
          id: "ins8",
          insumoId: "INS002",
          quantidade: 70, // 70g banana
          custo: 0.22, // 70 * 0.0032
          insumo: { id: "INS002", nome: "Banana Prata", unidadeMedida: { sigla: "g" } }
        }
      ]
    }
  ];

  // Use mock data for development, fallback to real data if available
  const coposBaseData = state.coposBase.length > 0 ? state.coposBase : coposBaseMock;

  const filteredCoposBase = coposBaseData.filter((copoBase) => {
    const matchesSearch = copoBase.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || copoBase.categoriaId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleNewCopoBase = () => {
    setEditingCopoBase(undefined);
    setModalOpen(true);
  };

  const handleEditCopoBase = (copoBase: CopoBase) => {
    setEditingCopoBase(copoBase);
    setModalOpen(true);
  };

  const handleViewCopoBase = (copoBase: CopoBase) => {
    setViewingCopoBase(copoBase);
    setViewModalOpen(true);
  };

  const handleDeleteCopoBase = (copoBase: CopoBase) => {
    if (window.confirm(`Tem certeza que deseja excluir "${copoBase.nome}"?`)) {
      dispatch({ type: 'DELETE_COPO_BASE', payload: copoBase.id });
    }
  };

  const stats = {
    totalCoposBase: coposBaseData.filter(c => c.ativo).length,
    custoMedio: coposBaseData.length > 0
      ? coposBaseData.reduce((acc, c) => acc + c.custoTotal, 0) / coposBaseData.length
      : 0,
    categorias: new Set(coposBaseData.map(c => c.categoriaId)).size,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Copos Base</h1>
            <p className="text-muted-foreground mt-2">
              Produtos base prontos para complementos e personalização
            </p>
          </div>
          <Button onClick={handleNewCopoBase} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Copo Base
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Copos Base</CardTitle>
              <Coffee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCoposBase}</div>
              <p className="text-xs text-muted-foreground">
                copos base cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarMoeda(stats.custoMedio)}</div>
              <p className="text-xs text-muted-foreground">
                custo médio por copo
              </p>
            </CardContent>
          </Card>


          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categorias}</div>
              <p className="text-xs text-muted-foreground">
                categorias diferentes
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
                    placeholder="Buscar copo base..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select value={selectedCategory || undefined} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {state.categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant={viewMode === "complete" ? "default" : "outline"}
                    onClick={() => setViewMode("complete")}
                    className="w-full"
                  >
                    Visualização Completa
                  </Button>
                  <Button
                    variant={viewMode === "by-category" ? "default" : "outline"}
                    onClick={() => setViewMode("by-category")}
                    className="w-full"
                  >
                    Por Categoria
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Copos Base */}
            {filteredCoposBase.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Coffee className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum copo base encontrado</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {state.coposBase.length === 0
                      ? "Comece adicionando seus primeiros copos base ao sistema."
                      : "Tente ajustar os filtros para encontrar o que procura."
                    }
                  </p>
                  {state.coposBase.length === 0 && (
                    <Button onClick={handleNewCopoBase}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Copo Base
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : viewMode === "complete" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Visualização Completa</CardTitle>
                  <CardDescription>
                    Todos os copos base em formato de tabela
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Insumo Base</TableHead>
                        <TableHead>Qtd. Base</TableHead>
                        <TableHead>Custo Base</TableHead>
                        <TableHead>Custo Insumos</TableHead>
                        <TableHead>Custo Total</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCoposBase.map((copoBase) => (
                        <TableRow key={copoBase.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Coffee className="w-4 h-4 text-muted-foreground" />
                              {copoBase.nome}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={{
                                backgroundColor: copoBase.categoria?.cor + '20',
                                borderColor: copoBase.categoria?.cor,
                                color: copoBase.categoria?.cor
                              }}
                            >
                              {copoBase.categoria?.nome}
                            </Badge>
                          </TableCell>
                          <TableCell>{copoBase.insumoBase?.nome}</TableCell>
                          <TableCell>
                            {copoBase.quantidadeBase}{copoBase.insumoBase?.unidadeMedida?.sigla || 'g'}
                          </TableCell>
                          <TableCell>
                            {formatarMoeda(copoBase.custoBase)}
                          </TableCell>
                          <TableCell>
                            {formatarMoeda(copoBase.custoInsumos)}
                          </TableCell>
                          <TableCell className="font-bold text-orange-600">
                            {formatarMoeda(copoBase.custoTotal)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={copoBase.ativo ? "default" : "secondary"}>
                              {copoBase.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewCopoBase(copoBase)}
                                className="h-8 w-8 p-0"
                                title="Visualizar"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCopoBase(copoBase)}
                                className="h-8 w-8 p-0"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCopoBase(copoBase)}
                                className="h-8 w-8 p-0"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {state.categorias
                  .filter(categoria => {
                    const coposBaseCategoria = filteredCoposBase.filter(cb => cb.categoriaId === categoria.id);
                    return coposBaseCategoria.length > 0;
                  })
                  .map((categoria) => {
                    const coposBaseCategoria = filteredCoposBase.filter(cb => cb.categoriaId === categoria.id);
                    const custoMedio = coposBaseCategoria.reduce((acc, cb) => acc + cb.custoTotal, 0) / coposBaseCategoria.length;

                    return (
                      <Card key={categoria.id}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: categoria.cor }}
                                />
                                {categoria.nome}
                                <Badge variant="secondary">{coposBaseCategoria.length}</Badge>
                              </CardTitle>
                              <CardDescription>
                                Custo médio: {formatarMoeda(custoMedio)}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Insumo Base</TableHead>
                                <TableHead>Qtd. Base</TableHead>
                                <TableHead>Custo Base</TableHead>
                                <TableHead>Custo Insumos</TableHead>
                                <TableHead>Custo Total</TableHead>
                                <TableHead className="text-center">Ações</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {coposBaseCategoria.map((copoBase) => (
                                <TableRow key={copoBase.id}>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                      <Coffee className="w-4 h-4 text-muted-foreground" />
                                      {copoBase.nome}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      style={{
                                        backgroundColor: copoBase.categoria?.cor + '20',
                                        borderColor: copoBase.categoria?.cor,
                                        color: copoBase.categoria?.cor
                                      }}
                                    >
                                      {copoBase.categoria?.nome}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{copoBase.insumoBase?.nome}</TableCell>
                                  <TableCell>
                                    {copoBase.quantidadeBase}{copoBase.insumoBase?.unidadeMedida?.sigla || 'g'}
                                  </TableCell>
                                  <TableCell>
                                    {formatarMoeda(copoBase.custoBase)}
                                  </TableCell>
                                  <TableCell>
                                    {formatarMoeda(copoBase.custoInsumos)}
                                  </TableCell>
                                  <TableCell className="font-bold text-orange-600">
                                    {formatarMoeda(copoBase.custoTotal)}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={copoBase.ativo ? "default" : "secondary"}>
                                      {copoBase.ativo ? "Ativo" : "Inativo"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewCopoBase(copoBase)}
                                        className="h-8 w-8 p-0"
                                        title="Visualizar"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditCopoBase(copoBase)}
                                        className="h-8 w-8 p-0"
                                        title="Editar"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteCopoBase(copoBase)}
                                        className="h-8 w-8 p-0"
                                        title="Excluir"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Copo Base</DialogTitle>
          </DialogHeader>
          {viewingCopoBase && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg">{viewingCopoBase.nome}</h3>
                <p className="text-sm text-muted-foreground">{viewingCopoBase.descricao}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Categoria</p>
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: viewingCopoBase.categoria?.cor + '20',
                      color: viewingCopoBase.categoria?.cor,
                      borderColor: viewingCopoBase.categoria?.cor
                    }}
                  >
                    {viewingCopoBase.categoria?.nome}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={viewingCopoBase.ativo ? "default" : "secondary"}>
                    {viewingCopoBase.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>

              {/* Composição Detalhada */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Composição do Copo Base
                </h4>

                {/* Insumo Base */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Insumo Base</span>
                      <Badge variant="outline">Principal</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{viewingCopoBase.insumoBase?.nome}</span>
                        <span className="text-sm text-muted-foreground">
                          {viewingCopoBase.insumoBase?.descricao}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantidade: </span>
                          <span className="font-medium">
                            {viewingCopoBase.quantidadeBase}{viewingCopoBase.insumoBase?.unidadeMedida?.sigla}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Custo Base: </span>
                          <span className="font-medium text-destructive">
                            {formatarMoeda(viewingCopoBase.custoBase)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Categoria: </span>
                          <span className="font-medium">
                            {viewingCopoBase.insumoBase?.categoria?.nome}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insumos Adicionais */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Insumos Adicionais</span>
                      <Badge variant="outline">
                        {viewingCopoBase.insumos?.length || 0} itens
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {viewingCopoBase.insumos && viewingCopoBase.insumos.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead className="text-right">Quantidade</TableHead>
                            <TableHead className="text-right">Custo Unit.</TableHead>
                            <TableHead className="text-right">Custo Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewingCopoBase.insumos.map((ins, index) => (
                            <TableRow key={ins.id || index}>
                              <TableCell className="font-medium">
                                {ins.insumo?.nome || 'Insumo não identificado'}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                  style={{
                                    backgroundColor: ins.insumo?.categoria?.cor + '20',
                                    borderColor: ins.insumo?.categoria?.cor,
                                    color: ins.insumo?.categoria?.cor
                                  }}
                                >
                                  {ins.insumo?.categoria?.nome}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {ins.quantidade}
                                {ins.insumo?.unidadeMedida && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    {ins.insumo.unidadeMedida.sigla}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {ins.custo && ins.quantidade ?
                                  formatarMoeda(ins.custo / ins.quantidade) : '-'}
                              </TableCell>
                              <TableCell className="text-right font-medium text-destructive">
                                {formatarMoeda(ins.custo)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-semibold bg-muted/50">
                            <TableCell colSpan={4}>Total dos Insumos Adicionais</TableCell>
                            <TableCell className="text-right text-destructive">
                              {formatarMoeda(viewingCopoBase.custoInsumos)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Nenhum insumo adicional
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Resumo de Custos */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Resumo Financeiro
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Custos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Insumo Base:</span>
                        <span className="font-medium">{formatarMoeda(viewingCopoBase.custoBase)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Insumos Adicionais:</span>
                        <span className="font-medium">{formatarMoeda(viewingCopoBase.custoInsumos)}</span>
                      </div>
                      <div className="pt-2 border-t flex justify-between">
                        <span className="font-semibold">Custo Total:</span>
                        <span className="font-bold text-destructive">
                          {formatarMoeda(viewingCopoBase.custoTotal)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Create Modal */}
      <CopoBaseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        copoBase={editingCopoBase}
      />
    </Layout>
  );
};

export default CoposBase;