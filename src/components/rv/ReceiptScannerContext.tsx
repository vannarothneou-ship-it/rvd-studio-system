import {
  Suspense,
  createContext,
  lazy,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Account } from "@/lib/store";

interface ScannerContextValue {
  openScanner: (defaultAccount?: Account) => void;
}

export const ScannerContext = createContext<ScannerContextValue>({
  openScanner: () => {},
});

export function useReceiptScanner() {
  return useContext(ScannerContext);
}

const LazyReceiptScannerDrawer = lazy(() =>
  import("@/components/rv/ReceiptScanner").then((m) => ({
    default: m.ReceiptScannerDrawer,
  })),
);

export function ReceiptScannerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [defaultAccount, setDefaultAccount] = useState<Account>("Personal");

  const openScanner = useCallback((acct: Account = "Personal") => {
    setDefaultAccount(acct);
    setHasOpened(true);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openScanner }), [openScanner]);

  return (
    <ScannerContext.Provider value={value}>
      {children}
      {hasOpened && (
        <Suspense fallback={null}>
          <LazyReceiptScannerDrawer
            open={open}
            defaultAccount={defaultAccount}
            onClose={() => setOpen(false)}
          />
        </Suspense>
      )}
    </ScannerContext.Provider>
  );
}
