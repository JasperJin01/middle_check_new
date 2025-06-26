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
  Tab
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';

import SelectTab from './SelectTab';
import { codeData } from './codeData';
import FlowDiagram from './FlowDiagram';

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
    datasets: ['euroroad', 'physics'],
  },
  'ppr': {
    url: 'ppr',
    datasets: ['smallgraph', 'physics', 'facebook'],
  },
  'gcn': {
    url: 'gcn',
    datasets: ['cora'],
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
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState({ terminalOutput: '' });
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
      // 如果当前选择的数据集不在新算法的可用数据集列表中，清空选择
      if(selectedDataset && !algorithmMappings[newAlgorithm].datasets.includes(selectedDataset)) {
        setSelectedDataset('');
      }
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
  const getAlgorithmUrl = (algo) => {
    return algorithmMappings[algo]?.url || algo;
  };
  
  // 获取数据集URL
  const getDatasetUrl = (dataset) => {
    return dataset;
  };

  const handleRun = async () => {
    if (isRunning || !selectedAlgorithm) {
      return;
    }

    setIsRunning(true);
    setResults({ terminalOutput: 'Connecting to server...\n' });

    try {
      const eventSource = new EventSource(`${request.BASE_URL}/part3/moni2/${selectedAlgorithm}/${selectedDataset}/`);
      let terminalOutput = '';

      eventSource.onmessage = async (event) => {
        if (event.data === '[done]') {
          eventSource.close();
          setResults(prev => ({
            ...prev,
            terminalOutput: prev.terminalOutput + 'Copying results...\n'
          }));

          try {
            const res = await fetch(`${request.BASE_URL}/part3/result/2/${selectedAlgorithm}/`);
            const jsonData = await res.json();

            setResults(prev => ({
              ...prev,
              terminalOutput: prev.terminalOutput + 'Completed\n'
            }));

            const originalCode = selectedFramework === 'GraphScope' ? jsonData.data.pregel : jsonData.data.dgl;
            setOriginalCodeDisplay(originalCode ? originalCode.join('\n') : sampleCodes[selectedAlgorithm].frameworkCode);

            setTransformedCode(jsonData.data.CGA ? jsonData.data.CGA.join('\n') : sampleCodes[selectedAlgorithm].cgaCode);

            setResults(prev => ({
              ...prev,
              graphIR: jsonData.data.GraphIR ? jsonData.data.GraphIR.join('\n') : '',
              matrixIR: jsonData.data.MatrixIR ? jsonData.data.MatrixIR.join('\n') : '',
              hardwareInstructions: jsonData.data.asm ? jsonData.data.asm.join('\n') : ''
            }));
            
            // 生成图表数据用于显示
            generateChartData();
          } catch (error) {
            setResults(prev => ({
              ...prev,
              terminalOutput: prev.terminalOutput + `Failed to get results: ${error.message}\n`
            }));
          } finally {
            setIsRunning(false);
          }

        } else if (event.data === '[error]') {
          eventSource.close();
          setResults(prev => ({
            ...prev,
            terminalOutput: prev.terminalOutput + '\nExecution error\n'
          }));
          setIsRunning(false);
        } else {
          setResults(prev => ({
            ...prev,
            terminalOutput: prev.terminalOutput + event.data + '\n'
          }));
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setResults(prev => ({
          ...prev,
          terminalOutput: prev.terminalOutput + '\nConnection error\n'
        }));
        setIsRunning(false);
      };

    } catch (error) {
      setResults({
        terminalOutput: `Execution failed: ${error.message}`
      });
      setIsRunning(false);
    }
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
    
    // 只生成当前选择的数据集的数据
    const chartData = [{
      name: '当前值',
      performance: Math.random() * 5 + 1, // 随机生成1-6之间的性能值
      ptarget: 3.5, // 固定的中期指标值
      consumption: Math.random() * 10 + 5, // 随机生成5-15之间的性能功耗比
      ctarget: 8.0 // 固定的性能功耗比中期指标值
    }];
    
    setChartData(chartData);
  };

  // 处理流程图中模块的点击事件
  const handleModuleClick = (module) => {
    switch (module) {
      case '统一编程框架CGA':
        setShowMiddlePanel(true);
        setShowRightPanel(false);
        setActiveTab('device-cga');
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
        if (!frameworkSelection.framework) {
          setSelectedAlgorithm('framework');
        }
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
            // 添加注释说明代码来源
            const convertedCode = `# 从${frameworkSelection.framework}框架转换生成的${algorithmName.toUpperCase()}算法代码\n\n${cgaCode}`;
            
            console.log();
            // 更新设备端CGA代码
            setEditedCodes(prev => ({
              ...prev,
              'device-cga': convertedCode
            }));
            
            // 激活设备端CGA代码选项卡
            setShowMiddlePanel(true);
            setActiveTab('device-cga');
            // 图算法选择框保持为"框架转换生成"但内部代码显示对应算法的代码
            setSelectedAlgorithm(algorithmName);
            
            // 启用CGA代码的动画效果
            setCgaAnimationEnabled(true);
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
        // 显示底部面板
        setShowBottomPanels(true);
        // 执行程序
        handleRun();
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
                    {/* 这里放置日志内容 */}
                    <pre>{results.terminalOutput || '日志内容将在这里显示...'}</pre>
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
                    p: 2,
                    borderRadius: 1,
                  }}>
                    {/* 性能图表 */}
                    {chartData.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                        <Tabs
                          value={chartMetric}
                          onChange={(e, v) => setChartMetric(v)}
                          sx={{ mb: 3, alignSelf: 'flex-start' }}
                        >
                          <Tab label="性能" value="performance" style={{ fontWeight: 'bold', color: 'black' }} />
                          <Tab label="性能功耗比" value="consumption" style={{ fontWeight: 'bold', color: 'black' }} />
                        </Tabs>
                        {chartMetric === 'performance' && (
                          <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                            width={550}
                            height={350}
                          >
                            <text
                              x="50%"
                              y={20}
                              textAnchor="middle"
                              style={{ fontSize: '16px', fontWeight: 'bold' }}
                            >
                              {`${selectedAlgorithm.toUpperCase()} 在 ${selectedDataset} 数据集上的性能测试结果`}
                            </text>
                            <YAxis
                              label={{
                                value: `性能值(${getYAxisUnit('performance')})`,
                                angle: -90,
                                position: 'insideLeft'
                              }}
                            />
                            <XAxis stroke="#000000" />
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
                        )}
                        {chartMetric === 'consumption' && (
                          <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                            width={550}
                            height={350}
                          >
                            <text
                              x="50%"
                              y={20}
                              textAnchor="middle"
                              style={{ fontSize: '16px', fontWeight: 'bold' }}
                            >
                              {`${selectedAlgorithm.toUpperCase()} 在 ${selectedDataset} 数据集上的功耗比测试结果`}
                            </text>
                            <YAxis
                              label={{
                                value: `性能值(${getYAxisUnit('consumption')})`,
                                angle: -90,
                                position: 'insideLeft'
                              }}
                            />
                            <XAxis stroke="#000000" />
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
                        性能总结将在执行完成后显示...
                      </Typography>
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
