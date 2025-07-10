'use client';

import { useRef, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { paths } from '@/paths';

const OverviewPage = () => {
  const [hoveredModule, setHoveredModule] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const [scaleFactor, setScaleFactor] = useState({ scaleX: 1, scaleY: 1 });
  const router = useRouter();
  
  // 原始图片尺寸（根据实际图片尺寸设置）
  const originalImageDimensions = { width: 1920, height: 1080 };

  // 定义可点击区域坐标和尺寸 - 基于原始图片尺寸
  // 这些坐标需要根据实际PPT图片调整
  const modules = {
    'part1': { x: 500, y: 194, width: 1000, height: 100, title: 'FPGA芯片性能演示', path: paths.dashboard.part1 },
    'part2': { x: 500, y: 378, width: 1000, height: 100, title: '软硬一体模拟器演示', path: paths.dashboard.part2 },
    'part3': { x: 500, y: 577, width: 1000, height: 100, title: '真实场景分布式图计算', path: paths.dashboard.part3 },
    'part4': { x: 500, y: 770, width: 1000, height: 100, title: '项目中期指标测试', path: paths.dashboard.part4 },
  };

  // 计算当前缩放比例
  const calculateScaleFactor = () => {
    if (!imageRef.current) return { scaleX: 1, scaleY: 1 };
    
    const displayWidth = imageRef.current.clientWidth;
    const displayHeight = imageRef.current.clientHeight;
    
    return {
      scaleX: displayWidth / originalImageDimensions.width,
      scaleY: displayHeight / originalImageDimensions.height
    };
  };

  // 监听窗口大小变化，重新计算缩放因子
  useEffect(() => {
    const updateScaleFactor = () => {
      const newScaleFactor = calculateScaleFactor();
      setScaleFactor(newScaleFactor);
    };

    // 初始计算
    updateScaleFactor();

    // 监听窗口大小变化
    window.addEventListener('resize', updateScaleFactor);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', updateScaleFactor);
    };
  }, []);

  // 图片加载完成后计算缩放因子
  const handleImageLoad = () => {
    const newScaleFactor = calculateScaleFactor();
    setScaleFactor(newScaleFactor);
  };
  
  // 根据缩放比例调整坐标
  const getScaledCoordinates = (coords) => {
    return {
      x: coords.x * scaleFactor.scaleX,
      y: coords.y * scaleFactor.scaleY,
      width: coords.width * scaleFactor.scaleX,
      height: coords.height * scaleFactor.scaleY
    };
  };
  
  const handleMouseMove = (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 计算对应的原始坐标（反向计算）
    const originalX = x / scaleFactor.scaleX;
    const originalY = y / scaleFactor.scaleY;
    
    setMousePosition({ 
      x, 
      y,
      originalX,
      originalY
    });
    
    let foundModule = null;
    for (const [module, coords] of Object.entries(modules)) {
      const scaledCoords = getScaledCoordinates(coords);
      
      if (
        x >= scaledCoords.x && 
        x <= scaledCoords.x + scaledCoords.width && 
        y >= scaledCoords.y && 
        y <= scaledCoords.y + scaledCoords.height
      ) {
        foundModule = module;
        break;
      }
    }
    setHoveredModule(foundModule);
  };

  const handleMouseLeave = () => {
    setHoveredModule(null);
    setMousePosition({ x: 0, y: 0 });
  };

  const handleImageClick = (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    for (const [module, coords] of Object.entries(modules)) {
      const scaledCoords = getScaledCoordinates(coords);
      
      if (
        x >= scaledCoords.x && 
        x <= scaledCoords.x + scaledCoords.width && 
        y >= scaledCoords.y && 
        y <= scaledCoords.y + scaledCoords.height
      ) {
        // 对于part3，打开新窗口
        if (module === 'part3') {
          window.open('http://disgraphui.xning.site:5380', '_blank');
        } else {
          // 其他页面正常导航
          router.push(coords.path);
        }
        break;
      }
    }
  };

  // 创建一个特殊布局，隐藏导航栏
  useEffect(() => {
    // 创建一个样式元素
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .overview-page-container .MuiBox-root:has(nav) {
        display: none !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // 清理函数
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <Box 
      className="overview-page-container"
      sx={{ 
        height: '100vh', 
        width: '100%', 
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        zIndex: 9999
      }}
    >
      <Box 
        sx={{ 
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <img
          ref={imageRef}
          src="/all_in_one.png"
          alt="项目总览"
          onClick={handleImageClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onLoad={handleImageLoad}
          style={{ 
            cursor: 'pointer', 
            maxWidth: '100%', 
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
        
        {/* 调试信息 - 可通过注释来隐藏 */}
        {/* <Typography 
          variant="body2" 
          sx={{ 
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            color: '#000',
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: '5px',
            borderRadius: '4px'
          }}
        >
          鼠标位置: ({mousePosition.x.toFixed(0)}, {mousePosition.y.toFixed(0)}) <br/>
          缩放: ({scaleFactor.scaleX.toFixed(2)}, {scaleFactor.scaleY.toFixed(2)}) <br/>
          原始坐标: ({mousePosition.originalX?.toFixed(1) || 0}, {mousePosition.originalY?.toFixed(1) || 0}) <br/>
          {hoveredModule && `当前区域: ${hoveredModule} (${modules[hoveredModule]?.title})`}
        </Typography> */}
      </Box>
    </Box>
  );
};

export default OverviewPage; 