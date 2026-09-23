"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { accountFirstName, accountLabel, accountLinks, accountRoleLabel, type NavbarAccount } from "@/lib/account-menu";

type IconName = "dashboard" | "user" | "external" | "settings" | "store" | "logout" | "chevron";
function AccountIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></>,
    external: <><path d="M14 3h7v7M21 3l-9 9M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" /></>,
    settings: <><path d="m9 3-.6 2.2-2 .9-2-.6L2 10l1.7 1.5v2L2 15l2.4 4.5 2-.6 2 .9L9 22h6l.6-2.2 2-.9 2 .6L22 15l-1.7-1.5v-2L22 10l-2.4-4.5-2 .6-2-.9L15 3Z" /><circle cx="12" cy="12.5" r="3" /></>,
    store: <><path d="M3 10 5 3h14l2 7M4 13v8h16v-8M9 21v-6h6v6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M10 12h11m-4-4 4 4-4 4" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
  };
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
function AccountAvatar({ account }: { account: NavbarAccount }) {
  const [failed, setFailed] = useState<string | null>(null);
  const initial = accountFirstName(account).charAt(0).toLocaleUpperCase("es");
  return <span className="account-avatar" aria-hidden="true">
    {account.avatarUrl && failed !== account.avatarUrl
      ? <Image src={account.avatarUrl} width={44} height={44} sizes="44px" alt="" referrerPolicy="no-referrer" onError={() => setFailed(account.avatarUrl ?? null)} />
      : initial || <span className="account-avatar-monogram">TK</span>}
  </span>;
}
const linkIcons: Record<string, IconName> = {
  "/cuenta": "user", "/favoritos": "store",
  "/admin": "dashboard", "/admin/configuracion": "settings", "/servicios": "store",
  "/dashboard": "dashboard", "/dashboard/perfil": "user", "/dashboard/vista-publica": "external",
  "/dashboard/estadisticas": "dashboard", "/publicar": "store",
};

export function AccountControl() {
  const [account, setAccount] = useState<NavbarAccount | null>(null);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);
  const entryFocus = useRef(0);
  const pathname = usePathname();
  useEffect(() => {
    let active = true;
    let request: AbortController | undefined;
    const refresh = () => {
      request?.abort();
      request = new AbortController();
      fetch("/api/auth/session", { cache: "no-store", signal: request.signal })
        .then(r => r.ok ? r.json() : { account: null })
        .then(data => { if (active) { setAccount(data.account); setOpen(false); } })
        .catch(() => {});
    };
    refresh();
    const visible = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", visible);
    return () => {
      active = false; request?.abort();
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const items = menu.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]');
    if (items?.length) items[entryFocus.current < 0 ? items.length - 1 : 0].focus();
    const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  if (!account) return <Link href="/login" className="account-login">Iniciar sesión</Link>;
  return <div ref={root} className="account-control" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }} onKeyDown={e => {
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); trigger.current?.focus(); }
  }}>
    <button ref={trigger} type="button" className="account-trigger" aria-label={`${accountLabel(account)}, ${accountRoleLabel(account.role, account.hasProvider)}`} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? "account-links" : undefined} onClick={() => { entryFocus.current = 0; setOpen(!open); }} onKeyDown={e => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); entryFocus.current = e.key === "ArrowUp" ? -1 : 0; setOpen(true); }
    }}>
      <AccountAvatar account={account} />
      <span className="account-copy"><span className="account-name">{accountLabel(account)}</span><span className="account-role">{accountRoleLabel(account.role, account.hasProvider)}</span></span>
      <span className="account-chevron"><AccountIcon name="chevron" /></span>
    </button>
    {open && <div className="account-dropdown">
      <div className="account-summary">
        <AccountAvatar account={account} />
        <div className="account-summary-copy"><p className="account-summary-name">{accountFirstName(account) || "Mi cuenta"}</p><p className="account-role">{accountRoleLabel(account.role, account.hasProvider)}</p></div>
        {account.email && <p className="account-email">{account.email}</p>}
      </div>
      <nav ref={menu} id="account-links" role="menu" aria-label="Mi cuenta" onKeyDown={e => {
        const items = Array.from(e.currentTarget.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]'));
        const index = items.indexOf(document.activeElement as HTMLAnchorElement);
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
          e.preventDefault();
          const next = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : (index + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
          items[next]?.focus();
        }
      }}>
        {accountLinks(account.role, account.hasProvider, account.providerPublished).map(([label, href]) => <Link role="menuitem" tabIndex={-1} key={href} href={href} onClick={() => setOpen(false)}><AccountIcon name={linkIcons[href]} /><span>{label}</span></Link>)}
        <div className="account-menu-divider" role="separator" />
        <a role="menuitem" tabIndex={-1} href="/logout" className="account-logout"><AccountIcon name="logout" /><span>Cerrar sesión</span></a>
      </nav>
    </div>}
  </div>;
}
