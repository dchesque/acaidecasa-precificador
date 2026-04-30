"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

type ConfirmOptions = {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

type DialogState = {
  open: boolean;
  options: ConfirmOptions;
  resolve: ((value: boolean) => void) | null;
};

const INITIAL_STATE: DialogState = {
  open: false,
  options: { description: "" },
  resolve: null,
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>(INITIAL_STATE);

  const confirm = useCallback<ConfirmFn>((input) => {
    const options: ConfirmOptions =
      typeof input === "string" ? { description: input } : input;
    return new Promise<boolean>((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      state.resolve?.(false);
      setState(INITIAL_STATE);
    }
  };

  const handleConfirm = () => {
    state.resolve?.(true);
    setState(INITIAL_STATE);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={state.open}
        onOpenChange={handleOpenChange}
        title={state.options.title ?? "Confirmar ação"}
        description={state.options.description}
        confirmLabel={state.options.confirmLabel}
        cancelLabel={state.options.cancelLabel}
        destructive={state.options.destructive}
        onConfirm={handleConfirm}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within <ConfirmProvider>");
  }
  return ctx;
}
