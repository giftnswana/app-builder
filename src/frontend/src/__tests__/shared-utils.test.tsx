import "@testing-library/jest-dom/vitest";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

/**
 * Characterization of shared, non-landing-page infrastructure that the
 * engineering toolkit shell will keep depending on: the responsive breakpoint
 * hook (mobile-first is a core requirement) and the class-merge helper used by
 * every UI primitive.
 */

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
}

describe("cn class-merge helper", () => {
  it("joins truthy class names and drops falsy ones", () => {
    expect(cn("a", "b")).toBe("a b");
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("lets later Tailwind utilities win over earlier conflicting ones", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("keeps non-conflicting utilities from both sides", () => {
    expect(cn("flex", "items-center", "gap-2")).toBe("flex items-center gap-2");
  });
});

describe("useIsMobile responsive hook", () => {
  afterEach(() => {
    setViewportWidth(1024);
  });

  it("reports mobile below the default 768px breakpoint", () => {
    setViewportWidth(375);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("reports desktop at or above the default breakpoint", () => {
    setViewportWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("updates when the viewport crosses the breakpoint", () => {
    setViewportWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      setViewportWidth(375);
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(true);

    act(() => {
      setViewportWidth(1024);
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(false);
  });

  it("honors a custom breakpoint", () => {
    setViewportWidth(900);
    const { result } = renderHook(() => useIsMobile(1200));
    expect(result.current).toBe(true);
  });
});
