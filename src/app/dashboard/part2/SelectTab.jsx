// src/components/CustomTabs.jsx
import { useState, useEffect } from 'react';
import { 
  Tabs, 
  Tab, 
  Box, 
  Typography, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead
} from '@mui/material';
import { codeData } from './codeData';
import CodeDisplay from './CodeDisplay';

// TabPanel组件（内部使用）
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 1.5, px:0 }}>{children}</Box>}
    </div>
  );
}

// 主组件
const SelectTab = ({ activeTab, selectedAlgorithm, selectedDataset, panelType, activeModules }) => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedFramework, setSelectedFramework] = useState('');
  const [selectedExistingAlgorithm, setSelectedExistingAlgorithm] = useState('');
  const [editedCodes, setEditedCodes] = useState({});

  const handleCodeChange = (newCode, key) => {
    setEditedCodes(prev => ({
      ...prev,
      [key]: newCode
    }));
  };

  // 根据activeModules和activeTab决定显示哪个选项卡
  useEffect(() => {
    if (panelType === 'right') {
      if (activeTab === 'existing-framework') {
        setTabValue(0); // 强制切换到"现有图计算框架"标签
      } else if (activeTab === 'graph-ir') {
        setTabValue(1); // 强制切换到"GraphIR"标签
      } else if (activeTab === 'matrix-ir') {
        setTabValue(2); // 强制切换到"MatrixIR"标签
      } else if (activeTab === 'hardware-instruction') {
        setTabValue(3); // 强制切换到"硬件指令"标签
      }
    } else if (panelType === 'middle') {
      // 中间面板保持默认的选项卡显示
      if (activeTab === 'device-cga') {
        setTabValue(0);
      } else if (activeTab === 'host-code') {
        setTabValue(1);
      }
    }
  }, [activeModules, activeTab, panelType]);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFrameworkChange = (event) => {
    const newFramework = event.target.value;
    setSelectedFramework(newFramework);
    // 清空算法选择
    setSelectedExistingAlgorithm('');
  };

  const handleExistingAlgorithmChange = (event) => {
    const newAlgorithm = event.target.value;
    setSelectedExistingAlgorithm(newAlgorithm);
  };

  // 获取选中框架可用的算法列表
  const getAlgorithmOptions = () => {
    if (!selectedFramework) return [];
    
    if (selectedFramework === 'graphscope') {
      return [
        <MenuItem key="bfs" value="bfs">BFS</MenuItem>,
        <MenuItem key="sssp" value="sssp">SSSP</MenuItem>,
        <MenuItem key="ppr" value="ppr">PPR</MenuItem>
      ];
    } else if (selectedFramework === 'dgl') {
      return [
        <MenuItem key="gcn" value="gcn">GCN</MenuItem>
      ];
    }
    
    return [];
  };

  // 获取现有框架的代码
  const getFrameworkCode = () => {
    if (!selectedFramework || !selectedExistingAlgorithm) {
      return '请选择框架和算法';
    }
    
    try {
      return codeData['existing-framework'][selectedFramework][selectedExistingAlgorithm] || '代码不存在';
    } catch (error) {
      return '代码加载错误';
    }
  };

  // 根据activeTab和panelType决定显示什么内容
  const renderContent = () => {
    if (panelType === 'middle') {
      return (
        <Box sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={handleChange}>
            <Tab label="设备端CGA代码" />
            <Tab label="主机端代码" />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <CodeDisplay 
              code={editedCodes['device-cga'] || codeData['device-cga'][selectedAlgorithm || 'custom']} 
              onCodeChange={(newCode) => handleCodeChange(newCode, 'device-cga')}
              editable={selectedAlgorithm === 'custom'}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <CodeDisplay 
              code={editedCodes['host-code'] || codeData['host-code']['default']} 
              onCodeChange={(newCode) => handleCodeChange(newCode, 'host-code')}
              editable={false}
            />
          </TabPanel>
        </Box>
      );
    } else if (panelType === 'right') {
      return (
        <Box sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={handleChange}>
            <Tab label="现有图计算框架" />
            <Tab label="GraphIR" />
            <Tab label="MatrixIR" />
            <Tab label="硬件指令" />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel sx={{ fontSize: '1rem' }}>框架选择</InputLabel>
                <Select
                  value={selectedFramework}
                  label="框架选择"
                  onChange={handleFrameworkChange}
                  sx={{ fontSize: '0.9rem' }}
                >
                  <MenuItem value="graphscope">GraphScope</MenuItem>
                  <MenuItem value="dgl">DGL</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ flex: 1 }}>
                <InputLabel sx={{ fontSize: '1rem' }}>算法选择</InputLabel>
                <Select
                  value={selectedExistingAlgorithm}
                  label="算法选择"
                  onChange={handleExistingAlgorithmChange}
                  sx={{ fontSize: '0.9rem' }}
                  disabled={!selectedFramework}
                >
                  {getAlgorithmOptions()}
                </Select>
              </FormControl>
            </Box>

            <CodeDisplay 
              code={editedCodes['existing-framework'] || getFrameworkCode()} 
              onCodeChange={(newCode) => handleCodeChange(newCode, 'existing-framework')}
              editable={false}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <CodeDisplay 
              code={editedCodes['graph-ir'] || codeData['graph-ir'][selectedAlgorithm] || codeData['graph-ir']['bfs']} 
              onCodeChange={(newCode) => handleCodeChange(newCode, 'graph-ir')}
              editable={false}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <CodeDisplay 
              code={editedCodes['matrix-ir'] || codeData['matrix-ir'][selectedAlgorithm] || codeData['matrix-ir']['bfs']} 
              onCodeChange={(newCode) => handleCodeChange(newCode, 'matrix-ir')}
              editable={false}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <CodeDisplay 
              code={editedCodes['hardware-instruction'] || codeData['hardware-instruction'][selectedAlgorithm] || codeData['hardware-instruction']['bfs']} 
              onCodeChange={(newCode) => handleCodeChange(newCode, 'hardware-instruction')}
              editable={false}
            />
          </TabPanel>
        </Box>
      );
    }
    
    return null;
  };

  return (
    <Box sx={{ height: 'calc(100% - 120px)', overflow: 'auto' }}>
      {renderContent()}
    </Box>
  );
};

export default SelectTab;