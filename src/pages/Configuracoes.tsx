import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Store, DollarSign, Percent } from "lucide-react";

const Configuracoes = () => {
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
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome-empresa">Nome da Empresa</Label>
                  <Input id="nome-empresa" placeholder="Açaí Premium" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" placeholder="00.000.000/0000-00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="contato@acaipremium.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" placeholder="Rua das Palmeiras, 123 - Centro" />
              </div>
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
                Configure as margens e custos padrão
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="margem-lucro">Margem de Lucro (%)</Label>
                  <Input id="margem-lucro" type="number" placeholder="30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custo-fixo">Custo Fixo por Produto (R$)</Label>
                  <Input id="custo-fixo" type="number" step="0.01" placeholder="2.50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxa-cartao">Taxa Cartão (%)</Label>
                  <Input id="taxa-cartao" type="number" step="0.01" placeholder="3.5" />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custo-energia">Custo Energia/Hora (R$)</Label>
                  <Input id="custo-energia" type="number" step="0.01" placeholder="0.75" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custo-mao-obra">Custo Mão de Obra/Hora (R$)</Label>
                  <Input id="custo-mao-obra" type="number" step="0.01" placeholder="15.00" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações Avançadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Configurações Avançadas
              </CardTitle>
              <CardDescription>
                Ajustes adicionais para cálculos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="incluir-impostos">Incluir Impostos no Cálculo</Label>
                  <p className="text-sm text-muted-foreground">
                    Adiciona automaticamente os impostos ao preço final
                  </p>
                </div>
                <Switch id="incluir-impostos" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="arredondar-precos">Arredondar Preços</Label>
                  <p className="text-sm text-muted-foreground">
                    Arredonda os preços para valores "redondos" (ex: R$ 12,90)
                  </p>
                </div>
                <Switch id="arredondar-precos" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notificacoes">Notificações de Estoque</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas quando o estoque estiver baixo
                  </p>
                </div>
                <Switch id="notificacoes" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Configuracoes;