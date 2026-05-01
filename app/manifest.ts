import type { MetadataRoute } from "next";

/**
 * PWA manifest. Next 15 generates `/manifest.webmanifest` from this file
 * automatically — no extra route or rewrite needed.
 *
 * Brand colors are kept in sync with `tailwind.config.ts` (purple-pink
 * gradient) and the icon used in the sidebar / mobile header.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Açaí de Casa - Precificador",
    short_name: "AçaíDeCasa",
    description:
      "Precificação inteligente para deliverys de açaí: insumos, receitas, combinados e análise de vendas.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0f172a", // slate-900, matches the sidebar
    theme_color: "#7c3aed", // purple-600, matches the brand gradient
    lang: "pt-BR",
    categories: ["business", "finance", "productivity", "food"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Cardápio",
        url: "/cardapio",
        description: "Editar preços e simular margens",
      },
      {
        name: "Análise de Vendas",
        url: "/analise-vendas",
        description: "Importar vendas e ver divergências",
      },
      {
        name: "Insumos",
        url: "/insumos",
        description: "Cadastrar insumos e fornecedores",
      },
    ],
  };
}
