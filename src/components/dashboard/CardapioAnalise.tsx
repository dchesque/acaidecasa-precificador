import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { TopProduto, ProdutoMargem } from "@/utils/dashboardCalculations";
import { formatarMoeda, formatarPercentual } from "@/utils/calculosFinanceiros";

interface CardapioAnaliseProps {
  maisVendidos: TopProduto[];
  menosVendidos: TopProduto[];
  maioresMargens: ProdutoMargem[];
  menoresMargens: ProdutoMargem[];
  loading?: boolean;
}

export const CardapioAnalise = ({
  maisVendidos,
  menosVendidos,
  maioresMargens,
  menoresMargens,
  loading = false
}: CardapioAnaliseProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="animate-pulse">Carregando...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 animate-pulse">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Mais Vendidos */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Mais Vendidos (7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {maisVendidos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">-</div>
              <p className="text-sm">Nenhuma venda registrada nos últimos 7 dias</p>
            </div>
          ) : (
            maisVendidos.map((produto, index) => (
              <div key={produto.id} className={index === 0 ? 'bg-green-50 rounded-lg p-3 border border-green-200' : 'p-2'}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={index === 0 ? "default" : "outline"} className={index === 0 ? "bg-green-600" : ""}>
                      #{index + 1}
                    </Badge>
                    <span className="font-medium text-sm truncate">{produto.nome}</span>
                  </div>
                  <span className="text-sm font-semibold text-green-700">
                    {produto.quantidade} un.
                  </span>
                </div>
                <Progress
                  value={produto.percentualDoMax}
                  className="h-2"
                  // @ts-ignore
                  indicatorClassName="bg-gradient-to-r from-green-400 to-green-600"
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Menos Vendidos */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Menos Vendidos (7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {menosVendidos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">-</div>
              <p className="text-sm">Todos os produtos têm vendas balanceadas</p>
            </div>
          ) : (
            menosVendidos.map((produto, index) => (
              <div
                key={produto.id}
                className={`p-2 rounded ${produto.quantidade < 3 ? 'bg-red-50 border border-red-200' : produto.quantidade < 5 ? 'bg-orange-50 border border-orange-200' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm font-medium">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-sm truncate">{produto.nome}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {produto.quantidade < 3 && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-semibold ${produto.quantidade < 3 ? 'text-red-700' : 'text-orange-700'}`}>
                      {produto.quantidade} un.
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {produto.quantidade < 3 ? 'Vendas críticas' : produto.quantidade < 5 ? 'Baixo volume' : 'Volume limitado'}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Maiores Margens */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Maiores Margens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {maioresMargens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">$</div>
              <p className="text-sm">Nenhum produto cadastrado</p>
            </div>
          ) : (
            maioresMargens.map((produto, index) => (
              <div key={produto.id} className={produto.isPremium ? 'bg-amber-50 rounded-lg p-3 border border-amber-200' : 'p-2'}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-gray-500 text-sm font-medium">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-sm truncate">{produto.nome}</span>
                    {produto.isPremium && (
                      <Badge className="bg-amber-500 text-white text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <span className="text-lg font-bold text-green-700">
                    {formatarPercentual(produto.margem)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>Preço: {formatarMoeda(produto.preco)}</span>
                  <span>Custo: {formatarMoeda(produto.custo)}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Menores Margens */}
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Menores Margens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {menoresMargens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">OK</div>
              <p className="text-sm">Todos os produtos têm margem saudável</p>
            </div>
          ) : (
            menoresMargens.map((produto, index) => (
              <div
                key={produto.id}
                className={`p-2 rounded ${produto.margem < 20 ? 'bg-red-50 border border-red-200' : produto.margem < 30 ? 'bg-yellow-50 border border-yellow-200' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-gray-500 text-sm font-medium">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-sm truncate">{produto.nome}</span>
                    {produto.margem < 25 && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <span className={`text-lg font-bold ${produto.margem < 20 ? 'text-red-700' : produto.margem < 30 ? 'text-yellow-700' : 'text-gray-700'}`}>
                    {formatarPercentual(produto.margem)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>Preço: {formatarMoeda(produto.preco)}</span>
                  <span>Custo: {formatarMoeda(produto.custo)}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
