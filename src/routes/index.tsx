import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VIVA • Uma vida brasileira" },
      {
        name: "description",
        content:
          "Viva uma história brasileira. Escolhas, escola, carreira, relacionamentos e novos caminhos a cada ano.",
      },
      { property: "og:title", content: "VIVA • Uma vida brasileira" },
      {
        property: "og:description",
        content:
          "Viva uma história brasileira. Escolhas, escola, carreira, relacionamentos e novos caminhos a cada ano.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ href: "/simulador/index.html" });
  },
});
