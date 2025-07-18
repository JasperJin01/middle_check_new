"use client";
import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, Select, MenuItem, Button, Tabs, Tab, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import request from '@/lib/request/request';
import { PERFORMANCE_DATA, midtermMetrics } from './constData'

const algorithms = ['PageRank', 'k-Clique', 'GCN'];
const datasets = ['Rmat-16', 'Rmat-17', 'Rmat-18', 'Rmat-19', 'Rmat-20'];
const allDatasetsOption = 'all-datasets';

const algorithmDetails = {
  PageRank: { description: '标准图遍历算法', },
  'k-Clique': { description: '标准图挖掘算法', },
  GCN: { description: '标准图学习算法', },
};

const datasetInfo = {
  'Rmat-16': { nodes: '2^16', edges: '2^20' },
  'Rmat-17': { nodes: '2^17', edges: '2^21' },
  'Rmat-18': { nodes: '2^18', edges: '2^21' },
  'Rmat-19': { nodes: '2^19', edges: '2^22' },
  'Rmat-20': { nodes: '2^20', edges: '2^23' },
};

// 获取吞吐量单位
const getThroughputUnit = (algorithm) => {
  switch(algorithm) {
    case 'PageRank': return 'GTEPS';
    case 'k-Clique': return 'GTSPS';
    case 'GCN': return 'GOPS';
    default: return '';
  }
};


export default function Page() {
  const [selectedAlgo, setSelectedAlgo] = useState(algorithms[0]);
  const [selectedDataset, setSelectedDataset] = useState(datasets[0]);
  // 控制标签页切换
  const [tabValue, setTabValue] = useState(0);
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  const [chartMetric, setChartMetric] = useState('time');
  // 参考线（中期指标）状态
  const [showReferenceLine, setShowReferenceLine] = useState(false);
  const logBoxRef = React.useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  };

  // 监听日志变化，自动滚动
  React.useEffect(() => {
    scrollToBottom();
  }, [logs]);

  // 判断按钮是否不可用
  const isButtonDisabled = () => running;

  // 生成性能数据
  const generatePerformanceData = (res) => {
    const baseData = res.data || res; // 兼容两种数据格式
    console.log(selectedAlgo)
    console.log(selectedDataset)

    console.log(PERFORMANCE_DATA[baseData.Algorithm]["CPU-Time(s)"])
    const algorithmData = PERFORMANCE_DATA[baseData.Algorithm]; // 获取算法对应的数组
    const datasetEntry = algorithmData.find(item => item.Dataset === baseData.Dataset); // 查找匹配的数据集

    if (datasetEntry) {
      console.log(datasetEntry["CPU-Time(s)"]); // 正确获取CPU时间
      console.log(datasetEntry["ACC-Time(s)"]); // 正确获取加速器时间
    }
    
    const cpu = datasetEntry["CPU-Time(s)"];
    const accelerator = baseData["ACC-Time(s)"];
    const throughput = baseData["GTSPS"];
    const speedUp = cpu / accelerator;
    const cpuThroughput = throughput / speedUp;
  
    return {
      combinedKey: `${baseData.Algorithm}-${baseData.Dataset}`,
      algorithm: baseData.Algorithm,
      dataset: baseData.Dataset,
      nodes: baseData.Vertices,
      edges: baseData.Edges,
      cpu,
      accelerator,
      speedUp,
      throughput,
      cpuThroughput
    };
  };

  // 获取有效数据（已执行的数据集）
  const getValidData = () => {
    return performanceData
  };

  // 生成图表数据
  const getChartData = () => {
    return getValidData().map(item => ({
      ...item,
      displayName: item.dataset, // 用于显示的简化名称
      fullName: item.combinedKey // 用于tooltip显示的完整名称
    }));
  };

  const handleRun = async () => {
    if (running) return;

    setRunning(true);
  
    try {
      // 运行"全部数据集"，使用预设数据
      if (selectedDataset === allDatasetsOption) {
        setLogs(prev => [...prev, '正在加载全部数据集...']);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const allResults = PERFORMANCE_DATA[selectedAlgo].map(data => {
          const speedUp = data['CPU-Time(s)'] / data['ACC-Time(s)'];
          const cpuThroughput = data['GTSPS'] / speedUp;
          return {
            combinedKey: `${data.Algorithm}-${data.Dataset}`,
            algorithm: data.Algorithm,
            dataset: data.Dataset,
            nodes: data.Vertices,
            edges: data.Edges,
            cpu: data['CPU-Time(s)'],
            accelerator: data['ACC-Time(s)'],
            speedUp: data['Speedup'],
            throughput: data['GTSPS'],
            cpuThroughput
          };
        });
  
        setPerformanceData(allResults);
        setLogs(prev => [...prev, '全部数据集加载完成']);
        setRunning(false);
        return;
      }
  
      setLogs([`开始执行图算法 ${selectedAlgo}，数据集 ${selectedDataset}：`]);
      await new Promise(resolve => setTimeout(resolve, 200));
      setLogs(prev => [...prev, '正在与服务器建立连接...']);
      
      // 检查是否需要清空之前的数据
      const shouldClearData = performanceData.length > 0 && 
        performanceData[0].algorithm !== selectedAlgo;
  
      if (shouldClearData) {
        setPerformanceData([]);
      }
    
        let urlAlgo, urlData;
        
        // 算法URL
        switch(selectedAlgo) {
          case 'PageRank': urlAlgo = 'pagerank'; break;
          case 'k-Clique': urlAlgo = 'kclique'; break;
          case 'GCN': urlAlgo = 'gcn'; break;
          default: throw new Error(`不支持的算法: ${selectedAlgo}`);
        }
  
        // 数据集URL映射
        switch(selectedDataset) {
          case 'Rmat-16': urlData = 'rmat16'; break;
          case 'Rmat-17': urlData = 'rmat17'; break;
          case 'Rmat-18': urlData = 'rmat18'; break;
          case 'Rmat-19': urlData = 'rmat19'; break;
          case 'Rmat-20': urlData = 'rmat20'; break;
          default: throw new Error(`不支持的数据集: ${selectedDataset}`);
        }
  
        // 1. 执行流式命令
        const eventSource = new EventSource(`${request.BASE_URL}/part1/execute/${urlAlgo}/${urlData}/`);
        
        eventSource.onmessage = async (event) => {
          if (event.data === '[done]') {
            eventSource.close();
            
            // 2. 显示正在拷贝result
            setLogs(prev => [...prev, `正在拷贝 ${selectedDataset} 的result...`]);
            
            // 3. 获取最终结果
            try {
              const res = await fetch(`${request.BASE_URL}/part1/result/${urlAlgo}/${urlData}/`);
              const jsonData = await res.json();
              
              // 4. 显示完成
              setLogs(prev => [...prev, `✅ ${selectedAlgo}-${selectedDataset} 执行完成`]);
              setRunning(false);
  
              // 生成新的性能数据
              const newResult = generatePerformanceData(jsonData);
              
              // 更新性能数据
              setPerformanceData(prev => {
                const filtered = prev.filter(item => item.dataset !== selectedDataset);
                return [...filtered, newResult]
                  .sort((a, b) => datasets.indexOf(a.dataset) - datasets.indexOf(b.dataset));
              });
  

            } catch (error) {
              setLogs(prev => [...prev, `❌ 获取 ${selectedAlgo}-${selectedDataset} 结果失败: ${error.message}`]);
              setRunning(false);
            }
            
          } else if (event.data === '[error]') {
            eventSource.close();
            setLogs(prev => [...prev, `❌ 服务器执行出错：${selectedAlgo}-${selectedDataset}`]);
            setRunning(false);
          } else {
            setLogs(prev => [...prev, `${event.data}`]);
          }
        };
  
        eventSource.onerror = () => {
          eventSource.close();
          setLogs(prev => [...prev, `❌ ${selectedAlgo}-${selectedDataset} 连接错误`]);
          setRunning(false);
        };
  
        // 等待当前数据集处理完成
        await new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!eventSource.readyState || eventSource.readyState === 2) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });
      
    } catch (error) {
      setLogs(prev => [...prev, `❌ 执行失败: ${error.message}`]);
      setRunning(false);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f6fa' }}>
      <Grid container spacing={3}>
        {/* 左侧列 */}
        <Grid container item xs={12} md={4} spacing={3}>
          {/* 算法选择卡片 */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{
                fontWeight: 700,
                mb: 2,
                color: 'secondary.main',
                borderBottom: '2px solid',
                borderColor: 'secondary.main',
                pb: 1
              }}>
                算法选择
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 550, mb: 1 }}>
                选择图算法
              </Typography>
              <Select
                fullWidth
                value={selectedAlgo}
                onChange={(e) => setSelectedAlgo(e.target.value)}
                sx={{ mb: 2 }}
              >
                {algorithms.map(algo => (
                  <MenuItem key={algo} value={algo}>{algo}</MenuItem>
                ))}
              </Select>

              <Typography variant="subtitle1" sx={{ fontWeight: 550, mb: 1 }}>
                选择数据集
              </Typography>
              <Select
                fullWidth
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                sx={{ mb: 2 }}
              >
                {datasets.map(ds => (
                  <MenuItem key={ds} value={ds}>{ds}</MenuItem>
                ))}
                <MenuItem value={allDatasetsOption}>全部数据集</MenuItem>
              </Select>

              <Button
                variant="contained"
                fullWidth
                onClick={handleRun}
                disabled={isButtonDisabled()}
                color="success"
                sx={{ py: 1.5 }}
              >
                {running ? '执行中...' : '开始执行'}
              </Button>
              {running && <LinearProgress sx={{ mt: 1 }} />}
            </Paper>
          </Grid>

          {/* 算法详情卡片 */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{
                fontWeight: 700,
                mb: 2,
                color: 'secondary.main',
                borderBottom: '2px solid',
                borderColor: 'secondary.main',
                pb: 1
              }}>
                算法详情
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>算法说明:</strong> {algorithmDetails[selectedAlgo].description}
              </Typography>
            </Paper>
          </Grid>

          {/* 数据集信息卡片 */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{
                fontWeight: 700,
                mb: 2,
                color: 'secondary.main',
                borderBottom: '2px solid',
                borderColor: 'secondary.main',
                pb: 1
              }}>
                {selectedDataset === allDatasetsOption ? '数据集概览' : '数据集信息'}
              </Typography>
              {selectedDataset === allDatasetsOption ? (
                <Box>
                  {datasets.map(ds => (
                    <Box key={ds} sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{ds}:</strong>
                        节点规模： {datasetInfo[ds].nodes.toLocaleString()},
                        边规模： {datasetInfo[ds].edges.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>节点规模:</strong> {datasetInfo[selectedDataset].nodes.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>边规模:</strong> {datasetInfo[selectedDataset].edges.toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* 右侧列 */}
        <Grid container item xs={12} md={8} spacing={3}>
          {/* 控制台输出 */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{
              p: 2,
              height: 470,
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <Typography variant="h6" sx={{
                fontWeight: 700,
                mb: 2,
                color: 'secondary.main',
                borderBottom: '2px solid',
                borderColor: 'secondary.main',
                pb: 1
              }}>
                执行日志
              </Typography>
              <Box sx={{
                height: 400,
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                backgroundColor: '#1a1a1a',
                borderRadius: 2,
                p: 1.5,
                '& > div': {
                  color: '#fff',
                  lineHeight: 1.6,
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  py: 0.5,
                  '& .highlight': {
                    // color: '#4caf50',
                    fontWeight: 'bold',
                    // backgroundColor: 'rgba(255, 255, 0, 0.2)',
                    backgroundColor: 'rgba(126, 205, 136, 0.5)',
                    padding: '0 4px',
                    borderRadius: '2px'
                  }
                }
              }} ref={logBoxRef}>
                {logs.map((log, index) => {
                  // 高亮显示特定性能数据
                  let modifiedLog = log;
                  
                  // 检查性能数据行
                  if (log.includes('ACC Cycle') || 
                      log.includes('FPGA Frequency') || 
                      log.includes('PR Performace') ||
                      log.includes('Timestamp')) {
                    // 将整行标记为高亮
                    modifiedLog = <span className="highlight">{log}</span>;
                  } 
                  // 检查性能摘要区块
                  else if (log.includes('FPGA KERNEL PERFORMANCE SUMMARY') || 
                          (log.includes('|') || log.includes('+---')) && 
                          (index > 0 && 
                           (logs.slice(Math.max(0, index-10), index).some(prevLog => 
                             prevLog.includes('FPGA KERNEL PERFORMANCE SUMMARY'))))) {
                    modifiedLog = <span className="highlight">{log}</span>;
                  }
                  
                  return (<div key={index}>{`> `}{modifiedLog}</div>);
                })}
              </Box>
            </Paper>
          </Grid>

          {/* 性能对比卡片 */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{
                fontWeight: 700,
                mb: 2,
                color: 'secondary.main',
                borderBottom: '2px solid',
                borderColor: 'secondary.main',
                pb: 1
              }}>
                性能对比详情
              </Typography>

              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                  <Tab label="表格视图" />
                  <Tab label="图表视图" />
                </Tabs>
              </Box>

              {tabValue === 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>算法</TableCell>
                        <TableCell>数据集</TableCell>
                        <TableCell>节点数</TableCell>
                        <TableCell>边数</TableCell>
                        <TableCell>CPU时间(s)</TableCell>
                        <TableCell>CPU吞吐量</TableCell>
                        <TableCell>加速器时间(s)</TableCell>
                        <TableCell>加速比</TableCell>
                        <TableCell>加速器吞吐量</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getValidData().map((row) => (
                        <TableRow key={row.dataset}>
                          <TableCell>{row.algorithm}</TableCell>
                          <TableCell>{row.dataset}</TableCell>
                          <TableCell>{row.nodes.toLocaleString()}</TableCell>
                          <TableCell>{row.edges.toLocaleString()}</TableCell>
                          <TableCell>{row.cpu.toFixed(3)}</TableCell>
                          <TableCell>{`${row.cpuThroughput.toFixed(3)} ${getThroughputUnit(row.algorithm)}`}</TableCell>
                          <TableCell>{row.accelerator.toFixed(3)}</TableCell>
                          <TableCell>{row.speedUp.toFixed(3)}</TableCell>
                          <TableCell>{`${row.throughput.toFixed(3)} ${getThroughputUnit(row.algorithm)}`}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box>
                  <Tabs
                    value={chartMetric}
                    onChange={(e, v) => setChartMetric(v)}
                    sx={{ mb: 2 }}
                  >
                    <Tab label="执行时间" value="time" />
                    <Tab label="吞吐量" value="throughput" />
                  </Tabs>

                  <BarChart
                    width={800}
                    height={300}
                    data={getChartData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    onMouseEnter={() => setShowReferenceLine(true)}
                    onMouseLeave={() => setShowReferenceLine(false)}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayName" />
                    <YAxis 
                      label={{ 
                        value: chartMetric === 'time' ? '执行时间 (s)' : `吞吐量 (${getThroughputUnit(selectedAlgo)})`, 
                        angle: -90, 
                        position: 'insideLeft',
                        offset: -5,
                        style: { fill: 'black'}
                      }} 
                    />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        const systemName = selectedAlgo === 'PageRank' ? 'Ligra' : selectedAlgo === 'k-Clique' ? 'GraphPi' : 'PyG';
                        if (chartMetric === 'throughput') {
                          if (name.includes('CPU')) {
                            return [`${Number(value).toFixed(3)} ${getThroughputUnit(props.payload.algorithm)}`, systemName];
                          }
                          if (name === "加速器吞吐量") {
                            // 计算吞吐量加速比
                            const throughputSpeedup = value / props.payload.cpuThroughput;
                            return [
                              <span>
                                {Number(value).toFixed(3)} {getThroughputUnit(props.payload.algorithm)}<br/>
                                <Box sx={{ height: 12 }} />
                                <span style={{color: '#CC556A', fontWeight: 'bold'}}>加速比: {throughputSpeedup.toFixed(3)}x</span>
                              </span>,
                              "加速器"
                            ];
                          }
                        }
                        if (chartMetric === 'time') {
                          if (name.includes('CPU')) {
                            return [`${Number(value).toFixed(3)}s`, systemName];
                          }
                          if (name === "加速器时间") {
                            const speedUp = props.payload.cpu / value;
                            return [
                              <span>
                                {Number(value).toFixed(3)}s<br/>
                                <Box sx={{ height: 12 }} />
                                <span style={{color: '#CC556A', fontWeight: 'bold'}}>加速比: {speedUp.toFixed(3)}x</span>
                              </span>, 
                              "加速器"
                            ];
                          }
                        }
                        return [value, name];
                      }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0] && payload[0].payload) {
                          return payload[0].payload.fullName;
                        }
                        return label;
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '10px' }}
                      formatter={(value, entry, index) => (
                        <span style={{ marginRight: index === 0 ? '100px' : '0px' }}>
                          {value}
                        </span>
                      )}
                    />

                    {chartMetric === 'time' && (
                        <>
                            <Bar
                                dataKey="cpu"
                                fill="#7f58af"
                                name={`${selectedAlgo === 'PageRank' ? 'Ligra' : selectedAlgo === 'k-Clique' ? 'GraphPi' : 'PyG'}（Intel Xeon Gold 6338 CPU）时间`}
                                barSize={50}
                                style={{ marginRight: '20px' }}
                            />
                            <Bar
                                dataKey="accelerator"
                                fill="#64b5f6"
                                name="加速器时间"
                                barSize={50}
                                style={{ marginLeft: '20px' }}
                            />
                        </>
                    )}

                    {chartMetric === 'throughput' && (
                      <>
                        <Bar
                          dataKey="cpuThroughput"
                          fill="#9e9e9e"
                          name={`${selectedAlgo === 'PageRank' ? 'Ligra' : selectedAlgo === 'k-Clique' ? 'GraphPi' : 'PyG'}（Intel Xeon Gold 6338 CPU）吞吐量`}
                          barSize={50}
                          onMouseEnter={() => setShowReferenceLine(true)}
                          onMouseLeave={() => setShowReferenceLine(false)}
                        />
                        <Bar
                          dataKey="throughput"
                          fill="#26a69a"
                          name="加速器吞吐量"
                          barSize={50}
                          onMouseEnter={() => setShowReferenceLine(true)}
                          onMouseLeave={() => setShowReferenceLine(false)}
                        />
                        <ReferenceLine
                          y={midtermMetrics[selectedAlgo]}
                          stroke="red"
                          strokeDasharray="3 3"
                          strokeOpacity={showReferenceLine ? 1 : 0}
                          style={{
                            opacity: showReferenceLine ? 1 : 0,
                            transition: 'opacity 0.3s ease-in-out'
                          }}
                          label={{
                            value: `中期指标\n(${midtermMetrics[selectedAlgo]} ${getThroughputUnit(selectedAlgo)})`,
                            position: 'insideRight',
                            fill: 'red',
                            fontSize: 14,
                            fontWeight: 'bold', 
                            dy: -10,
                            opacity: showReferenceLine ? 1 : 0,
                            transition: 'opacity 0.3s'
                          }}
                        />
                      </>
                    )}

                  </BarChart>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
