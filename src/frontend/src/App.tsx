import { Layout } from "@/components/Layout";
import { UnitSystemProvider } from "@/lib/units";
import { CalculatorsPage } from "@/pages/CalculatorsPage";
import { ConverterPage } from "@/pages/ConverterPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { MaterialsPage } from "@/pages/MaterialsPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const converterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ConverterPage,
});

const calculatorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/calculators",
  validateSearch: (search: Record<string, unknown>): { material?: string } => ({
    material: typeof search.material === "string" ? search.material : undefined,
  }),
  component: CalculatorsPage,
});

const materialsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/materials",
  component: MaterialsPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryPage,
});

const routeTree = rootRoute.addChildren([
  converterRoute,
  calculatorsRoute,
  materialsRoute,
  historyRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <UnitSystemProvider>
      <RouterProvider router={router} />
    </UnitSystemProvider>
  );
}
