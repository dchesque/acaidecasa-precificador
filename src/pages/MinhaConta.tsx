"use client"

import { useState } from "react"
import { Layout } from "@/components/layout/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, MapPin, Building, Calendar, Save, Camera, Lock, Bell, Shield } from "lucide-react"
import { toast } from "sonner"

const MinhaConta = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    nome: "Admin",
    email: "admin@acaidecasa.com",
    telefone: "(11) 99999-9999",
    endereco: "Rua das Açaizeiras, 123",
    cidade: "São Paulo",
    estado: "SP",
    cep: "12345-678",
    empresa: "Açaí De Casa",
    cargo: "Administrador",
    dataCadastro: "01/01/2024"
  })

  const handleSave = () => {
    toast.success("Informações atualizadas com sucesso!")
    setIsEditing(false)
  }

  const handlePasswordChange = () => {
    toast.success("Senha alterada com sucesso!")
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Minha Conta</h1>
            <p className="text-muted-foreground">Gerencie suas informações pessoais e configurações</p>
          </div>
        </div>

        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/avatar.jpg" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                    AD
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold">{userData.nome}</h2>
                <p className="text-muted-foreground">{userData.cargo} • {userData.empresa}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  Membro desde {userData.dataCadastro}
                </p>
              </div>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                ) : (
                  "Editar Perfil"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList>
            <TabsTrigger value="personal">Informações Pessoais</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome">
                      <User className="inline h-3 w-3 mr-1" />
                      Nome Completo
                    </Label>
                    <Input
                      id="nome"
                      value={userData.nome}
                      onChange={(e) => setUserData({...userData, nome: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="inline h-3 w-3 mr-1" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({...userData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">
                      <Phone className="inline h-3 w-3 mr-1" />
                      Telefone
                    </Label>
                    <Input
                      id="telefone"
                      value={userData.telefone}
                      onChange={(e) => setUserData({...userData, telefone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empresa">
                      <Building className="inline h-3 w-3 mr-1" />
                      Empresa
                    </Label>
                    <Input
                      id="empresa"
                      value={userData.empresa}
                      onChange={(e) => setUserData({...userData, empresa: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">
                    <MapPin className="inline h-3 w-3 mr-1" />
                    Endereço
                  </Label>
                  <Input
                    id="endereco"
                    value={userData.endereco}
                    onChange={(e) => setUserData({...userData, endereco: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={userData.cidade}
                      onChange={(e) => setUserData({...userData, cidade: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={userData.estado}
                      onChange={(e) => setUserData({...userData, estado: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={userData.cep}
                      onChange={(e) => setUserData({...userData, cep: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>
                  Gerencie sua senha e configurações de segurança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Alterar Senha</p>
                        <p className="text-sm text-muted-foreground">
                          Última alteração há 30 dias
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handlePasswordChange}>
                      Alterar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Autenticação de Dois Fatores</p>
                        <p className="text-sm text-muted-foreground">
                          Adicione uma camada extra de segurança
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Configurar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Configure suas preferências de notificação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Notificações por Email</p>
                        <p className="text-sm text-muted-foreground">
                          Receba atualizações importantes por email
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Ativado</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Alertas de Sistema</p>
                        <p className="text-sm text-muted-foreground">
                          Notificações sobre atualizações do sistema
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Ativado</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}

export default MinhaConta