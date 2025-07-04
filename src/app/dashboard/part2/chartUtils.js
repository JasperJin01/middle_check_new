/**
 * 图表工具函数 - 包含图表数据生成和处理的相关逻辑
 */
import { chartResults, defaultPerformanceValues } from './chartResults';

/**
 * 判断是否为特殊算法（kclique, ppr, gcn）
 * @param {string} algorithm - 算法名称
 * @returns {boolean} - 是否为特殊算法
 */
export const isSpecialAlgorithm = (algorithm) => {
  return ['kclique', 'ppr', 'gcn'].includes(algorithm);
};

/**
 * 判断是否为RMAT数据集
 * @param {string} dataset - 数据集名称
 * @returns {boolean} - 是否为RMAT数据集
 */
export const isRmatDataset = (dataset) => {
  return dataset && dataset.toLowerCase().includes('rmat');
};

/**
 * 获取Y轴单位
 * @param {string} algorithm - 算法名称
 * @param {string} metricType - 指标类型（'performance' 或 'consumption'）
 * @returns {string} - Y轴单位
 */
export const getYAxisUnit = (algorithm, metricType) => {
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
      performance: 'GTEPS',
      consumption: 'GTEPS/W'
    },
    'gcn': { 
      performance: 'GTOPS',
      consumption: 'GTOPS/W'
    },
  };
  
  if (algorithm && yAxisMap[algorithm]) {
    return yAxisMap[algorithm][metricType] || '';
  }
  return '';
};

/**
 * 生成图表数据
 * @param {Object} params - 参数对象
 * @param {string} params.selectedAlgorithm - 选择的算法
 * @param {string} params.selectedDataset - 选择的数据集
 * @param {Array} params.chartData - 当前图表数据
 * @param {Object} params.lastExecutedData - 最后执行的数据
 * @returns {Object} - 包含新图表数据和最后执行的数据
 */
export const generateChartData = ({ selectedAlgorithm, selectedDataset, chartData = [], lastExecutedData = {} }) => {
  // 如果没有选择算法或是自定义/框架转换，不生成数据
  if (!selectedAlgorithm || selectedAlgorithm === 'custom' || selectedAlgorithm === 'framework') {
    console.log('不生成图表数据: 无算法或是自定义/框架转换');
    return { newChartData: [], newLastExecutedData: lastExecutedData };
  }
  
  // 如果没有选择数据集，不处理
  if (!selectedDataset) {
    console.log('不生成图表数据: 无数据集');
    return { newChartData: [], newLastExecutedData: lastExecutedData };
  }
  
  console.log('开始生成图表数据:', { selectedAlgorithm, selectedDataset });
  
  // 初始化性能数据变量
  let performanceValue = 0;
  let ptargetValue = 3;
  let consumptionValue = 0;
  let ctargetValue = 8;
  let cpuPerformanceValue = 0;
  let gpuPerformanceValue = 0;
  let cpuConsumptionValue = 0;
  let gpuConsumptionValue = 0;
  
  // 检查是否为特殊算法和RMAT数据集
  const specialAlgo = isSpecialAlgorithm(selectedAlgorithm);
  const rmatDataset = isRmatDataset(selectedDataset);
  
  // 先检查chartResults中是否有对应算法和数据集的数据
  if (chartResults[selectedAlgorithm] && chartResults[selectedAlgorithm][selectedDataset]) {
    const resultData = chartResults[selectedAlgorithm][selectedDataset];
    performanceValue = resultData.find(item => item.key.includes('性能('))?.value || 0;
    ptargetValue = resultData.find(item => item.key.includes('性能指标要求'))?.value || 3;
    consumptionValue = resultData.find(item => item.key.includes('性能功耗比('))?.value || 0;
    ctargetValue = resultData.find(item => item.key.includes('性能功耗比指标要求'))?.value || 8;
    
    console.log('检查预设数据:', { 
      specialAlgo, 
      rmatDataset, 
      hasPresetData: !!chartResults[selectedAlgorithm]?.[selectedDataset],
      performanceValue,
      ptargetValue
    });
    
    // 对特定算法和RMAT数据集，获取CPU性能值和GPU性能值
    if (specialAlgo && rmatDataset) {
      cpuPerformanceValue = resultData.find(item => item.key.includes('CPU性能('))?.value || 0;
      gpuPerformanceValue = resultData.find(item => item.key.includes('GPU性能('))?.value || 0;
      
      // 计算CPU和GPU的功耗比
      cpuConsumptionValue = resultData.find(item => item.key.includes('CPU功耗比('))?.value || cpuPerformanceValue / 10;
      gpuConsumptionValue = resultData.find(item => item.key.includes('GPU功耗比('))?.value || gpuPerformanceValue / 10;
    }
  } else {
    // 如果没有预定义数据，使用默认性能值
    const defaultValues = defaultPerformanceValues[selectedAlgorithm]?.[selectedDataset];
    if (defaultValues) {
      performanceValue = defaultValues.performance['1000MHz'];
      ptargetValue = defaultValues.target.performance;
      consumptionValue = defaultValues.consumption;
      ctargetValue = defaultValues.target.consumption;
      
      console.log('使用默认性能值:', { 
        specialAlgo, 
        rmatDataset, 
        hasDefaultValues: !!defaultValues,
        performanceValue,
        ptargetValue
      });
      
      // 对特定算法和RMAT数据集，计算值（实际上是报错情况，因为必须在data中说明）
      if (specialAlgo && rmatDataset) {
        // 默认情况下，CPU性能约为加速器性能的1/10
        cpuPerformanceValue = performanceValue / 10;
        // GPU性能约为加速器性能的一半
        gpuPerformanceValue = performanceValue / 2;
        
        // 计算CPU和GPU的功耗比
        cpuConsumptionValue = consumptionValue / 5;
        gpuConsumptionValue = consumptionValue / 2;
      }
    } else {
      // 如果没有默认值，使用随机生成的数据
      performanceValue = Math.random() * 4 + 3;
      ptargetValue = 3;
      consumptionValue = Math.random() * 3 + 8;
      ctargetValue = 8;
      
      console.log('使用随机生成数据:', { 
        specialAlgo, 
        rmatDataset, 
        performanceValue,
        ptargetValue
      });
      
      if (specialAlgo && rmatDataset) {
        cpuPerformanceValue = performanceValue / 10;
        gpuPerformanceValue = performanceValue / 2;
        
        // 计算CPU和GPU的功耗比
        cpuConsumptionValue = consumptionValue / 5;
        gpuConsumptionValue = consumptionValue / 2;
      }
    }
  }
  
  // 为特定算法的rmat数据集保存历史数据
  let newChartData = [];
  let newLastExecutedData = { ...lastExecutedData };
  
  if (specialAlgo && rmatDataset) {
    // 如果算法相同，添加到现有数据中
    if (lastExecutedData.algorithm === selectedAlgorithm) {
      // 只保留RMAT数据集的历史数据
      const rmatChartData = chartData.filter(item => isRmatDataset(item.name));
      
      // 检查数据集是否已存在
      if (!lastExecutedData.datasets?.includes(selectedDataset)) {
        // 为新数据集创建图表数据
        const newDataPoint = {
          name: selectedDataset,
          performance: performanceValue,
          cpuPerformance: cpuPerformanceValue,
          gpuPerformance: gpuPerformanceValue,
          ptarget: ptargetValue,
          consumption: consumptionValue,
          cpuConsumption: cpuConsumptionValue,
          gpuConsumption: gpuConsumptionValue,
          ctarget: ctargetValue
        };
        
        // 合并现有RMAT数据和新数据
        newChartData = [...rmatChartData, newDataPoint].sort((a, b) => {
          // 按照RMAT数据集的编号排序
          const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
          const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
          return numA - numB;
        });
        
        // 更新最后执行的数据集，只保留RMAT数据集
        const rmatDatasets = (lastExecutedData.datasets || [])
          .filter(ds => isRmatDataset(ds))
          .concat(selectedDataset);
        
        newLastExecutedData = {
          algorithm: selectedAlgorithm,
          datasets: rmatDatasets
        };
      } else {
        // 如果数据集已存在，更新其值
        newChartData = rmatChartData.map(item => {
          if (item.name === selectedDataset) {
            return {
              ...item,
              performance: performanceValue,
              cpuPerformance: cpuPerformanceValue,
              gpuPerformance: gpuPerformanceValue,
              ptarget: ptargetValue,
              consumption: consumptionValue,
              cpuConsumption: cpuConsumptionValue,
              gpuConsumption: gpuConsumptionValue,
              ctarget: ctargetValue
            };
          }
          return item;
        });
      }
    } else {
      // 如果算法不同，清空现有数据
      newChartData = [{
        name: selectedDataset,
        performance: performanceValue,
        cpuPerformance: cpuPerformanceValue,
        gpuPerformance: gpuPerformanceValue,
        ptarget: ptargetValue,
        consumption: consumptionValue,
        cpuConsumption: cpuConsumptionValue,
        gpuConsumption: gpuConsumptionValue,
        ctarget: ctargetValue
      }];
      
      // 更新最后执行的算法和数据集
      newLastExecutedData = {
        algorithm: selectedAlgorithm,
        datasets: [selectedDataset]
      };
    }
  } else {
    // 对于非特定算法或非rmat数据集，创建新数据
    newChartData = [{
      name: selectedDataset,
      performance: performanceValue,
      ptarget: ptargetValue,
      consumption: consumptionValue,
      ctarget: ctargetValue
    }];
    
    // 重置最后执行的算法和数据集
    newLastExecutedData = {
      algorithm: selectedAlgorithm,
      datasets: [selectedDataset]
    };
  }
  
  console.log('生成的图表数据:', newChartData);
  return { newChartData, newLastExecutedData };
};

/**
 * 判断是否应该显示图表
 * @param {Object} params - 参数对象
 * @param {boolean} params.isRunning - 是否正在执行
 * @param {string} params.selectedAlgorithm - 选择的算法
 * @param {string} params.selectedDataset - 选择的数据集
 * @param {Object} params.lastExecutedData - 最后执行的数据
 * @param {Array} params.chartData - 当前图表数据
 * @returns {boolean} - 是否应该显示图表
 */
export const shouldShowChart = ({ isRunning, selectedAlgorithm, selectedDataset, lastExecutedData, chartData }) => {
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

/**
 * 判断是否应该显示功耗比图表
 * @param {Object} params - 参数对象
 * @param {string} params.selectedAlgorithm - 选择的算法
 * @param {Array} params.chartData - 当前图表数据
 * @param {string} params.chartMetric - 当前图表指标
 * @returns {boolean} - 是否应该显示功耗比图表
 */
export const shouldShowConsumptionChart = ({ selectedAlgorithm, chartData, chartMetric }) => {
  const specialAlgo = isSpecialAlgorithm(selectedAlgorithm);
  const rmatDataset = chartData.some(item => item.name && item.name.toLowerCase().includes('rmat'));
  
  return specialAlgo && rmatDataset && chartMetric === 'consumption';
};

/**
 * 判断是否应该显示CPU和GPU性能柱状图
 * @param {Object} params - 参数对象
 * @param {string} params.selectedAlgorithm - 选择的算法
 * @param {Array} params.chartData - 当前图表数据
 * @returns {boolean} - 是否应该显示CPU和GPU性能柱状图
 */
export const shouldShowCpuGpuBars = ({ selectedAlgorithm, chartData }) => {
  const specialAlgo = isSpecialAlgorithm(selectedAlgorithm);
  const rmatDataset = chartData.some(item => item.name && item.name.toLowerCase().includes('rmat'));
  
  return specialAlgo && rmatDataset;
};

/**
 * 判断是否应该显示参考线
 * @param {Object} params - 参数对象
 * @param {string} params.selectedAlgorithm - 选择的算法
 * @param {Array} params.chartData - 当前图表数据
 * @returns {boolean} - 是否应该显示参考线
 */
export const shouldShowReferenceLine = ({ selectedAlgorithm, chartData }) => {
  const specialAlgo = isSpecialAlgorithm(selectedAlgorithm);
  const rmatDataset = chartData.some(item => item.name && item.name.toLowerCase().includes('rmat'));
  
  return specialAlgo && rmatDataset;
}; 