import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: '课题一', title: '统一图计算加速芯片架构', href: paths.dashboard.part1, icon: 'chart-pie' },
  { key: '课题二', title: '图计算加速卡', href: paths.dashboard.part2, icon: 'users' },
  { key: '课题三', title: '图计算编程环境', href: paths.dashboard.part3, icon: 'plugs-connected' },
  { key: '课题四', title: '分布式图计算框架', href: paths.dashboard.part4, icon: 'gear-six' },
  { key: '课题五', title: '泛图计算典型应用', href: paths.dashboard.part5, icon: 'user' },
] satisfies NavItemConfig[];
