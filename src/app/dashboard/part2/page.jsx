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
  Button
} from '@mui/material';

import SelectTab from './SelectTab';

const Page = () => {
  const [hoveredModule, setHoveredModule] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeModules, setActiveModules] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [showMiddlePanel, setShowMiddlePanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('');

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
        // scrollToSection(module);
        // runProcess(module);
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

  // const getLog = (module) => {
    // return logDataMap[module];
  const handleAlgorithmChange = (event) => {
    setSelectedAlgorithm(event.target.value);
  };

  const handleDatasetChange = (event) => {
    setSelectedDataset(event.target.value);
  };

  return (
    <Grid container spacing={1} sx={{ height: '100vh', p: 1 }}>
      {/* 左侧流程展示 */}
      <Grid item xs={4}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 3,
            height: '100%',
            position: 'relative',
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
                maxHeight: '100%'
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

      {/* 中间面板 */}
      <Grid item xs={4}>
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
                label="图算法选择111"
                onChange={handleAlgorithmChange}
                sx={{ fontSize: '1.1rem' }}
              >
                <MenuItem value="bfs">BFS (广度优先搜索)</MenuItem>
                <MenuItem value="dfs">DFS (深度优先搜索)</MenuItem>
                <MenuItem value="sssp">SSSP (单源最短路径)</MenuItem>
                <MenuItem value="pagerank">PageRank</MenuItem>
                <MenuItem value="triangle">Triangle Counting</MenuItem>
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
      <Grid item xs={4}>
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
                label="数据集选择111"
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
  );
};

export default Page;
