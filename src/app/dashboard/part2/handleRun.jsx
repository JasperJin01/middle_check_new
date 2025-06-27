import { useState } from 'react';

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

// 创建handleRun函数
const useHandleRun = (algorithmMappings) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState({ terminalOutput: '' });
  
  // 获取算法URL
  const getAlgorithmUrl = (algo) => {
    return algorithmMappings[algo]?.url || algo;
  };

  const handleRun = async (selectedAlgorithm, selectedDataset, selectedFramework, showBottomPanels, setShowBottomPanels, generateChartData) => {
    if (isRunning || selectedAlgorithm === 'custom' || selectedDataset === '') {
      console.log('当前程序正在运行，或未选择算法或数据集')
      return;
    }
    
    // 显示底部面板
    setShowBottomPanels(true);

    setIsRunning(true);
    setResults({ terminalOutput: 'Connecting to server...\n' });

    try {
      const eventSource = new EventSource(`${request.BASE_URL}/part3/moni/1/${getAlgorithmUrl(selectedAlgorithm)}/${selectedDataset}/`);

      eventSource.onmessage = async (event) => {
        if (event.data === '[done]') {
          eventSource.close();
          setResults(prev => ({
            ...prev,
            terminalOutput: prev.terminalOutput + 'execution completed\n'
          }));

          // 使用示例代码作为默认值，因为不再请求实际数据
          const originalCodeDisplay = sampleCodes[selectedAlgorithm].frameworkCode;
          const transformedCode = sampleCodes[selectedAlgorithm].cgaCode;

          setResults(prev => ({
            ...prev,
            originalCodeDisplay,
            transformedCode,
            graphIR: '',
            matrixIR: '',
            hardwareInstructions: ''
          }));
          
          // 生成图表数据用于显示
          generateChartData();
          setIsRunning(false);

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

  return { handleRun, isRunning, results, setResults };
};

export default useHandleRun; 