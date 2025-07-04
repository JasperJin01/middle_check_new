import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Legend, ReferenceLine, CartesianGrid } from 'recharts';
import { algorithmNameMapping } from './chartResults';
import {
  getYAxisUnit,
  shouldShowConsumptionChart,
  shouldShowCpuGpuBars,
  shouldShowReferenceLine,
  isSpecialAlgorithm,
  isRmatDataset
} from './chartUtils';

/**
 * 图表显示组件 - 负责显示算法性能图表
 * @param {Object} props - 组件属性
 * @param {Array} props.chartData - 图表数据
 * @param {string} props.selectedAlgorithm - 选择的算法
 * @param {string} props.selectedDataset - 选择的数据集
 * @param {Object} props.lastExecutedData - 最后执行的数据
 * @param {boolean} props.isRunning - 是否正在执行
 * @returns {JSX.Element} - 图表显示组件
 */
const ChartDisplay = ({ 
  chartData = [], 
  selectedAlgorithm = '', 
  selectedDataset = '',
  lastExecutedData = { algorithm: '', datasets: [] },
  isRunning = false
}) => {
  // 图表指标状态（性能或功耗比）
  const [chartMetric, setChartMetric] = useState('performance');
  
  // 参考线显示状态
  const [showReferenceLine, setShowReferenceLine] = useState(false);

  // 判断是否应该显示图表
  const shouldShowChart = () => {
    // 如果没有图表数据，不显示图表
    if (!chartData || chartData.length === 0) {
      return false;
    }
    
    // 如果正在执行
    if (isRunning) {
      const specialAlgo = isSpecialAlgorithm(selectedAlgorithm);
      const rmatDataset = isRmatDataset(selectedDataset);
      const hasPreviousData = lastExecutedData.algorithm === selectedAlgorithm && 
                             (lastExecutedData.datasets || []).length > 0;
      
      // 特殊算法+RMAT数据集+有历史数据 或 非特殊算法
      return (specialAlgo && rmatDataset && hasPreviousData) || (!specialAlgo);
    }
    
    // 如果不在执行中，有图表数据就显示
    return true;
  };

  // 如果不应该显示图表，返回提示信息
  if (!shouldShowChart()) {
    return (
      <Typography variant="body1">
        性能结果将在执行完成后显示...
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
      {/* 显示选项卡 - 只有特定算法且RMAT数据集才显示两个选项卡 */}
      {(() => {
        // IIFE: 立即调用函数表达式，用于在JSX中执行复杂逻辑
        // 判断是否为特殊算法和RMAT数据集，以决定显示哪些选项卡
        
        // 判断是否为特殊算法（kclique, ppr, gcn）
        const specialAlgo = isSpecialAlgorithm(selectedAlgorithm);
        
        // 判断是否有RMAT数据集
        const rmatDataset = chartData.some(item => 
          item.name && isRmatDataset(item.name));
        
        console.log('选项卡显示判断:', {
          specialAlgo,
          rmatDataset,
          chartMetric
        });
        
        // 如果是特殊算法且有RMAT数据集，显示两个选项卡
        return specialAlgo && rmatDataset ? (
          <Tabs
            value={chartMetric}
            onChange={(e, v) => setChartMetric(v)}
            sx={{ mb: 3, alignSelf: 'flex-start' }}
          >
            <Tab label="性能" value="performance" style={{ fontWeight: 'bold', color: 'black' }} />
            <Tab label="性能功耗比" value="consumption" style={{ fontWeight: 'bold', color: 'black' }} />
          </Tabs>
        ) : (
          // 其他情况只显示性能选项卡
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
        );
      })()}

      {/* 显示相应的图表 */}
      {(() => {
        // IIFE: 立即调用函数表达式，用于决定显示哪种类型的图表
        
        // 判断是否应该显示功耗比图表
        const showConsumption = shouldShowConsumptionChart({
          selectedAlgorithm,
          chartData,
          chartMetric
        });
        
        console.log('图表类型判断:', {
          selectedAlgorithm,
          chartMetric,
          showConsumption
        });
        
        // 根据条件显示不同类型的图表
        return showConsumption ? (
          // 功耗比图表
          <BarChart
            data={chartData}
            margin={{ top: 50, right: 20, left: 20, bottom: 20 }}
            width={480}
            height={380}
            onMouseEnter={() => setShowReferenceLine(true)}
            onMouseLeave={() => setShowReferenceLine(false)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
            <text
              x="50%"
              y={15}
              textAnchor="middle"
              style={{ fontSize: '16px', fontWeight: 'bold', fill: 'black' }}
            >
              {`${algorithmNameMapping[selectedAlgorithm] || selectedAlgorithm.toUpperCase()} 功耗比测试结果`}
            </text>
            <YAxis
              label={{
                value: `性能功耗比(${getYAxisUnit(selectedAlgorithm, 'consumption')})`,
                angle: -90,
                position: 'insideLeft',
                style: { fill: 'black'}
              }}
              tick={{ fill: 'black' }}
              axisLine={{ stroke: 'black' }}
            />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'black' }}
              axisLine={{ stroke: 'black' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ 
                fontSize: '14px', 
                paddingTop: '10px',
                color: 'black',
                // fontWeight: 'bold'
              }}
            />
            {/* 对于特定算法和RMAT数据集，显示CPU和GPU功耗比 */}
            {(() => {
              // 判断是否应该显示CPU和GPU功耗比
              const showCpuGpuBars = shouldShowCpuGpuBars({
                selectedAlgorithm,
                chartData
              });
              
              return showCpuGpuBars && (
                <>
                  <Bar
                    dataKey="cpuConsumption"
                    fill="#9e9e9e"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                    name={'CPU功耗比'}
                    label={{
                      position: 'top',
                      formatter: (value) => value ? value.toFixed(4) : '0.0000'
                    }}
                    onMouseEnter={() => setShowReferenceLine(true)}
                    onMouseLeave={() => setShowReferenceLine(false)}
                  />
                  <Bar
                    dataKey="gpuConsumption"
                    fill="#ff9800"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                    name={'GPU功耗比'}
                    label={{
                      position: 'top',
                      formatter: (value) => value ? value.toFixed(4) : '0.0000'
                    }}
                    onMouseEnter={() => setShowReferenceLine(true)}
                    onMouseLeave={() => setShowReferenceLine(false)}
                  />
                </>
              );
            })()}
            <Bar
              dataKey="consumption"
              fill="#1976d2"
              name={'加速器功耗比'}
              radius={[4, 4, 0, 0]}
              barSize={40}
              label={{
                position: 'top',
                formatter: (value) => value.toFixed(4)
              }}
              onMouseEnter={() => setShowReferenceLine(true)}
              onMouseLeave={() => setShowReferenceLine(false)}
            />
            {/* 显示中期指标参考线 */}
            <ReferenceLine
              y={chartData[0]?.ctarget || 0}
              stroke="red"
              strokeDasharray="3 3"
              strokeWidth={2}
              strokeOpacity={showReferenceLine ? 1 : 0}
              style={{
                opacity: showReferenceLine ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out'
              }}
              label={{
                value: `中期指标 (${chartData[0]?.ctarget || 0} ${getYAxisUnit(selectedAlgorithm, 'consumption')})`,
                position: 'insideBottomRight',
                fill: 'red',
                fontSize: 12,
                fontWeight: 'bold',
                opacity: showReferenceLine ? 1 : 0,
                transition: 'opacity 0.3s'
              }}
            />
          </BarChart>
        ) : (
          // 性能图表
          <BarChart
            data={chartData}
            margin={{ top: 50, right: 20, left: 20, bottom: 20 }}
            width={480}
            height={380}
            onMouseEnter={() => setShowReferenceLine(true)}
            onMouseLeave={() => setShowReferenceLine(false)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
            <text
              x="50%"
              y={15}
              textAnchor="middle"
              style={{ fontSize: '16px', fontWeight: 'bold', fill: 'black' }}
            >
              {`${algorithmNameMapping[selectedAlgorithm] || selectedAlgorithm.toUpperCase()} 性能测试结果`}
            </text>
            <YAxis
              label={{
                value: `性能值(${getYAxisUnit(selectedAlgorithm, 'performance')})`,
                angle: -90,
                position: 'insideLeft',
                style: { fill: 'black'}
              }}
              tick={{ fill: 'black' }}
              axisLine={{ stroke: 'black' }}
            />
            <XAxis 
              dataKey="name"
              tick={{ fill: 'black' }}
              axisLine={{ stroke: 'black' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ 
                fontSize: '14px', 
                paddingTop: '10px',
                color: 'black'
              }}
            />
            {/* 对于特定算法和RMAT数据集，显示CPU和GPU性能 */}
            {(() => {
              console.log('CPU/GPU性能柱状图判断:', {
                selectedAlgorithm,
                chartData
              });
              
              // IIFE: 立即调用函数表达式，用于决定是否显示CPU和GPU性能柱状图
              const showCpuGpuBars = shouldShowCpuGpuBars({
                selectedAlgorithm,
                chartData
              });
              
              // 如果应该显示CPU和GPU性能柱状图，返回相应的Bar组件
              return showCpuGpuBars && (
                <>
                  <Bar
                    dataKey="cpuPerformance"
                    fill="#9e9e9e"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                    name={'CPU性能值'}
                    label={{
                      position: 'top',
                      formatter: (value) => value.toFixed(4)
                    }}
                    onMouseEnter={() => setShowReferenceLine(true)}
                    onMouseLeave={() => setShowReferenceLine(false)}
                  />
                  <Bar
                    dataKey="gpuPerformance"
                    fill="#ff9800"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                    name={'GPU性能值'}
                    label={{
                      position: 'top',
                      formatter: (value) => value.toFixed(4)
                    }}
                    onMouseEnter={() => setShowReferenceLine(true)}
                    onMouseLeave={() => setShowReferenceLine(false)}
                  />
                </>
              );
            })()}
            <Bar
              dataKey="performance"
              fill="#1976d2"
              radius={[4, 4, 0, 0]}
              barSize={40}
              name={'加速器性能值'}
              label={{
                position: 'top',
                formatter: (value) => value.toFixed(4)
              }}
              onMouseEnter={() => setShowReferenceLine(true)}
              onMouseLeave={() => setShowReferenceLine(false)}
            />
            {/* 显示参考线 */}
            {(() => {
              // IIFE: 立即调用函数表达式，用于决定是否显示参考线
              
              // 判断是否应该显示参考线
              const showReference = shouldShowReferenceLine({
                selectedAlgorithm,
                chartData
              });
              
              // 如果应该显示参考线，则返回ReferenceLine组件
              return showReference ? (
                <ReferenceLine
                  y={chartData[0]?.ptarget || 0}
                  stroke="red"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  strokeOpacity={showReferenceLine ? 1 : 0}
                  style={{
                    opacity: showReferenceLine ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out'
                  }}
                  label={{
                    value: `中期指标 (${chartData[0]?.ptarget || 0} ${getYAxisUnit(selectedAlgorithm, 'performance')})`,
                    position: 'insideBottomRight',
                    fill: 'red',
                    fontSize: 12,
                    fontWeight: 'bold',
                    opacity: showReferenceLine ? 1 : 0,
                    transition: 'opacity 0.3s'
                  }}
                />
              ) : null; // 不显示中期指标柱子，只显示参考线或什么都不显示
            })()}
          </BarChart>
        );
      })()}
    </Box>
  );
};

export default ChartDisplay; 