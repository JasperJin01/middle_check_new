'use client';

import * as React from 'react';
import { useState } from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';

import type { NavItemConfig } from '@/types/nav';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { Logo } from '@/components/core/logo';
import { CaretDown, CaretUp } from '@phosphor-icons/react';

import { navItems } from './config';

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        '--SideNav-background': 'var(--mui-palette-neutral-950)',
        '--SideNav-color': 'var(--mui-palette-common-white)',
        '--NavItem-color': 'var(--mui-palette-neutral-300)',
        '--NavItem-hover-background': 'rgba(255, 255, 255, 0.04)',
        '--NavItem-active-background': 'var(--mui-palette-primary-main)',
        '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
        '--NavItem-disabled-color': 'var(--mui-palette-neutral-500)',
        '--NavItem-icon-color': 'var(--mui-palette-neutral-400)',
        '--NavItem-icon-active-color': 'var(--mui-palette-primary-contrastText)',
        '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-600)',
        bgcolor: 'var(--SideNav-background)',
        color: 'var(--SideNav-color)',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'row',
        height: 'var(--SideNav-height)',
        left: 0,
        right: 0,
        maxWidth: '100%',
        position: 'fixed',
        scrollbarWidth: 'none',
        top: 0,
        zIndex: 'var(--SideNav-zIndex)',
        '&::-webkit-scrollbar': { display: 'none' },
        alignItems: 'center',
        px: 3,
      }}
    >
      {/* 左侧项目信息 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: '300px' }}>
        <Logo color="light" height={32} width={32} />
        <Box>
          <Typography sx={{color: '#BAB8B8', fontSize: '12px'}}>
            国家重点项目
          </Typography>
          <Typography color="inherit" sx={{fontSize: '14px'}} >
            面向复杂场景的图计算机
          </Typography>
          <Typography color="inherit" sx={{fontSize: '11px'}}>
            (2023YFB4502300)
          </Typography>
        </Box>
      </Box>

      <Divider orientation="vertical" sx={{ borderColor: 'var(--mui-palette-neutral-700)', mx: 2 }} />
      
      {/* 右侧导航项 */}
      <Box component="nav" sx={{ flex: '1 1 auto', display: 'flex', alignItems: 'center' }}>
        {renderNavItems({ pathname, items: navItems })}
      </Box>
    </Box>
  );
}

function renderNavItems({ items = [], pathname }: { items?: NavItemConfig[]; pathname: string }): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { key, ...item } = curr;

    acc.push(<NavItem key={key} pathname={pathname} {...item} />);

    return acc;
  }, []);

  return (
    <Stack component="ul" direction="row" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends NavItemConfig {
  pathname: string;
}

function NavItem({ disabled, external, href, pathname, title }: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ href, pathname });

  return (
    <Box sx={{margin: '0 4px'}}>
      <Box
        {...(href
          ? {
              component: external ? 'a' : RouterLink,
              href,
              target: external ? '_blank' : undefined,
              rel: external ? 'noreferrer' : undefined,
            }
          : { role: 'button' })}
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          color: 'var(--NavItem-color)',
          cursor: 'pointer',
          display: 'flex',
          flex: '0 0 auto',
          gap: 1,
          p: '8px 16px',
          position: 'relative',
          textDecoration: 'none',
          ...(disabled && {
            bgcolor: 'var(--NavItem-disabled-background)',
            color: 'var(--NavItem-disabled-color)',
            cursor: 'not-allowed',
          }),
          ...(active && { bgcolor: 'var(--NavItem-active-background)', color: 'var(--NavItem-active-color)' }),
        }}
      >
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography
            component="span"
            sx={{ 
              color: 'inherit', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              lineHeight: '1.2',
              whiteSpace: 'normal',
              wordBreak: 'break-word'
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
