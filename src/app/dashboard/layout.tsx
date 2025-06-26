'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { SideNav } from '@/components/dashboard/layout/side-nav';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const pathname = usePathname();
  const isPart2 = pathname?.includes('/dashboard/part2');
  const prevPathRef = useRef(pathname);
  
  // 使用更强大的方法处理页面滚动位置
  useEffect(() => {
    // 如果路径变化，并且新路径是part2
    if (prevPathRef.current !== pathname && isPart2) {
      console.log('Navigating to Part2, resetting scroll positions');
      
      // 重置所有可能包含滚动条的元素
      const scrollableElements = [
        window,
        document.documentElement,
        document.body,
        document.getElementById('__next'),
        document.querySelector('main'),
        ...Array.from(document.querySelectorAll('.MuiBox-root')),
        ...Array.from(document.querySelectorAll('.MuiContainer-root')),
        ...Array.from(document.querySelectorAll('[style*="overflow"]'))
      ];
      
      // 统一延迟执行以确保在DOM更新后重置滚动位置
      setTimeout(() => {
        scrollableElements.forEach(el => {
          if (el && typeof el.scrollTo === 'function') {
            el.scrollTo(0, 0);
          }
          if (el && 'scrollTop' in el) {
            try {
              el.scrollTop = 0;
            } catch (e) {
              // 忽略可能的错误
            }
          }
        });
        
        // 强制重新渲染
        window.dispatchEvent(new Event('resize'));
      }, 10);
    }
    
    // 保存当前路径用于比较
    prevPathRef.current = pathname;
  }, [pathname, isPart2]);
  
  // 部分组件专门用于处理路由变化时的状态重置
  const ResetScrollOnNavigate = () => {
    useEffect(() => {
      if (isPart2) {
        // 确保滚动状态被重置
        return () => {
          // 清理函数，当组件卸载时执行
          setTimeout(() => {
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
          }, 0);
        };
      }
    }, []);
    return null;
  };

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
              {/* 添加重置组件 */}
              <ResetScrollOnNavigate />
              {children}
            </Container>
          </main>
        </Box>
      </Box>
    </>
  );
}
