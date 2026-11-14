import { useContext } from "react";
import { BankContext } from "../states/BankContext.js";

export function useBank() {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error("useBank debe usarse dentro de <BankProvider>");
  return ctx;
}
