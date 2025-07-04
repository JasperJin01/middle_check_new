import { useRef, useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';

const FlowDiagram = ({ onModuleClick }) => {
  const [hoveredModule, setHoveredModule] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const [scaleFactor, setScaleFactor] = useState({ scaleX: 1, scaleY: 1 });
  
  // 原始图片尺寸（根据实际图片尺寸设置）
  const originalImageDimensions = { width: 480, height: 540 };

  // 定义按钮坐标和尺寸 - 基于原始图片尺寸
  const modules = {
    '统一编程框架CGA': { x: 73, y: 92, width: 84, height: 39.6 },
    '编译器前端': { x: 84, y: 158, width: 205.2, height: 28.8 },
    '图-矩阵转换及编译优化': { x: 211, y: 203, width: 72, height: 75.6 },
    '编译器后端': { x: 83, y: 287, width: 99.6, height: 28.8 },
    '主机端代码': { x: 348, y: 93, width: 126, height: 36 },
    'g++': { x: 353, y: 212, width: 114, height: 36 },
    '加速卡object': { x: 141, y: 384, width: 114, height: 36 },
    // 'Linker': { x: 277, y: 387, width: 66, height: 28.8 },
    '转换': { x: 182, y: 94, width: 42, height: 39.6 },
    '现有图计算框架': { x: 249, y: 91, width: 74.4, height: 39.6 },
    'exe执行': { x: 375, y: 431, width: 64.8, height: 28.8 }
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
        if (onModuleClick) {
          onModuleClick(module);
        }
        break;
      }
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 3,
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h6" sx={{ 
        fontWeight: 700, mb: 2, color: 'primary.main'
      }}>
        流程展示
      </Typography>
      <Box sx={{ textAlign: 'center', height: '100%', overflow: 'hidden' }}>
        <img
          ref={imageRef}
          src="/page2_figure.jpg"
          alt="流程图"
          onClick={handleImageClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onLoad={handleImageLoad}
          style={{ 
            cursor: 'pointer', 
            maxWidth: '100%', 
            height: 'auto',
            maxHeight: '80%'
          }}
        />
        {hoveredModule && (
          <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
            {hoveredModule}
          </Typography>
        )}
        {/* 鼠标位置、缩放、原始坐标，用于调试 */}
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          鼠标位置: ({mousePosition.x.toFixed(0)}, {mousePosition.y.toFixed(0)}) 
          缩放: ({scaleFactor.scaleX.toFixed(2)}, {scaleFactor.scaleY.toFixed(2)}) 
          原始坐标: ({mousePosition.originalX?.toFixed(1) || 0}, {mousePosition.originalY?.toFixed(1) || 0})
        </Typography>
      </Box>
    </Paper>
  );
};

export default FlowDiagram; 