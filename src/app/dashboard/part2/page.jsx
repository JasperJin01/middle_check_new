'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Button,
  Fab,
  Zoom
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import SelectTab from './SelectTab';

const Page = () => {
  const [hoveredModule, setHoveredModule] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeModules, setActiveModules] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('custom');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [showMiddlePanel, setShowMiddlePanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [showBottomPanels, setShowBottomPanels] = useState(false);

  // 定义按钮坐标和尺寸
  const modules = {
    '统一编程框架CGA': { x: 76.8, y: 102, width: 84, height: 39.6 },
    '编译器前端': { x: 86.4, y: 175.2, width: 205.2, height: 28.8 },
    '图-矩阵转换及编译优化': { x: 219.6, y: 224.4, width: 72, height: 75.6 },
    '编译器后端': { x: 86.4, y: 320.4, width: 99.6, height: 28.8 },
    '主机端代码': { x: 362.4, y: 102, width: 126, height: 36 },
    'g++': { x: 366, y: 236.4, width: 114, height: 36 },
    'Linker': { x: 288, y: 428.4, width: 66, height: 28.8 },
    '转换': { x: 192, y: 102, width: 42, height: 39.6 },
    '现有图计算框架': { x: 260.4, y: 102, width: 74.4, height: 39.6 },
    'exe执行': { x: 391.2, y: 480, width: 64.8, height: 28.8 }
  };
  
  const handleMouseMove = (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMousePosition({ x, y });

    let foundModule = null;
    for (const [module, coords] of Object.entries(modules)) {
      if (x >= coords.x && x <= coords.x + coords.width && y >= coords.y && y <= coords.y + coords.height) {
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
      if (x >= coords.x && x <= coords.x + coords.width && y >= coords.y && y <= coords.y + coords.height) {
        handleModuleClick(module);
        break;
      }
    }
  };

  const handleModuleClick = (module) => {
    switch (module) {
      case '统一编程框架CGA':
        setShowMiddlePanel(true);
        setShowRightPanel(false);
        setActiveTab('device-cga');
        setActiveModules(prev => [...new Set([...prev, module])]);
        break;
      case '现有图计算框架':
        setShowMiddlePanel(true);
        setShowRightPanel(true);
        setActiveTab('existing-framework');
        setActiveModules(prev => [...new Set([...prev, module])]);
        break;
      case '编译器前端':
        setShowRightPanel(true);
        setActiveTab('graph-ir');
        setActiveModules(prev => [...new Set([...prev, module])]);
        break;
      case '图-矩阵转换及编译优化':
        setShowRightPanel(true);
        setActiveTab('matrix-ir');
        setActiveModules(prev => [...new Set([...prev, module])]);
        break;
      case '编译器后端':
        setShowRightPanel(true);
        setActiveTab('hardware-instruction');
        setActiveModules(prev => [...new Set([...prev, module])]);
        break;
      case '主机端代码':
        setShowMiddlePanel(true);
        setActiveTab('host-code');
        setActiveModules(prev => [...new Set([...prev, module])]);
        break;
      default:
        break;
    }
  };

  const handleAlgorithmChange = (event) => {
    setSelectedAlgorithm(event.target.value);
  };

  const handleDatasetChange = (event) => {
    setSelectedDataset(event.target.value);
  };

  const toggleBottomPanels = () => {
    setShowBottomPanels(prev => !prev);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', position: 'relative', overflow: 'hidden' }}>
      <Grid container spacing={0} sx={{ height: '100%' }}>
        {/* 左侧流程展示 - 固定不变 */}
        <Grid item xs={4} sx={{ height: '100%', p: 1 }}>
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
            <Box sx={{ textAlign: 'center', height: 'calc(100% - 80px)' }}>
              <img
                src="/page2_figure.jpg"
                alt="Flowchart"
                onClick={handleImageClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
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
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                鼠标位置: ({mousePosition.x.toFixed(0)}, {mousePosition.y.toFixed(0)})
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* 右侧可滑动区域 */}
        <Grid item xs={8} sx={{ height: '100%', position: 'relative', overflow: 'hidden', p: 1 }}>
          {/* 主面板容器 */}
          <Box sx={{ 
            height: '100%',
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            transform: showBottomPanels ? 'translateY(-100%)' : 'translateY(0)',
            transition: 'transform 0.5s ease',
            padding: 1,
          }}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
              {/* 中间面板 */}
              <Grid item xs={6} sx={{ height: '100%' }}>
                {showMiddlePanel ? (
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      height: '100%',
                    }}
                  >
                    {/* 图算法选择框 */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel sx={{ fontSize: '1.3rem' }}>图算法选择</InputLabel>
                      <Select
                        value={selectedAlgorithm}
                        label="图算法选择"
                        onChange={handleAlgorithmChange}
                        sx={{ fontSize: '1.1rem' }}
                      >
                        <MenuItem value="bfs">BFS</MenuItem>
                        <MenuItem value="sssp">SSSP</MenuItem>
                        <MenuItem value="wcc">WCC</MenuItem>
                        <MenuItem value="kcore">K-Core</MenuItem>
                        <MenuItem value="kclique">K-Clique</MenuItem>
                        <MenuItem value="ppr">PPR</MenuItem>
                        <MenuItem value="gcn">GCN</MenuItem>
                        <MenuItem value="custom">模版</MenuItem>
                        <MenuItem value="framework">框架转换生成</MenuItem>
                      </Select>
                    </FormControl>

                    {/* 选项卡 */}
                    <SelectTab 
                      activeTab={activeTab} 
                      selectedAlgorithm={selectedAlgorithm}
                      panelType="middle"
                      activeModules={activeModules}
                    />
                  </Paper>
                ) : (
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      点击左侧按钮激活面板
                    </Typography>
                  </Paper>
                )}
              </Grid>

              {/* 右侧面板 */}
              <Grid item xs={6} sx={{ height: '100%' }}>
                {showRightPanel ? (
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      height: '100%',
                    }}
                  >
                    {/* 数据集选择框 */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel sx={{ fontSize: '1.3rem' }}>数据集选择</InputLabel>
                      <Select
                        value={selectedDataset}
                        label="数据集选择"
                        onChange={handleDatasetChange}
                        sx={{ fontSize: '1.1rem' }}
                      >
                        <MenuItem value="cora">Cora</MenuItem>
                        <MenuItem value="citeseer">CiteSeer</MenuItem>
                        <MenuItem value="pubmed">PubMed</MenuItem>
                        <MenuItem value="ogbn-arxiv">OGBn-arxiv</MenuItem>
                        <MenuItem value="ogbn-products">OGBn-products</MenuItem>
                      </Select>
                    </FormControl>

                    {/* 选项卡 */}
                    <SelectTab 
                      activeTab={activeTab} 
                      selectedAlgorithm={selectedAlgorithm}
                      selectedDataset={selectedDataset}
                      panelType="right"
                      activeModules={activeModules}
                    />
                  </Paper>
                ) : (
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      点击左侧按钮激活面板
                    </Typography>
                  </Paper>
                )}
              </Grid>
            </Grid>
          </Box>

          {/* 底部面板容器 */}
          <Box sx={{ 
            height: '100%',
            width: '100%',
            position: 'absolute',
            top: '100%',
            left: 0,
            transform: showBottomPanels ? 'translateY(-100%)' : 'translateY(0)',
            transition: 'transform 0.5s ease',
            padding: 1,
          }}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
              {/* 日志输出区域 */}
              <Grid item xs={6} sx={{ height: '100%' }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, mb: 2, color: 'primary.main'
                  }}>
                    日志输出
                  </Typography>
                  <Box sx={{ 
                    flex: 1,
                    overflow: 'auto',
                    backgroundColor: '#f5f5f5',
                    p: 2,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                  }}>
                    {/* 这里放置日志内容 */}
                    <pre>日志内容将在这里显示...</pre>
                  </Box>
                </Paper>
              </Grid>

              {/* 性能总结区域 */}
              <Grid item xs={6} sx={{ height: '100%' }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, mb: 2, color: 'primary.main'
                  }}>
                    性能总结
                  </Typography>
                  <Box sx={{ 
                    flex: 1,
                    overflow: 'auto',
                    backgroundColor: '#f5f5f5',
                    p: 2,
                    borderRadius: 1,
                  }}>
                    {/* 这里放置性能总结内容 */}
                    <Typography variant="body1">
                      性能总结将在这里显示...
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* 滑动控制按钮 */}
      <Zoom in={true}>
        <Fab
          color="primary"
          size="medium"
          onClick={toggleBottomPanels}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          {showBottomPanels ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </Fab>
      </Zoom>
    </Box>
  );
};

export default Page;
