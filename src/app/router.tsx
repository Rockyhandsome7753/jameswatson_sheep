/**
 * Tiny dependency-free router.
 *
 * Uses `window.location.hash` so the app works when served from any static
 * path (no server rewrites needed). Exposes just enough surface for the shell:
 *   - <Router>          subscribes to hash changes, renders the active route
 *   - useRoute()        current path, e.g. "/board"
 *   - useNavigate()     imperative navigation
 *   - <NavLink>         anchor with active-state class
 *
 * Part 2 can swap this for react-router without touching component markup:
 * <NavLink to activeClassName> mirrors react-router's API.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";

interface RouterValue {
  path: string;
  navigate: (to: string) => void;
  /** Go back one entry in history, falling back to `fallback`. */
  goBack: (fallback?: string) => void;
}

const RouterContext = createContext<RouterValue>({
  path: "/",
  navigate: () => {},
  goBack: () => {},
});

function readHash(): string {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw || raw === "/") return "/";
  return raw.startsWith("/") ? raw : `/${raw}`;
}

export function Router({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(() =>
    typeof window === "undefined" ? "/" : readHash(),
  );

  useEffect(() => {
    const onChange = () => setPath(readHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    const next = to.startsWith("/") ? to : `/${to}`;
    if (readHash() === next) return;
    window.location.hash = next;
  }, []);

  const goBack = useCallback(
    (fallback = "/") => {
      // `history.length > 1` is unreliable, so use the hash we arrived from.
      if (window.history.length > 1) {
        window.history.back();
        // If the hash never changes (no prior entry), fall back explicitly.
        window.setTimeout(() => {
          if (readHash() === window.location.hash.replace(/^#/, "")) {
            window.location.hash = fallback;
          }
        }, 120);
      } else {
        window.location.hash = fallback;
      }
    },
    [],
  );

  const value = useMemo(
    () => ({ path, navigate, goBack }),
    [path, navigate, goBack],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRoute(): string {
  return useContext(RouterContext).path;
}

export function useNavigate(): (to: string) => void {
  return useContext(RouterContext).navigate;
}

export function useGoBack(): (fallback?: string) => void {
  return useContext(RouterContext).goBack;
}

export interface NavLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  className?: string;
  activeClassName?: string;
  /** Match the exact path only (used for the index route). */
  end?: boolean;
  children: ReactNode;
}

export function NavLink({
  to,
  className = "",
  activeClassName = "is-active",
  end = false,
  children,
  onClick,
  ...rest
}: NavLinkProps) {
  const path = useRoute();
  const navigate = useNavigate();

  const isActive = end
    ? path === to
    : path === to || path.startsWith(`${to}/`);

  const classes = [className, isActive ? activeClassName : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <a
      href={`#${to}`}
      className={classes}
      aria-current={isActive ? "page" : undefined}
      onClick={(e) => {
        // Let modified clicks open a new tab naturally.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(to);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
