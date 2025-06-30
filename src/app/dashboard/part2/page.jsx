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
  Zoom,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';

import SelectTab from './SelectTab';
import { codeData } from './codeData';
import FlowDiagram from './FlowDiagram';
import useHandleRun from './handleRun';
import { chartResults, defaultPerformanceValues, algorithmNameMapping } from './chartResults';

// 示例代码，在网络请求失败时使用
const sampleCodes = {
  'bfs': { 
    frameworkCode: '# Sample BFS framework code', 
    cgaCode: '# Sample BFS CGA code' 
  },
  'sssp': { 
    frameworkCode: '# Sample SSSP framework code', 
    cgaCode: '# Sample SSSP CGA code' 
  },
  'wcc': { 
    frameworkCode: '# Sample WCC framework code', 
    cgaCode: '# Sample WCC CGA code' 
  },
  'kcore': { 
    frameworkCode: '# Sample K-Core framework code', 
    cgaCode: '# Sample K-Core CGA code' 
  },
  'kclique': { 
    frameworkCode: '# Sample K-Clique framework code', 
    cgaCode: '# Sample K-Clique CGA code' 
  },
  'ppr': { 
    frameworkCode: '# Sample PPR framework code', 
    cgaCode: '# Sample PPR CGA code' 
  },
  'gcn': { 
    frameworkCode: '# Sample GCN framework code', 
    cgaCode: '# Sample GCN CGA code' 
  }
};

// 导入请求工具
const request = {
  BASE_URL: 'http://127.0.0.1:8000' // 这里需要替换为实际的后端URL
};

// 算法和数据集映射
const algorithmMappings = {
  'bfs': {
    url: 'bfs',
    datasets: ['smallgraph', 'facebook', 'physics'],
  },
  'sssp': {
    url: 'sssp',
    datasets: ['smallgraph', 'facebook', 'physics'],
  },
  'wcc': {
    url: 'wcc',
    datasets: ['euroroad', 'pdzbase', 'facebook'],
  },
  'kcore': {
    url: 'kcore',
    datasets: ['physics', 'facebook'],
  },
  'kclique': {
    url: 'cf',
    datasets: ['Rmat-16','Rmat-18', 'Rmat-20','euroroad', 'physics'],
  },
  'ppr': {
    url: 'ppr',
    datasets: ['Rmat-16','Rmat-18','Rmat-20','smallgraph', 'physics', 'facebook'],
  },
  'gcn': {
    url: 'gcn',
    datasets: ['Rmat-16','Rmat-17','Rmat-18', 'cora'],
  }
};

const Page = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('custom');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [showMiddlePanel, setShowMiddlePanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [showBottomPanels, setShowBottomPanels] = useState(false);
  const [editedCodes, setEditedCodes] = useState({});
  const [animatedTabs, setAnimatedTabs] = useState([]);
  const [visibleIRTabs, setVisibleIRTabs] = useState([]);
  const resultsBoxRef = useRef(null);
  const [chartData, setChartData] = useState([]);
  const [chartMetric, setChartMetric] = useState('performance');
  const [originalCodeDisplay, setOriginalCodeDisplay] = useState('');
  const [transformedCode, setTransformedCode] = useState('');
  const simulatorBoxRef = useRef(null);
  const [simulatorResults, setSimulatorResults] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');
  const [cgaAnimationEnabled, setCgaAnimationEnabled] = useState(false);
  
  // 添加保存框架选择和算法选择的状态
  const [frameworkSelection, setFrameworkSelection] = useState({
    framework: '',
    algorithm: ''
  });

  // 使用抽离出来的handleRun hook
  const { handleRun, isRunning, results, setResults } = useHandleRun(algorithmMappings);

  // 初始化时设置默认算法和数据集
  useEffect(() => {
    // 设置默认算法为bfs
    const defaultAlgorithm = 'bfs';
    setSelectedAlgorithm(defaultAlgorithm);
    
    // 设置默认数据集为算法的第一个可用数据集
    if (algorithmMappings[defaultAlgorithm] && 
        algorithmMappings[defaultAlgorithm].datasets && 
        algorithmMappings[defaultAlgorithm].datasets.length > 0) {
      setSelectedDataset(algorithmMappings[defaultAlgorithm].datasets[0]);
    }
  }, []);
  
  // 监听框架选择变化，更新selectedFramework
  useEffect(() => {
    setSelectedFramework(frameworkSelection.framework);
  }, [frameworkSelection]);

  const handleAlgorithmChange = (event) => {
    const newAlgorithm = event.target.value;
    setSelectedAlgorithm(newAlgorithm);
    
    // 切换算法时清除IR选项卡
    setVisibleIRTabs([]);
    
    // 更新可用的数据集
    if(newAlgorithm !== 'custom' && newAlgorithm !== 'framework' && algorithmMappings[newAlgorithm]) {
      const availableDatasets = algorithmMappings[newAlgorithm].datasets;
      setSelectedDataset(availableDatasets[0]);
      // 如果当前选择的数据集不在新算法的可用数据集列表中，选择第一个数据集
      // if (availableDatasets && availableDatasets.length > 0) {
      //   if (!availableDatasets.includes(selectedDataset)) {
      //     setSelectedDataset(availableDatasets[0]);
      //   }
      // } else {
      //   setSelectedDataset('');
      // }
    } else {
      // 对于自定义或框架生成，清空数据集选择
      setSelectedDataset('');
    }
  };

  const handleDatasetChange = (event) => {
    setSelectedDataset(event.target.value);
  };

  const toggleBottomPanels = () => {
    setShowBottomPanels(prev => !prev);
  };

  // 处理代码编辑
  const handleCodeChange = (newCode, key) => {
    console.log(`Code changed for ${key}:`, newCode.substring(0, 20) + '...');
    setEditedCodes(prev => ({
      ...prev,
      [key]: newCode
    }));
  };

  // 获取指定算法可用的数据集列表
  const getAvailableDatasets = () => {
    if(selectedAlgorithm && selectedAlgorithm !== 'custom' && selectedAlgorithm !== 'framework') {
      return algorithmMappings[selectedAlgorithm]?.datasets || [];
    }
    return [];
  };
  
  // 获取算法URL
  const getAlgorithmUrl = () => {
    return algorithmMappings[selectedAlgorithm]?.url || algo;
  };
  
  // 获取数据集URL
  const getDatasetUrl = (dataset) => {
    return dataset;
  };
  
  // 自动滚动到底部
  const scrollToBottom = () => {
    if (resultsBoxRef.current) {
      resultsBoxRef.current.scrollTop = resultsBoxRef.current.scrollHeight;
    }
  };
  
  // 监听结果变化，自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [results]);
  
  // 定义Y轴映射
  const yAxisMap = {
    'bfs': { 
      performance: 'GTSPS',
      consumption: 'GTSPS/W'
    },
    'sssp': { 
      performance: 'GTSPS',
      consumption: 'GTSPS/W'
    },
    'wcc': { 
      performance: 'GTSPS',
      consumption: 'GTSPS/W'
    },
    'kcore': { 
      performance: 'GTSPS',
      consumption: 'GTSPS/W'
    },
    'kclique': { 
      performance: 'GTSPS',
      consumption: 'GTSPS/W'
    },
    'ppr': { 
      performance: 'GTSPS',
      consumption: 'GTSPS/W'
    },
    'gcn': { 
      performance: 'GTSPS',
      consumption: 'GTSPS/W'
    },
  };
  
  // 获取当前算法的Y轴单位
  const getYAxisUnit = (metric) => {
    if (selectedAlgorithm && yAxisMap[selectedAlgorithm]) {
      return yAxisMap[selectedAlgorithm][metric] || '';
    }
    return '';
  };

  // 生成示例图表数据
  const generateChartData = () => {
    if (!selectedAlgorithm || selectedAlgorithm === 'custom' || selectedAlgorithm === 'framework' || !selectedDataset) {
      return;
    }
    
    let performanceValue = 0;
    let ptargetValue = 3;
    let consumptionValue = 0;
    let ctargetValue = 8;
    
    // 先检查chartResults中是否有对应算法和数据集的数据
    if (chartResults[selectedAlgorithm] && chartResults[selectedAlgorithm][selectedDataset]) {
      const resultData = chartResults[selectedAlgorithm][selectedDataset];
      performanceValue = resultData.find(item => item.key.includes('性能('))?.value || 0;
      ptargetValue = resultData.find(item => item.key.includes('性能指标要求'))?.value || 3;
      consumptionValue = resultData.find(item => item.key.includes('性能功耗比('))?.value || 0;
      ctargetValue = resultData.find(item => item.key.includes('性能功耗比指标要求'))?.value || 8;
    } else {
      // 如果没有预定义数据，使用默认性能值
      const defaultValues = defaultPerformanceValues[selectedAlgorithm]?.[selectedDataset];
      if (defaultValues) {
        performanceValue = defaultValues.performance['1000MHz'];
        ptargetValue = defaultValues.target.performance;
        consumptionValue = defaultValues.consumption;
        ctargetValue = defaultValues.target.consumption;
      } else {
        // 如果没有默认值，使用随机生成的数据
        performanceValue = Math.random() * 4 + 3;
        ptargetValue = 3;
        consumptionValue = Math.random() * 3 + 8;
        ctargetValue = 8;
      }
    }
    
    // 生成图表数据
    const chartData = [{
      name: selectedDataset,
      performance: performanceValue,
      ptarget: ptargetValue,
      consumption: consumptionValue,
      ctarget: ctargetValue
    }];
    
    setChartData(chartData);
  };

  // 处理流程图中模块的点击事件
  const handleModuleClick = (module) => {
    // 除了"exe执行"外的其他按钮点击时，如果界面在底部，则滑回顶部
    if (module !== 'exe执行' && showBottomPanels) {
      setShowBottomPanels(false);
      return;
    }

    switch (module) {
      case '统一编程框架CGA':
        setShowMiddlePanel(true);
        setShowRightPanel(false);
        setActiveTab('device-cga');
        setSelectedAlgorithm('custom');
        setCgaAnimationEnabled(false);
        
        // 重置现有图计算框架的选择，避免闪动bug
        setFrameworkSelection({
          framework: '',
          algorithm: ''
        });
        break;
      case '现有图计算框架':
        setShowMiddlePanel(true);
        setShowRightPanel(true);
        setActiveTab('existing-framework');
        setSelectedAlgorithm('framework');
        break;
      case '转换':
        console.log(frameworkSelection);
        // 检查是否有选择框架和算法
        if (frameworkSelection.framework && frameworkSelection.algorithm) {
          // 获取对应算法的CGA代码
          const algorithmName = frameworkSelection.algorithm;
          const cgaCode = codeData['device-cga'][algorithmName];
          console.log(cgaCode);
          
          if (cgaCode) {
            
            // 激活设备端CGA代码选项卡
            setShowMiddlePanel(true);
            setActiveTab('device-cga');
            // 图算法选择框保持为"框架转换生成"但内部代码显示对应算法的代码
            setSelectedAlgorithm(algorithmName);
            
            // 启用CGA代码的动画效果
            setCgaAnimationEnabled(true);
            
            // 1.5s后取消动画效果（防止点击转换按钮后，CGA代码框一直有动画效果）
            setTimeout(() => {
              setCgaAnimationEnabled(false);
            }, 1500);
          }
        }
        break;
      case '编译器前端':
        setShowRightPanel(true);
        setActiveTab('graph-ir');
        setAnimatedTabs(prev => [...new Set([...prev, 'graph-ir'])]);
        // 添加到可见IR选项卡
        setVisibleIRTabs(prev => [...new Set([...prev, 'graph-ir'])]);
        break;
      case '图-矩阵转换及编译优化':
        setShowRightPanel(true);
        setActiveTab('matrix-ir');
        setAnimatedTabs(prev => [...new Set([...prev, 'matrix-ir'])]);
        // 添加到可见IR选项卡
        setVisibleIRTabs(prev => [...new Set([...prev, 'matrix-ir'])]);
        break;
      case '编译器后端':
        setShowRightPanel(true);
        setActiveTab('hardware-instruction');
        setAnimatedTabs(prev => [...new Set([...prev, 'hardware-instruction'])]);
        // 添加到可见IR选项卡
        setVisibleIRTabs(prev => [...new Set([...prev, 'hardware-instruction'])]);
        break;
      case '主机端代码':
        setShowMiddlePanel(true);
        setActiveTab('host-code');
        break;
      case 'exe执行':
        // 执行程序
        handleRun(selectedAlgorithm, selectedDataset, selectedFramework, showBottomPanels, setShowBottomPanels, generateChartData);
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', position: 'relative', overflow: 'hidden' }}>
      <Grid container spacing={0} sx={{ height: '100%' }}>
        {/* 左侧流程展示 - 使用FlowDiagram组件 */}
        <Grid item xs={4} sx={{ height: '100%', p: 1 }}>
          <FlowDiagram onModuleClick={handleModuleClick} />
        </Grid>

        {/* 中间和右侧可滑动区域 */}
        <Grid item xs={8} sx={{ height: '100%', position: 'relative', overflow: 'hidden', p: 1 }}>
          {/* 顶部面板容器 */}
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
                      key="middle-panel"
                      activeTab={activeTab} 
                      selectedAlgorithm={selectedAlgorithm}
                      panelType="middle"
                      editedCodes={editedCodes}
                      onCodeChange={handleCodeChange}
                      animatedTabs={animatedTabs}
                      frameworkSelection={frameworkSelection}
                      setFrameworkSelection={setFrameworkSelection}
                      cgaAnimationEnabled={cgaAnimationEnabled}
                    />
                  </Paper>
                ) : (
                  <Paper elevation={3}
                    sx={{ p: 2, borderRadius: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',}}>
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
                        {getAvailableDatasets().map(dataset => (
                          <MenuItem key={dataset} value={dataset}>{dataset}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* 选项卡 */}
                    <SelectTab 
                      key="right-panel"
                      activeTab={activeTab} 
                      selectedAlgorithm={selectedAlgorithm}
                      selectedDataset={selectedDataset}
                      panelType="right"
                      editedCodes={editedCodes}
                      onCodeChange={handleCodeChange}
                      animatedTabs={animatedTabs}
                      frameworkSelection={frameworkSelection}
                      setFrameworkSelection={setFrameworkSelection}
                      visibleIRTabs={visibleIRTabs}
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
                    backgroundColor: '#000',
                    color: '#fff',
                    p: 2,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                  }} 
                  ref={resultsBoxRef}>
                    {/* 这里放置日志内容，添加特定行的颜色高亮 */}
                    <pre>
                      {results.terminalOutput 
                        ? results.terminalOutput.split('\n').map((line, index) => {
                            // 匹配成功和通过的行，添加绿色
                            if (line.includes('[       OK ]') || 
                                line.includes('[  PASSED  ]') ||
                                line.includes('freq=1000 MHz')) {
                              return (
                                <div key={index} style={{ color: '#67ad5b' /* 绿色 */ }}>
                                  {line}
                                </div>
                              );
                            }
                            return (
                              <div key={index}>
                                {line}
                              </div>
                            );
                          })
                        : '日志内容将在这里显示...'
                      }
                    </pre>
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
                    结果展示
                  </Typography>
                  <Box sx={{ 
                    flex: 1,
                    overflow: 'auto',
                    p: 2,
                    borderRadius: 1,
                  }}>
                    {/* 加载进度条 */}
                    {isRunning ? (
                      <Box sx={{ width: '100%', mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          执行中，请稍候...
                        </Typography>
                        <LinearProgress color="primary" />
                      </Box>
                    ) : (
                    /* 性能图表 */
                    chartData.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                        {/* 只有对特定算法显示选项卡 */}
                        {['kclique', 'ppr', 'gcn'].includes(selectedAlgorithm) ? (
                          <Tabs
                            value={chartMetric}
                            onChange={(e, v) => setChartMetric(v)}
                            sx={{ mb: 3, alignSelf: 'flex-start' }}
                          >
                            <Tab label="性能" value="performance" style={{ fontWeight: 'bold', color: 'black' }} />
                            <Tab label="性能功耗比" value="consumption" style={{ fontWeight: 'bold', color: 'black' }} />
                          </Tabs>
                        ) : (
                          // 对其他算法，强制设置为性能选项卡，不显示切换选项
                          <Box sx={{ mb: 3, alignSelf: 'flex-start' }}>
                            <Typography variant="button" 
                              sx={{ 
                                fontWeight: 'bold', 
                                color: 'black', 
                                borderBottom: '2px solid #1976d2',
                                pb: 0.5
                              }}
                            >
                              性能
                            </Typography>
                          </Box>
                        )}

                        {/* 只显示相应的图表 */}
                        {((['kclique', 'ppr', 'gcn'].includes(selectedAlgorithm) && chartMetric === 'performance') || 
                          (!['kclique', 'ppr', 'gcn'].includes(selectedAlgorithm))) ? (
                          <BarChart
                            data={chartData}
                            margin={{ top: 50, right: 20, left: 20, bottom: 20 }}
                            width={480}
                            height={380}
                          >
                            <text
                              x="50%"
                              y={15}
                              textAnchor="middle"
                              style={{ fontSize: '16px', fontWeight: 'bold' }}
                            >
                              {`${selectedAlgorithm.toUpperCase()} 性能测试结果`}
                            </text>
                            <YAxis
                              label={{
                                value: `性能值(${getYAxisUnit('performance')})`,
                                angle: -90,
                                position: 'insideLeft'
                              }}
                            />
                            <XAxis dataKey="name"/>
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
                            />
                            <Bar
                              dataKey="performance"
                              fill="#1976d2"
                              radius={[4, 4, 0, 0]}
                              barSize={40}
                              name={'性能值'}
                              label={{
                                position: 'top',
                                formatter: (value) => value.toFixed(4)
                              }}
                            />
                            <Bar
                              dataKey="ptarget"
                              fill="green"
                              radius={[4, 4, 0, 0]}
                              barSize={40}
                              name={'中期指标值'}
                              label={{
                                position: 'top',
                              }}
                            />
                          </BarChart>
                        ) : (
                          <BarChart
                            data={chartData}
                            margin={{ top: 50, right: 20, left: 20, bottom: 20 }}
                            width={480}
                            height={380}
                          >
                            <text
                              x="50%"
                              y={15}
                              textAnchor="middle"
                              style={{ fontSize: '16px', fontWeight: 'bold' }}
                            >
                              {`${selectedAlgorithm.toUpperCase()} 功耗比测试结果`}
                            </text>
                            <YAxis
                              label={{
                                value: `性能值(${getYAxisUnit('consumption')})`,
                                angle: -90,
                                position: 'insideLeft'
                              }}
                            />
                            <XAxis dataKey="name" />
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
                            />
                            <Bar
                              dataKey="consumption"
                              fill="#1976d2"
                              name={'性能功耗比'}
                              radius={[4, 4, 0, 0]}
                              barSize={40}
                              label={{
                                position: 'top',
                                formatter: (value) => value.toFixed(4)
                              }}
                            />
                            <Bar
                              dataKey="ctarget"
                              fill="green"
                              radius={[4, 4, 0, 0]}
                              barSize={40}
                              name={'性能功耗比中期指标值'}
                              label={{
                                position: 'top',
                              }}
                            />
                          </BarChart>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body1">
                        性能结果将在执行完成后显示...
                      </Typography>
                    ))}
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
