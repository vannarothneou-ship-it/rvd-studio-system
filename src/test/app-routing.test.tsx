import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
    });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    expect(router.matchRoutes("/studio").at(-1)?.routeId).toBe("/studio");
    expect(router.matchRoutes("/work").at(-1)?.routeId).toBe("/work");
    expect(router.matchRoutes("/personal").at(-1)?.routeId).toBe("/personal");
    expect(router.matchRoutes("/finance").at(-1)?.routeId).toBe("/finance");
    expect(router.matchRoutes("/clients").at(-1)?.routeId).toBe("/clients");
    expect(router.matchRoutes("/projects").at(-1)?.routeId).toBe("/projects");
    expect(router.matchRoutes("/invoices").at(-1)?.routeId).toBe("/invoices");
    expect(router.matchRoutes("/invoices/new").at(-1)?.routeId).toBe(
      "/invoices/$id",
    );
    expect(router.matchRoutes("/services").at(-1)?.routeId).toBe("/services");
    expect(router.matchRoutes("/settings").at(-1)?.routeId).toBe("/settings");
    expect(router.matchRoutes("/print/sample-id").at(-1)?.routeId).toBe(
      "/print/$id",
    );
  });
});
