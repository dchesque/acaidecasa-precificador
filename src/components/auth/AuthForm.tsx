"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2, Shield, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  rememberMe: z.boolean().default(false)
})

const signupSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
})

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido")
})

type LoginForm = z.infer<typeof loginSchema>
type SignupForm = z.infer<typeof signupSchema>
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

interface AuthFormProps {
  mode?: "login" | "signup" | "forgot-password"
  onLogin?: (data: LoginForm) => Promise<void>
  onSignup?: (data: SignupForm) => Promise<void>
  onForgotPassword?: (data: ForgotPasswordForm) => Promise<void>
  isLoading?: boolean
}

export function AuthForm({
  mode = "login",
  onLogin,
  onSignup,
  onForgotPassword,
  isLoading = false
}: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  })

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  })

  const forgotPasswordForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  })

  const handleLogin = async (data: LoginForm) => {
    try {
      await onLogin?.(data)
      toast.success("Login realizado com sucesso!")
    } catch (error) {
      toast.error("Erro ao fazer login. Verifique suas credenciais.")
    }
  }

  const handleSignup = async (data: SignupForm) => {
    try {
      await onSignup?.(data)
      toast.success("Conta criada com sucesso! Verifique seu email.")
    } catch (error) {
      toast.error("Erro ao criar conta.")
    }
  }

  const handleForgotPassword = async (data: ForgotPasswordForm) => {
    try {
      await onForgotPassword?.(data)
      toast.success("Email de recuperação enviado!")
    } catch (error) {
      toast.error("Erro ao enviar email de recuperação.")
    }
  }

  if (mode === "forgot-password") {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex flex-col justify-center items-center h-full px-12 text-white w-full">
            <div className="w-full max-w-md text-center">
              <div className="mb-8">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl font-bold">AC</span>
                </div>
                <h1 className="text-4xl font-bold mb-2">AçaíDeCasa Precificador</h1>
                <p className="text-purple-100 text-lg">Recupere o acesso à sua conta</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <Card className="w-full max-w-md bg-white border-slate-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-slate-900 text-2xl">Recuperar Senha</CardTitle>
              <CardDescription className="text-slate-600">
                Digite seu email para receber instruções de recuperação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-500"
                      {...forgotPasswordForm.register("email")}
                    />
                  </div>
                  {forgotPasswordForm.formState.errors.email && (
                    <p className="text-red-500 text-sm">{forgotPasswordForm.formState.errors.email.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar Email de Recuperação"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-center">
              <p className="text-slate-600 text-sm">
                Lembrou da senha?{" "}
                <a href="/auth/login" className="text-purple-600 hover:text-purple-700 font-medium">
                  Voltar ao login
                </a>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full px-12 text-white w-full">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl font-bold">AC</span>
              </div>
              <h1 className="text-4xl font-bold mb-2">AçaíDeCasa Precificador</h1>
              <p className="text-purple-100 text-lg">Gestão inteligente para seu negócio</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <TrendingUp className="h-6 w-6 mb-2" />
                <h3 className="font-semibold text-sm">Cálculo Automático</h3>
                <p className="text-purple-100 text-xs">Precificação inteligente</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Users className="h-6 w-6 mb-2" />
                <h3 className="font-semibold text-sm">Gestão de Fornecedores</h3>
                <p className="text-purple-100 text-xs">Controle completo</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Shield className="h-6 w-6 mb-2" />
                <h3 className="font-semibold text-sm">100% Seguro</h3>
                <p className="text-purple-100 text-xs">Dados protegidos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <CheckCircle2 className="h-6 w-6 mb-2" />
                <h3 className="font-semibold text-sm">Análise de Margem</h3>
                <p className="text-purple-100 text-xs">Maximize lucros</p>
              </div>
            </div>

            {/* Stats */}
            <div className="border-t border-white/20 pt-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">150+</div>
                  <div className="text-purple-100 text-sm">Produtos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-purple-100 text-sm">Receitas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">25%</div>
                  <div className="text-purple-100 text-sm">Economia</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">AC</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">AçaíDeCasa</h1>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 border-slate-200">
              <TabsTrigger value="login" className="text-slate-600 data-[state=active]:text-slate-900 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-slate-600 data-[state=active]:text-slate-900 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Criar conta
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900">Acesse sua conta</CardTitle>
                  <CardDescription className="text-slate-600">
                    Digite suas credenciais para acessar o sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-slate-700">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-500"
                          {...loginForm.register("email")}
                        />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="text-red-500 text-sm">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-slate-700">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-500"
                          {...loginForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-red-500 text-sm">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          className="border-slate-300"
                          {...loginForm.register("rememberMe")}
                        />
                        <Label htmlFor="rememberMe" className="text-slate-600 text-sm">
                          Lembrar-me
                        </Label>
                      </div>
                      <a
                        href="/auth/forgot-password"
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        Esqueci a senha
                      </a>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
                      disabled={isLoading}
                    >
                      {isLoading ? "Entrando..." : "Entrar"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="text-center">
                  <p className="text-slate-500 text-xs">
                    Ao continuar, você concorda com nossos{" "}
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                      Termos de Uso
                    </a>{" "}
                    e{" "}
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                      Política de Privacidade
                    </a>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900">Criar nova conta</CardTitle>
                  <CardDescription className="text-slate-600">
                    Preencha os dados para criar sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-slate-700">Nome completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Seu nome"
                          className="pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-500"
                          {...signupForm.register("name")}
                        />
                      </div>
                      {signupForm.formState.errors.name && (
                        <p className="text-red-500 text-sm">{signupForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-slate-700">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-500"
                          {...signupForm.register("email")}
                        />
                      </div>
                      {signupForm.formState.errors.email && (
                        <p className="text-red-500 text-sm">{signupForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-slate-700">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-500"
                          {...signupForm.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {signupForm.formState.errors.password && (
                        <p className="text-red-500 text-sm">{signupForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirmPassword" className="text-slate-700">Confirmar senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="signup-confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-500"
                          {...signupForm.register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {signupForm.formState.errors.confirmPassword && (
                        <p className="text-red-500 text-sm">{signupForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
                      disabled={isLoading}
                    >
                      {isLoading ? "Criando conta..." : "Criar conta"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="text-center">
                  <p className="text-slate-500 text-xs">
                    Ao criar uma conta, você concorda com nossos{" "}
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                      Termos de Uso
                    </a>{" "}
                    e{" "}
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                      Política de Privacidade
                    </a>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}