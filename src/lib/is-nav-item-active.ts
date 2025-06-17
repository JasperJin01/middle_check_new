import type { NavItemConfig } from '@/types/nav';

export function isNavItemActive({
  pathname,
  href,
}: { pathname: string; href: string }): boolean {
  return pathname === href;
}
