import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Stepper, Step } from "@/components/ui/stepper";
import { CategoriaModal } from "@/components/modals/CategoriaModal";
import { FornecedorModal } from "@/components/modals/FornecedorModal";
import { InsumoSupplierModal } from "@/components/modals/InsumoSupplierModal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insumoSchema, InsumoFormData } from "@/types/forms";
import { Insumo, Categoria, Fornecedor, InsumoFornecedor } from "@/types/database";
import { useAppContext } from "@/contexts/AppContext";
import { ChevronLeft, ChevronRight, Package, Tag, Building2, DollarSign, Plus, Calculator, Edit, Trash2, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface InsumoSubmitData {
  formData: InsumoFormData;
  suppliers: InsumoFornecedor[];
}

interface InsumoFormStepsProps {
  insumo?: Insumo;
  onSubmit: (data: InsumoSubmitData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const steps: Step[] = [
  {
    title: "Informações Básicas",
    description: "Nome e descrição",
  },
  {
    title: "Categoria e Unidade",
    description: "Classificação e medida",
  },
  {
    title: "Fornecedores",
    description: "Gerenciar fornecedores e preços",
  },
];

export const InsumoFormSteps = ({
  insumo,
  onSubmit,
  onCancel,
  isLoading = false,
}: InsumoFormStepsProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false);
  const [fornecedorModalOpen, setFornecedorModalOpen] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<InsumoFornecedor | undefined>();
  const [insumoSuppliers, setInsumoSuppliers] = useState<InsumoFornecedor[]>([]);
  const { state } = useAppContext();
  
  // Create memoized default values to ensure they update when insumo changes
  const defaultValues = useMemo(() => ({
    nome: insumo?.nome || "",
    descricao: insumo?.descricao || "",
    categoriaId: insumo?.categoriaId || "",
    unidadeMedidaId: insumo?.unidadeMedidaId || "",
    fornecedorCalculoId: insumo?.fornecedorCalculoId || "",
    ativo: insumo?.ativo ?? true,
  }), [insumo]);

  const form = useForm<InsumoFormData>({
    resolver: zodResolver(insumoSchema),
    defaultValues,
  });

  const categorias = state.categorias.filter(c => c.ativo);
  const unidades = state.unidadesMedida;
  const fornecedores = state.fornecedores.filter(f => f.ativo);

  // Initialize form data and suppliers when editing existing insumo
  useEffect(() => {
    if (insumo) {
      // Reset form with current insumo values
      setTimeout(() => {
        form.reset({
          nome: insumo.nome || "",
          descricao: insumo.descricao || "",
          categoriaId: insumo.categoriaId || "",
          unidadeMedidaId: insumo.unidadeMedidaId || "",
          fornecedorCalculoId: insumo.fornecedorCalculoId || "",
          ativo: insumo.ativo ?? true,
        });
      }, 0);
      
      const existingSuppliers = state.insumoFornecedores.filter(
        insumoFornecedor => insumoFornecedor.insumoId === insumo.id
      );
      setInsumoSuppliers(existingSuppliers);
    } else {
      setInsumoSuppliers([]);
    }
  }, [insumo?.id, state.insumoFornecedores]);

  // Supplier management functions
  const handleAddSupplier = () => {
    setEditingSupplier(undefined);
    setSupplierModalOpen(true);
  };

  const handleEditSupplier = (supplier: InsumoFornecedor) => {
    setEditingSupplier(supplier);
    setSupplierModalOpen(true);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setInsumoSuppliers(prev => prev.filter(s => s.id !== supplierId));
  };

  const handleSetDefaultSupplier = (supplierId: string) => {
    const supplier = insumoSuppliers.find(s => s.id === supplierId);
    if (supplier) {
      form.setValue("fornecedorCalculoId", supplier.fornecedorId);
    }
  };

  const handleSupplierSave = (supplierData: any) => {
    if (editingSupplier) {
      // Update existing supplier
      setInsumoSuppliers(prev => 
        prev.map(s => s.id === editingSupplier.id 
          ? { ...s, ...supplierData, updatedAt: new Date() }
          : s
        )
      );
    } else {
      // Add new supplier
      const newSupplier: InsumoFornecedor = {
        id: Date.now().toString(),
        insumoId: insumo?.id || '',
        ...supplierData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setInsumoSuppliers(prev => [...prev, newSupplier]);
      
      // Set as default if it's the first one
      if (insumoSuppliers.length === 0) {
        form.setValue("fornecedorCalculoId", supplierData.fornecedorId);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof InsumoFormData)[] = [];
    
    switch (currentStep) {
      case 0: // Informações Básicas
        fieldsToValidate = ["nome"];
        break;
      case 1: // Categoria e Unidade de Medida
        fieldsToValidate = ["categoriaId", "unidadeMedidaId"];
        break;
      case 2: // Fornecedores
        // Validate that at least one supplier is added
        if (insumoSuppliers.length === 0) {
          alert("Adicione pelo menos um fornecedor antes de continuar.");
          return false;
        }
        // Validate that a default supplier is selected
        if (!form.getValues("fornecedorCalculoId")) {
          alert("Selecione um fornecedor padrão antes de continuar.");
          return false;
        }
        return true;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleSubmit = (data: InsumoFormData) => {
    onSubmit({
      formData: data,
      suppliers: insumoSuppliers,
    });
  };

  const handleNovaCategoria = () => {
    setCategoriaModalOpen(true);
  };

  const handleCategoriaCreated = (novaCategoria: Categoria) => {
    // Automatically select the newly created category
    form.setValue("categoriaId", novaCategoria.id);
  };

  const handleNovoFornecedor = () => {
    setFornecedorModalOpen(true);
  };

  const handleFornecedorCreated = (novoFornecedor: Fornecedor) => {
    // Automatically select the newly created supplier
    form.setValue("fornecedorCalculoId", novoFornecedor.id);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Informações Básicas
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Informações Básicas</h3>
            </div>
            
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Insumo *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Polpa de Açaí, Banana, Granola..." 
                      className="text-lg"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva detalhes importantes sobre o insumo..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Insumo Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Quando desativado, não aparecerá nas listas de seleção
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );

      case 1: // Categoria e Unidade de Medida
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Categoria e Unidade de Medida</h3>
            </div>
            
            <div className="text-sm text-muted-foreground mb-6">
              Defina a categoria e unidade de medida para este insumo. Essas informações são essenciais para organização e cálculos precisos.
            </div>

            <FormField
              control={form.control}
              name="categoriaId"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Categoria *</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleNovaCategoria}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Nova Categoria
                    </Button>
                  </div>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-lg">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          <div className="flex items-center gap-2">
                            {categoria.cor && (
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: categoria.cor }}
                              />
                            )}
                            {categoria.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unidadeMedidaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade de Medida *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-lg">
                        <SelectValue placeholder="Selecione uma unidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unidades.map((unidade) => (
                        <SelectItem key={unidade.id} value={unidade.id}>
                          <div>
                            <div className="font-medium">{unidade.nome} ({unidade.sigla})</div>
                            <div className="text-xs text-muted-foreground">
                              Tipo: {unidade.tipo}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {categorias.length === 0 && (
              <div className="text-center p-8 border border-dashed rounded-lg">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Nenhuma categoria encontrada</p>
                <p className="text-sm text-muted-foreground">
                  Você precisa criar pelo menos uma categoria antes de continuar.
                </p>
              </div>
            )}
          </div>
        );

      case 2: // Fornecedores
        const defaultSupplierId = form.watch("fornecedorCalculoId");
        const excludedSupplierIds = insumoSuppliers.map(s => s.fornecedorId);
        
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Gerenciar Fornecedores</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleNovoFornecedor}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Novo Fornecedor
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleAddSupplier}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Adicionar Fornecedor
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground mb-4">
              Adicione múltiplos fornecedores para este insumo com preços específicos. 
              Selecione um fornecedor como padrão para ser usado nos cálculos.
            </div>

            {insumoSuppliers.length === 0 ? (
              <div className="text-center p-8 border border-dashed rounded-lg">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Nenhum fornecedor adicionado</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Adicione pelo menos um fornecedor com preços específicos para este insumo.
                </p>
                <Button
                  type="button"
                  onClick={handleAddSupplier}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Primeiro Fornecedor
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Fornecedores do Insumo</h4>
                  <Badge variant="outline">
                    {insumoSuppliers.length} {insumoSuppliers.length === 1 ? 'fornecedor' : 'fornecedores'}
                  </Badge>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Preço Bruto</TableHead>
                        <TableHead>Preço c/ Desconto</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Custo/Un</TableHead>
                        <TableHead>Padrão</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {insumoSuppliers.map((supplier) => {
                        const fornecedor = fornecedores.find(f => f.id === supplier.fornecedorId);
                        const isDefault = supplier.fornecedorId === defaultSupplierId;
                        const precoParaCalculo = supplier.usarPrecoComDesconto && supplier.precoComDesconto 
                          ? supplier.precoComDesconto 
                          : supplier.precoBruto;
                        const custoPorUnidade = precoParaCalculo / supplier.quantidadeComprada;
                        
                        return (
                          <TableRow key={supplier.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{fornecedor?.nome}</div>
                                <div className="text-xs text-muted-foreground">
                                  {fornecedor?.telefone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                {formatCurrency(supplier.precoBruto)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {supplier.precoComDesconto ? (
                                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                  {formatCurrency(supplier.precoComDesconto)}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{supplier.quantidadeComprada}</span>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{formatCurrency(custoPorUnidade)}</span>
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant={isDefault ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleSetDefaultSupplier(supplier.id)}
                                className="flex items-center gap-1"
                              >
                                <Star className={`h-3 w-3 ${isDefault ? 'fill-current' : ''}`} />
                                {isDefault ? 'Padrão' : 'Definir'}
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditSupplier(supplier)}
                                  title="Editar fornecedor"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSupplier(supplier.id)}
                                  title="Remover fornecedor"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Default supplier summary */}
                {defaultSupplierId && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-primary fill-current" />
                      <h4 className="font-medium text-primary">Fornecedor Padrão Selecionado</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Este fornecedor será usado para calcular os custos na página de insumos e em outras funcionalidades do sistema.
                    </p>
                  </div>
                )}
              </div>
            )}

            {fornecedores.length === 0 && (
              <div className="text-center p-6 border border-dashed rounded-lg bg-muted/20">
                <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-2">Nenhum fornecedor cadastrado</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Você precisa criar pelo menos um fornecedor antes de continuar.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleNovoFornecedor}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Fornecedor
                </Button>
              </div>
            )}
          </div>
        );


      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-8">
        {/* Stepper */}
        <Stepper steps={steps} currentStep={currentStep} />

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 0 ? onCancel : handlePrevious}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {currentStep === 0 ? "Cancelar" : "Anterior"}
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? "Salvando..." : insumo ? "Atualizar Insumo" : "Criar Insumo"}
            </Button>
          )}
        </div>
      </div>

      {/* Modal de criação rápida de categoria */}
      <CategoriaModal
        open={categoriaModalOpen}
        onOpenChange={setCategoriaModalOpen}
        compact={true}
        onCategoriaCreated={handleCategoriaCreated}
      />

      {/* Modal de criação rápida de fornecedor */}
      <FornecedorModal
        open={fornecedorModalOpen}
        onOpenChange={setFornecedorModalOpen}
        onFornecedorCreated={handleFornecedorCreated}
      />

      {/* Modal de gerenciamento de fornecedor do insumo */}
      <InsumoSupplierModal
        open={supplierModalOpen}
        onOpenChange={setSupplierModalOpen}
        onSave={handleSupplierSave}
        editingSupplier={editingSupplier}
        excludedSupplierIds={insumoSuppliers.filter(s => s.id !== editingSupplier?.id).map(s => s.fornecedorId)}
      />
    </Form>
  );
};

