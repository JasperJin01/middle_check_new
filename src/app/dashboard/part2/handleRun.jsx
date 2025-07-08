import { useState } from 'react';
import { codeData } from './codeData';

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
  BASE_URL: 'http://10.11.74.113:8000' // 这里需要替换为实际的后端URL
};

// 解析性能数据的函数
const parsePerformance = (logLine) => {
  const match = logLine.match(/\[Simulator\]: freq=1000 MHz, \w+ performance: ([\d.]+) \w+/);
  if (match) {
    return parseFloat(match[1]);
  }
  return null;
};

// 创建handleRun函数
const useHandleRun = (algorithmMappings) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState({ terminalOutput: '' });
  
  // 获取算法URL
  const getAlgorithmUrl = (algo) => {
    return algorithmMappings[algo]?.url || algo;
  };

  const handleRun = async (selectedAlgorithm, selectedDataset, selectedFramework, showBottomPanels, setShowBottomPanels, generateChartData, editedCodes = {}) => {
    if (isRunning || selectedAlgorithm === 'custom' || selectedDataset === '') {
      console.log('当前程序正在运行，或未选择算法或数据集')
      return;
    }
    
    // 显示底部面板
    setShowBottomPanels(true);
    
    setIsRunning(true);
    setResults({ terminalOutput: 'Connecting to server...\n' });
    let performanceValue = null;

    try {
      // 检查CGA代码是否被编辑过
      const cgaCode = editedCodes['device-cga'];
      const defaultCGACode = codeData['device-cga']?.[selectedAlgorithm];
      
      // 如果没有编辑过的代码，则写入默认代码
      if (!cgaCode && defaultCGACode) {
        console.log('使用默认CGA代码');
        const algorithmUrl = algorithmMappings[selectedAlgorithm]?.url || selectedAlgorithm;
        const writeUrl = `${request.BASE_URL}/part3/write/1/${algorithmUrl}/`;
        console.log(`调用API: ${writeUrl}`);
        
        const writeResponse = await fetch(writeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: defaultCGACode }),
        });

        if (!writeResponse.ok) {
          throw new Error(`写入默认代码失败: ${writeResponse.statusText}`);
        }
        console.log('默认代码写入成功');
      }

      // 检查并提取参数值
      let paramValue = null;
      if (selectedAlgorithm === 'ppr' || selectedAlgorithm === 'kcore') {
        // 使用编辑过的代码或默认代码
        const codeToCheck = editedCodes['device-cga'] || codeData['device-cga']?.[selectedAlgorithm];
        if (codeToCheck) {
          if (selectedAlgorithm === 'ppr') {
            const maxiterRegex = /self\.CGAprop\.maxiter\s*=\s*(\d+)/;
            const match = codeToCheck.match(maxiterRegex);
            if (match && match[1]) {
              paramValue = match[1];
            }
          } else if (selectedAlgorithm === 'kcore') {
            const kRegex = /self\.K\s*:\s*int\s*=\s*(\d+)/;
            const match = codeToCheck.match(kRegex);
            if (match && match[1]) {
              paramValue = match[1];
            }
          }
        }
      }

      // 构建URL，根据算法类型添加不同的参数
      let apiUrl = `${request.BASE_URL}/part3/moni/1/${getAlgorithmUrl(selectedAlgorithm)}/${selectedDataset}/`;
      // 这里的url不要改！
      if (selectedAlgorithm === 'ppr' && paramValue) {
        apiUrl = `${request.BASE_URL}/part3editarg/moni/1/${getAlgorithmUrl(selectedAlgorithm)}/${selectedDataset}/${paramValue}/`;
      } else if (selectedAlgorithm === 'kcore' && paramValue) {
        apiUrl = `${request.BASE_URL}/part3editarg/moni/1/${getAlgorithmUrl(selectedAlgorithm)}/${selectedDataset}/${paramValue}/`;
      }
      
      console.log('API URL:', apiUrl);
      const eventSource = new EventSource(apiUrl);

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
          
          // 执行完成后才生成图表数据
          if (typeof generateChartData === 'function') {
            generateChartData(performanceValue);
          }
          
          setIsRunning(false);

        } else if (event.data === '[error]') {
          eventSource.close();
          setResults(prev => ({
            ...prev,
            terminalOutput: prev.terminalOutput + '\nExecution error\n'
          }));
          setIsRunning(false);
        } else {
          // 解析性能数据
          const value = parsePerformance(event.data);
          if (value !== null) {
            performanceValue = value;
          }
          
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