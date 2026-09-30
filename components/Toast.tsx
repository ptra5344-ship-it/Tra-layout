"use client";
import { createContext, useCallback, useContext, useState, ReactNode } from "react";
type T = { id: number; msg: string; ok: boolean };
const Ctx = createContext<(msg: string, ok?: boolean) => void>(() => {});
export const useToast = () => useContext(Ctx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<T[]>([]);
  const push = useCallback((msg: string, ok = true) => {
    const id = Date.now() + Math.random();
    setList((l) => [...l, { id, msg, ok }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 3000);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {list.map((t) => <div key={t.id} className={`rounded-lg px-4 py-2 text-sm shadow-lg ${t.ok ? "bg-emerald-600" : "bg-red-600"}`}>{t.msg}</div>)}
      </div>
    </Ctx.Provider>
  );
}
