'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';
import { usePathname } from 'next/navigation';

import { SideNav } from '@/components/dashboard/layout/side-nav';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const pathname = usePathname();
  const isPart2 = pathname?.includes('/dashboard/part2');

  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            '--MainNav-height': '56px',
            '--MainNav-zIndex': 1000,
            '--SideNav-height': '70px',
            '--SideNav-zIndex': 1100,
            '--MobileNav-width': '320px',
            '--MobileNav-zIndex': 1100,
            height: '100vh',
            overflow: isPart2 ? 'hidden' : 'auto',
          },
        }}
      />
      <Box
        sx={{
          bgcolor: 'var(--mui-palette-background-default)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          height: '100vh',
          overflow: isPart2 ? 'hidden' : 'auto',
        }}
      >
        <SideNav />
        <Box sx={{ 
          display: 'flex', 
          flex: '1 1 auto', 
          flexDirection: 'column', 
          pt: { lg: 'var(--SideNav-height)' },
          overflow: isPart2 ? 'hidden' : 'auto',
        }}>
          <main>
            <Container maxWidth={false} 
            sx={{ 
              backgroundColor: '#f5f7fa', 
              maxWidth: '100%',
              height: isPart2 ? '100vh' : 'auto',
              overflow: isPart2 ? 'hidden' : 'visible',
            }}>
              {children}
            </Container>
          </main>
        </Box>
      </Box>
      </>
  );
}
