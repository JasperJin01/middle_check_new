import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: '课题一', title: 'FPGA芯片性能演示', href: paths.dashboard.part1, icon: 'chart-pie' },
  { key: '课题二', title: '软硬一体模拟器演示', href: paths.dashboard.part2, icon: 'plugs-connected' },
  { key: '课题三', title: '真实场景分布式图计算', href: paths.dashboard.part3, icon: 'gear-six' },
  
] satisfies NavItemConfig[];
