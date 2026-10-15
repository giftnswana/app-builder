import { createActor } from "@/backend";
import type { Material, SavedCalculation, ValueEntry } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const CALCULATIONS_QUERY_KEY = ["calculations"] as const;
export const MATERIALS_QUERY_KEY = ["materials"] as const;

/** All saved calculation results, newest first. */
export function useCalculations() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SavedCalculation[]>({
    queryKey: CALCULATIONS_QUERY_KEY,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCalculations();
    },
    enabled: !!actor && !isFetching,
  });
}

/** The material library used by the Materials screen and calculators. */
export function useMaterials() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Material[]>({
    queryKey: MATERIALS_QUERY_KEY,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMaterials();
    },
    enabled: !!actor && !isFetching,
  });
}

export type SaveCalculationInput = {
  calculator: string;
  inputs: ValueEntry[];
  outputs: ValueEntry[];
};

/** Persist a calculation result so it appears in the History screen. */
export function useSaveCalculation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      calculator,
      inputs,
      outputs,
    }: SaveCalculationInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveCalculation(calculator, inputs, outputs);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CALCULATIONS_QUERY_KEY });
    },
  });
}

/** Remove a saved calculation by id. */
export function useDeleteCalculation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteCalculation(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CALCULATIONS_QUERY_KEY });
    },
  });
}
