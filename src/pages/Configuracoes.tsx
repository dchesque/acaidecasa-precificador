"use client"
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Store, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/AppContext";

// Validation schemas
const empresaSchema = z.object({
  nome: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  endereco: z.string().optional()
});

const precificacaoSchema = z.object({
  metaMargem: z.number().min(0, "Meta de margem deve ser positiva").max(100, "Meta de margem não pode exceder 100%")
});

// Types for form data
type EmpresaFormData = z.infer<typeof empresaSchema>;
type PrecificacaoFormData = z.infer<typeof precificacaoSchema>;

// Combined configuration type for Supabase
interface ConfiguracaoCompleta {
  // Empresa data
  nomeEmpresa: string;
  cnpj?: string;
  telefoneEmpresa?: string;
  emailEmpresa?: string;
  enderecoEmpresa?: string;
  // Precificação data
  metaMargemPadrao: number;
  // Metadata
  userId: string;
  updatedAt: Date;
}

const Configuracoes = () => {
  const { userProfile, configuracao } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  // Form for empresa data
  const empresaForm = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome: "",
      cnpj: "",
      telefone: "",
      email: "",
      endereco: ""
    }
  });

  // Form for pricing configuration
  const precificacaoForm = useForm<PrecificacaoFormData>({
    resolver: zodResolver(precificacaoSchema),
    defaultValues: {
      metaMargem: 30
    }
  });

  // Load existing data when component mounts
  useEffect(() => {
    if (userProfile?.empresa) {
      empresaForm.reset({
        nome: userProfile.empresa.nome || "",
        cnpj: "", // Will come from separate config
        telefone: userProfile.empresa.telefone || "",
        email: "", // Will come from separate config
        endereco: userProfile.empresa.endereco || ""
      });
    }

    if (configuracao) {
      precificacaoForm.reset({
        metaMargem: configuracao.markupPadrao || 30
      });
    }
  }, [userProfile, configuracao, empresaForm, precificacaoForm]);

  // Handle empresa form submission
  const handleEmpresaSave = async (data: EmpresaFormData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

      // TODO: Implement Supabase update
      // await supabase
      //   .from('configuracoes')
      //   .upsert({
      //     user_id: userProfile?.id,
      //     nome_empresa: data.nome,
      //     cnpj: data.cnpj,
      //     telefone_empresa: data.telefone,
      //     email_empresa: data.email,
      //     endereco_empresa: data.endereco,
      //     updated_at: new Date().toISOString()
      //   })

      // For now, update user profile context
      // updateUserProfile({
      //   empresa: {
      //     ...userProfile?.empresa,
      //     nome: data.nome,
      //     telefone: data.telefone,
      //     endereco: data.endereco
      //   }
      // });

      toast.success('Dados da empresa atualizados com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar dados da empresa');
      console.error('Error saving empresa data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pricing configuration submission
  const handlePrecificacaoSave = async (data: PrecificacaoFormData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

      // TODO: Implement Supabase update
      // await supabase
      //   .from('configuracoes')
      //   .upsert({
      //     user_id: userProfile?.id,
      //     meta_margem_padrao: data.metaMargem,
      //     updated_at: new Date().toISOString()
      //   })

      // For now, update configuration context
      // updateConfiguracao({
      //   ...configuracao,
      //   markupPadrao: data.metaMargem
      // });

      toast.success('Meta de margem atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações de precificação');
      console.error('Error saving pricing config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Combined save function for all configurations
  const handleSaveAll = async () => {
    const empresaData = empresaForm.getValues();
    const precificacaoData = precificacaoForm.getValues();

    // Validate both forms
    const empresaIsValid = await empresaForm.trigger();
    const precificacaoIsValid = await precificacaoForm.trigger();

    if (!empresaIsValid || !precificacaoIsValid) {
      toast.error('Por favor, corrija os erros nos formulários');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      // TODO: Implement complete Supabase update
      const configCompleta: Omit<ConfiguracaoCompleta, 'userId'> = {
        nomeEmpresa: empresaData.nome,
        cnpj: empresaData.cnpj,
        telefoneEmpresa: empresaData.telefone,
        emailEmpresa: empresaData.email,
        enderecoEmpresa: empresaData.endereco,
        metaMargemPadrao: precificacaoData.metaMargem,
        updatedAt: new Date()
      };

      // await supabase
      //   .from('configuracoes')
      //   .upsert({
      //     ...configCompleta,
      //     user_id: userProfile?.id,
      //     updated_at: configCompleta.updatedAt.toISOString()
      //   })

      toast.success('Todas as configurações foram salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
      console.error('Error saving all configurations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Configure as informações básicas do seu negócio e parâmetros de precificação
          </p>
        </div>

        <div className="grid gap-6">
          {/* Dados da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>
                Informações básicas sobre seu negócio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={empresaForm.handleSubmit(handleEmpresaSave)} className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome-empresa">Nome da Empresa</Label>
                    <Input
                      id="nome-empresa"
                      {...empresaForm.register("nome")}
                      placeholder="Açaí Premium"
                    />
                    {empresaForm.formState.errors.nome && (
                      <p className="text-sm text-red-600">{empresaForm.formState.errors.nome.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      {...empresaForm.register("cnpj")}
                      placeholder="00.000.000/0000-00"
                    />
                    {empresaForm.formState.errors.cnpj && (
                      <p className="text-sm text-red-600">{empresaForm.formState.errors.cnpj.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      {...empresaForm.register("telefone")}
                      placeholder="(11) 99999-9999"
                    />
                    {empresaForm.formState.errors.telefone && (
                      <p className="text-sm text-red-600">{empresaForm.formState.errors.telefone.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      {...empresaForm.register("email")}
                      placeholder="contato@acaipremium.com"
                    />
                    {empresaForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{empresaForm.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    {...empresaForm.register("endereco")}
                    placeholder="Rua das Palmeiras, 123 - Centro"
                  />
                  {empresaForm.formState.errors.endereco && (
                    <p className="text-sm text-red-600">{empresaForm.formState.errors.endereco.message}</p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Configurações de Precificação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Parâmetros de Precificação
              </CardTitle>
              <CardDescription>
                Configure a meta de margem para validação no cardápio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={precificacaoForm.handleSubmit(handlePrecificacaoSave)} className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meta-margem">
                    Meta de Margem (%)
                  </Label>
                  <Input
                    id="meta-margem"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    {...precificacaoForm.register("metaMargem", { valueAsNumber: true })}
                    placeholder="30"
                    className="max-w-xs"
                  />
                  {precificacaoForm.formState.errors.metaMargem && (
                    <p className="text-sm text-red-600">{precificacaoForm.formState.errors.metaMargem.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Esta margem será usada para validar se os produtos no cardápio estão atingindo a meta
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveAll}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Configuracoes;