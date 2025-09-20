"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Layout } from "@/components/layout/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, Save, Camera, Lock, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAppContext } from "@/contexts/AppContext"
import { UserFormData, PasswordFormData } from "@/types/user"

// Validation schemas
const userFormSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z.string().optional()
})


const passwordFormSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
  novaSenha: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string().min(1, "Confirmação de senha é obrigatória")
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"]
})

const MinhaConta = () => {
  const { userProfile, updateUserProfile, updateUserAvatar } = useAppContext()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // User form
  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      nome: "",
      telefone: ""
    }
  })


  // Update form values when userProfile changes
  useEffect(() => {
    if (userProfile) {
      userForm.reset({
        nome: userProfile.nome || "",
        telefone: userProfile.telefone || ""
      })
    }
  }, [userProfile, userForm])

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      senhaAtual: "",
      novaSenha: "",
      confirmarSenha: ""
    }
  })

  // Get user initials for avatar fallback
  const getUserInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  // Handle avatar upload
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem')
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        setAvatarPreview(base64)
        updateUserAvatar(base64)
        toast.success('Avatar atualizado com sucesso!')
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle user data save
  const handleUserSave = async (data: UserFormData) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      updateUserProfile({
        nome: data.nome,
        telefone: data.telefone
      })
      toast.success('Dados pessoais atualizados com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar dados pessoais')
    } finally {
      setIsLoading(false)
    }
  }


  // Handle password change
  const handlePasswordChange = async (data: PasswordFormData) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      // TODO: Implement Supabase password change
      passwordForm.reset()
      toast.success('Senha alterada com sucesso!')
    } catch (error) {
      toast.error('Erro ao alterar senha')
    } finally {
      setIsLoading(false)
    }
  }

  if (!userProfile) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white/20">
                <AvatarImage src={avatarPreview || userProfile.avatar || undefined} />
                <AvatarFallback className="bg-white/20 text-white text-2xl font-semibold">
                  {getUserInitials(userProfile.nome)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-white text-gray-700 hover:bg-gray-100"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{userProfile.nome}</h1>
              <p className="text-white/90 text-lg">{userProfile.email}</p>
              <p className="text-white/70 text-sm mt-1">
                Última atualização: {userProfile.updatedAt.toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>
              Gerencie suas informações pessoais de contato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={userForm.handleSubmit(handleUserSave)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">
                    <User className="inline h-4 w-4 mr-2" />
                    Nome Completo
                  </Label>
                  <Input
                    id="nome"
                    {...userForm.register("nome")}
                    placeholder="Seu nome completo"
                  />
                  {userForm.formState.errors.nome && (
                    <p className="text-sm text-red-600">{userForm.formState.errors.nome.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">O email não pode ser alterado</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Telefone/WhatsApp
                  </Label>
                  <Input
                    id="telefone"
                    {...userForm.register("telefone")}
                    placeholder="(11) 99999-9999"
                  />
                  {userForm.formState.errors.telefone && (
                    <p className="text-sm text-red-600">{userForm.formState.errors.telefone.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading || !userForm.formState.isDirty}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Altere sua senha para manter sua conta segura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senhaAtual">
                    <Lock className="inline h-4 w-4 mr-2" />
                    Senha Atual
                  </Label>
                  <Input
                    id="senhaAtual"
                    type="password"
                    {...passwordForm.register("senhaAtual")}
                    placeholder="Digite sua senha atual"
                  />
                  {passwordForm.formState.errors.senhaAtual && (
                    <p className="text-sm text-red-600">{passwordForm.formState.errors.senhaAtual.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="novaSenha">Nova Senha</Label>
                    <Input
                      id="novaSenha"
                      type="password"
                      {...passwordForm.register("novaSenha")}
                      placeholder="Digite sua nova senha"
                    />
                    {passwordForm.formState.errors.novaSenha && (
                      <p className="text-sm text-red-600">{passwordForm.formState.errors.novaSenha.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmarSenha"
                      type="password"
                      {...passwordForm.register("confirmarSenha")}
                      placeholder="Confirme sua nova senha"
                    />
                    {passwordForm.formState.errors.confirmarSenha && (
                      <p className="text-sm text-red-600">{passwordForm.formState.errors.confirmarSenha.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Última atualização: {userProfile.updatedAt.toLocaleDateString('pt-BR')}
                </p>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Alterar Senha
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default MinhaConta