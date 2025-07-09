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

import SelectTab from './SelectTab';
import { codeData } from './codeData';
import FlowDiagram from './FlowDiagram';
import useHandleRun from './handleRun';
import { chartResults, defaultPerformanceValues, algorithmNameMapping } from './chartResults';
import {
  generateChartData as generateChartDataUtil,
  getYAxisUnit,
  shouldShowChart,
  shouldShowConsumptionChart,
  shouldShowCpuGpuBars,
  shouldShowReferenceLine,
  isSpecialAlgorithm,
  isRmatDataset
} from './chartUtils';
import ChartDisplay from './ChartDisplay';



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
  const [originalCodeDisplay, setOriginalCodeDisplay] = useState('');
  const [transformedCode, setTransformedCode] = useState('');
  const simulatorBoxRef = useRef(null);
  const [simulatorResults, setSimulatorResults] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');
  const [cgaAnimationEnabled, setCgaAnimationEnabled] = useState(false);
  // 添加状态存储g++代码
  const [gppCode, setGppCode] = useState('');
  
  // 框架转换 添加保存框架选择和算法选择的状态
  const [frameworkSelection, setFrameworkSelection] = useState({
    framework: '',
    algorithm: ''
  });

  // 使用抽离出来的handleRun hook
  const { handleRun, isRunning, results, setResults } = useHandleRun(algorithmMappings);

  // 添加一个状态来追踪最后执行的算法和数据集
  const [lastExecutedData, setLastExecutedData] = useState({
    algorithm: '',
    datasets: []
  });
  
  // 添加一个状态来控制右侧面板的隐藏
  const [hidePanelsAfterSave, setHidePanelsAfterSave] = useState(false);

  // FIXME 这个是干啥用的啊？ 初始化时设置默认算法和数据集
  useEffect(() => {
    // 设置默认算法为bfs
    const defaultAlgorithm = 'ppr';
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

  // 修改handleCodeChange函数以检测保存操作
  const handleCodeChange = (newCode, key) => {
    console.log(`Code changed for ${key}:`, newCode.substring(0, 20) + '...');
    setEditedCodes(prev => ({
      ...prev,
      [key]: newCode
    }));
  };

  // 添加保存代码的函数
  const handleSaveCode = () => {
    // 隐藏右侧面板
    setShowRightPanel(false);
    
    // 清除可见的IR选项卡
    setVisibleIRTabs([]);
    
    // 重置选项卡动画效果
    setAnimatedTabs([]);
    
    console.log('代码已保存，已重置面板和选项卡状态');
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
  
  // 处理流程图中模块的点击事件
  const handleModuleClick = (module) => {
    // 除了"exe执行"、"g++"和"Linker"外的其他按钮点击时，如果界面在底部，则滑回顶部
    if (module !== 'exe执行' &&
       module !== 'g++' && 
       module !== 'Linker' && 
       showBottomPanels) {
      setShowBottomPanels(false);
      return;
    }

    // 清除g++代码，除非正在点击g++按钮
    if (module !== 'g++') {
      setGppCode('');
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
      case '加速卡object':
        setShowRightPanel(true);
        setActiveTab('accelerator-obj');
        setAnimatedTabs(prev => [...new Set([...prev, 'accelerator-obj'])]);
        // 添加到可见IR选项卡
        setVisibleIRTabs(prev => [...new Set([...prev, 'accelerator-obj'])]);
        break;
      case '主机端代码':
        setShowMiddlePanel(true);
        setActiveTab('host-code');
        break;
      case 'g++':
        // 设置g++代码并显示底部面板
        setShowBottomPanels(true); // 显示底部面板以查看g++代码
        // 等待1s后设置g++代码
        setTimeout(() => {
          setGppCode(codeData['g++'] || '// g++ code not found');
        }, 500);
        break;
      case 'Linker':
        setShowBottomPanels(true);
        setGppCode(''); // 先清空代码
        
        // 根据选择的算法确定日志文件名
        const getLogFileName = (algo) => {
          const algoMap = {
            'bfs': 'BFS',
            'sssp': 'SSSP',
            'wcc': 'WCC',
            'kcore': 'kcore',
            'kclique': 'kclique',
            'ppr': 'PPR',
            'gcn': 'GCN'
          };
          return `build_${algoMap[algo]}.log`;
        };

        // 读取日志文件
        fetch(`/dashboard/part2/buildlog/${getLogFileName(selectedAlgorithm)}`)
          .then(response => response.text())
          .then(logContent => {
            const lines = logContent.split('\n');
            let currentLine = 0;
            
            // 每20ms显示4行
            const interval = setInterval(() => {
              if (currentLine < lines.length) {
                // 获取接下来的4行（或剩余的行数，如果不足4行）
                const nextLines = lines.slice(currentLine, currentLine + 4).map((line, index) => {
                  // 检查是否是最后三行
                  const isLastThreeLines = currentLine + index >= lines.length - 4;
                  if (isLastThreeLines) {
                    // 为最后三行添加样式
                    return `<span style="color: #4caf50; font-weight: bold;">${line}</span>`;
                  }
                  return line;
                }).join('\n');
                
                setGppCode(prev => prev + nextLines + '\n');
                currentLine += 4;
                
                // 只在内容还在继续时滚动
                if (currentLine < lines.length) {
                  scrollToBottom();
                }
              } else {
                clearInterval(interval);
                // 确保所有内容都渲染完后，延迟一点再进行最后的滚动
                setTimeout(() => {
                  scrollToBottom();
                }, 50);
              }
            }, 20);
          })
          .catch(error => {
            console.error('Error reading log file:', error);
            setGppCode('Error: Unable to load build log');
          });
        break;
      case 'exe执行':
        // 执行程序
        setGppCode(''); // 清除g++代码
        handleRun(selectedAlgorithm, selectedDataset, selectedFramework, showBottomPanels, setShowBottomPanels, generateChartData, editedCodes);
        break;
      default:
        break;
    }
  };

  // 使用chartUtils中的函数生成图表数据
  const generateChartData = (performanceData = null) => {
    // 调用工具函数生成图表数据
    const { newChartData, newLastExecutedData } = generateChartDataUtil({
      selectedAlgorithm,
      selectedDataset,
      chartData,
      lastExecutedData,
      performanceData
    });
    
    // 更新图表数据和最后执行的数据
    setChartData(newChartData);
    setLastExecutedData(newLastExecutedData);
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
                        <MenuItem value="ppr">PPR</MenuItem>
                        <MenuItem value="kclique">K-Clique</MenuItem>
                        <MenuItem value="gcn">GCN</MenuItem>
                        <MenuItem value="bfs">BFS</MenuItem>
                        <MenuItem value="kcore">K-Core</MenuItem>
                        <MenuItem value="sssp">SSSP</MenuItem>
                        <MenuItem value="wcc">WCC</MenuItem>
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
                      onSave={handleSaveCode}
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
                    {/* 这里放置日志内容或g++代码 */}
                    <pre>
                      {gppCode ? 
                        // 如果有g++代码，显示代码
                        <div dangerouslySetInnerHTML={{ __html: gppCode }} />
                        :
                        // 否则显示正常的日志内容
                        (results.terminalOutput 
                          ? results.terminalOutput.split('\n').map((line, index) => {
                              // 匹配成功和通过的行，添加绿色
                              if (line.includes('[       OK ]') || 
                                  line.includes('[  PASSED  ]') ||
                                  line.includes('total cycles') ||
                                  line.includes('total OPs') ||
                                  line.includes('performance') ||
                                  line.includes('Performance') ||
                                  line.includes('traversed') ||
                                  line.includes('GTSPS/W') ||
                                  line.includes('GTEPS/W') ||
                                  line.includes('GOPS/W') ||
                                  line.includes('freq=1000 MHz')) {
                                return (
                                  <div key={index} style={{ 
                                    color: '#4caf50',
                                    fontWeight: 'bold'
                                    }}>
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
                        )
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
                    {/* 执行中的逻辑 */}
                    {isRunning ? (
                      <>
                        {/* 加载进度条 */}
                        <Box sx={{ width: '100%', mb: 3 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            执行中，请稍候...
                          </Typography>
                          <LinearProgress color="primary" />
                        </Box>
                        
                        {/* 判断是否显示图表 */}
                        {(() => {
                          // IIFE（立即调用函数表达式）用于在JSX中执行复杂逻辑并返回结果
                          
                          // 判断是否有图表数据
                          const hasChartData = chartData && chartData.length > 0;
                          
                          // 判断是否为特殊算法（kclique, ppr, gcn）
                          const isSpecialAlgo = isSpecialAlgorithm(selectedAlgorithm);
                          
                          // 判断是否为RMAT数据集
                          const isRmatDatasetValue = isRmatDataset(selectedDataset);
                          
                          // 判断是否有之前的数据（相同算法且有数据集）
                          const hasPreviousData = lastExecutedData.algorithm === selectedAlgorithm && 
                                                (lastExecutedData.datasets || []).length > 0;
                          
                          console.log('图表显示条件判断:', {
                            hasChartData,
                            isSpecialAlgo,
                            isRmatDatasetValue,
                            hasPreviousData,
                            isRunning
                          });
                          
                          // 使用ChartDisplay组件替换原有的图表显示逻辑
                          return (
                            <ChartDisplay 
                              chartData={chartData}
                              selectedAlgorithm={selectedAlgorithm}
                              selectedDataset={selectedDataset}
                              lastExecutedData={lastExecutedData}
                              isRunning={isRunning}
                            />
                          );
                        })()}
                      </>
                    ) : (
                      // 执行完成或没有数据的情况
                      <ChartDisplay 
                        chartData={chartData}
                        selectedAlgorithm={selectedAlgorithm}
                        selectedDataset={selectedDataset}
                        lastExecutedData={lastExecutedData}
                        isRunning={isRunning}
                      />
                    )}
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
          size="large"
          onClick={toggleBottomPanels}
          sx={{
            position: 'absolute',
            bottom: 26,
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
