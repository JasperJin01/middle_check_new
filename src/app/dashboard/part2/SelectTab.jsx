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
      setTabValue(0);
    }
  }, [activeModules, panelType]);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFrameworkChange = (event) => {
    setSelectedFramework(event.target.value);
  };

  const handleExistingAlgorithmChange = (event) => {
    setSelectedExistingAlgorithm(event.target.value);
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
            <CodeDisplay code={codeData['device-cga'][selectedAlgorithm] || codeData['device-cga']['bfs']} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <CodeDisplay code={codeData['host-code']['default']} />
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
                <InputLabel sx={{ fontSize: '1.3rem' }}>框架选择</InputLabel>
                <Select
                  value={selectedFramework}
                  label="框架选择"
                  onChange={handleFrameworkChange}
                  sx={{ fontSize: '1.1rem' }}
                >
                  <MenuItem value="graphscope">GraphScope</MenuItem>
                  <MenuItem value="dgl">DGL</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ flex: 1 }}>
                <InputLabel sx={{ fontSize: '1.3rem' }}>算法选择</InputLabel>
                <Select
                  value={selectedExistingAlgorithm}
                  label="算法选择"
                  onChange={handleExistingAlgorithmChange}
                  sx={{ fontSize: '1.1rem' }}
                >
                  {selectedFramework === 'graphscope' ? (
                    <>
                      <MenuItem value="bfs">BFS</MenuItem>
                      <MenuItem value="sssp">SSSP</MenuItem>
                      <MenuItem value="ppr">PPR</MenuItem>
                    </>
                  ) : (
                    <MenuItem value="gcn">GCN</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>

            <CodeDisplay 
              code={selectedFramework && selectedExistingAlgorithm 
                ? codeData['existing-framework'][selectedFramework][selectedExistingAlgorithm]
                : '请选择框架和算法'} 
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <CodeDisplay code={codeData['graph-ir'][selectedAlgorithm] || codeData['graph-ir']['bfs']} />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <CodeDisplay code={codeData['matrix-ir'][selectedAlgorithm] || codeData['matrix-ir']['bfs']} />
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <CodeDisplay code={codeData['hardware-instruction'][selectedAlgorithm] || codeData['hardware-instruction']['bfs']} />
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