// src/components/CustomTabs.jsx
import { useState, useEffect, useRef } from 'react';
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
const SelectTab = ({ 
  activeTab, 
  selectedAlgorithm, 
  selectedDataset, 
  panelType, 
  activeModules,
  editedCodes = {},
  onCodeChange
}) => {
  const [tabValue, setTabValue] = useState(-1); // 初始值为-1，表示没有选中任何选项卡
  const [visibleTabs, setVisibleTabs] = useState([]); // 记录哪些选项卡是可见的
  const [selectedFramework, setSelectedFramework] = useState('');
  const [selectedExistingAlgorithm, setSelectedExistingAlgorithm] = useState('');
  // 保存原始代码的引用，用于重置
  const originalCodesRef = useRef({
    'device-cga': codeData['device-cga']['custom'],
    'host-code': codeData['host-code']['default'],
    'graph-ir': codeData['graph-ir']['bfs'],
    'matrix-ir': codeData['matrix-ir']['bfs'], 
    'hardware-instruction': codeData['hardware-instruction']['bfs']
  });
  
  // 存储选项卡配置
  const tabsConfig = useRef({
    middle: [
      { id: 'device-cga', label: '设备端CGA代码' },
      { id: 'host-code', label: '主机端代码' }
    ],
    right: [
      { id: 'existing-framework', label: '现有图计算框架' },
      { id: 'graph-ir', label: 'GraphIR' },
      { id: 'matrix-ir', label: 'MatrixIR' },
      { id: 'hardware-instruction', label: '硬件指令' }
    ]
  }).current;

  const handleCodeChange = (newCode, key) => {
    if (onCodeChange) {
      onCodeChange(newCode, key);
    }
  };

  // 获取选项卡索引
  const getTabIndex = (tab) => {
    const tabList = panelType === 'middle' ? tabsConfig.middle : tabsConfig.right;
    return tabList.findIndex(item => item.id === tab);
  };

  // 根据activeModules和activeTab决定显示哪个选项卡
  useEffect(() => {
    if (!activeTab) return;
    
    const tabIndex = getTabIndex(activeTab);
    if (tabIndex !== -1) {
      // 如果这个选项卡还没有显示，添加到可见选项卡列表
      if (!visibleTabs.includes(tabIndex)) {
        setVisibleTabs(prev => [...prev, tabIndex].sort((a, b) => a - b));
      }
      // 切换到这个选项卡
      setTabValue(visibleTabs.indexOf(tabIndex) !== -1 ? visibleTabs.indexOf(tabIndex) : visibleTabs.length);
    }
  }, [activeTab, panelType, visibleTabs]);

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

  // 获取要显示的代码内容
  const getCodeContent = (codeType, algorithm = selectedAlgorithm) => {
    // 特殊处理模板代码
    if (codeType === 'device-cga' && algorithm === 'custom') {
      // 如果存在已编辑的模板代码，返回它
      if (editedCodes['device-cga']) {
        return editedCodes['device-cga'];
      }
      // 否则返回原始模板代码
      return codeData['device-cga']['custom'];
    }

    // 对于非模板情况，使用对应算法的代码
    if (codeType === 'device-cga') {
      return codeData[codeType][algorithm || 'custom'];
    } else if (codeType === 'host-code') {
      return codeData[codeType]['default'];
    } else if (['graph-ir', 'matrix-ir', 'hardware-instruction'].includes(codeType)) {
      return codeData[codeType][algorithm] || codeData[codeType]['bfs'];
    }
    
    return '代码不可用';
  };

  // 获取原始代码用于重置
  const getOriginalCode = (codeType) => {
    return originalCodesRef.current[codeType];
  };

  // 创建选项卡
  const renderTabs = () => {
    const tabList = panelType === 'middle' ? tabsConfig.middle : tabsConfig.right;
    
    // 根据visibleTabs筛选出要显示的标签
    const visibleTabItems = visibleTabs
      .map(index => tabList[index])
      .filter(Boolean);
      
    if (visibleTabItems.length === 0) {
      return null;
    }
    
    return (
      <Tabs value={tabValue} onChange={handleChange}>
        {visibleTabItems.map((tab, index) => (
          <Tab key={tab.id} label={tab.label} />
        ))}
      </Tabs>
    );
  };

  // 根据activeTab和panelType决定显示什么内容
  const renderContent = () => {
    if (tabValue === -1 || visibleTabs.length === 0) {
      return (
        <Box sx={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          <Typography variant="body1" color="text.secondary">
            请从左侧流程图选择需要查看的内容
          </Typography>
        </Box>
      );
    }

    const tabList = panelType === 'middle' ? tabsConfig.middle : tabsConfig.right;
    const currentTabId = tabList[visibleTabs[tabValue]]?.id;
    
    if (panelType === 'middle') {
      return (
        <Box sx={{ width: '100%' }}>
          {renderTabs()}
          
          {currentTabId === 'device-cga' && (
            <TabPanel value={tabValue} index={tabValue}>
              <CodeDisplay 
                code={selectedAlgorithm === 'custom' && editedCodes['device-cga'] ? editedCodes['device-cga'] : getCodeContent('device-cga')} 
                originalCode={getOriginalCode('device-cga')}
                onCodeChange={(newCode) => handleCodeChange(newCode, 'device-cga')}
                editable={selectedAlgorithm === 'custom'}
                language="python"
              />
            </TabPanel>
          )}

          {currentTabId === 'host-code' && (
            <TabPanel value={tabValue} index={tabValue}>
              <CodeDisplay 
                code={getCodeContent('host-code')} 
                originalCode={getOriginalCode('host-code')}
                onCodeChange={(newCode) => handleCodeChange(newCode, 'host-code')}
                editable={false}
                language="cpp"
              />
            </TabPanel>
          )}
        </Box>
      );
    } else if (panelType === 'right') {
      return (
        <Box sx={{ width: '100%' }}>
          {renderTabs()}
          
          {currentTabId === 'existing-framework' && (
            <TabPanel value={tabValue} index={tabValue}>
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
                language="python"
              />
            </TabPanel>
          )}
          
          {currentTabId === 'graph-ir' && (
            <TabPanel value={tabValue} index={tabValue}>
              <CodeDisplay 
                code={getCodeContent('graph-ir')} 
                originalCode={getOriginalCode('graph-ir')}
                onCodeChange={(newCode) => handleCodeChange(newCode, 'graph-ir')}
                editable={false}
                language="mlir"
              />
            </TabPanel>
          )}
          
          {currentTabId === 'matrix-ir' && (
            <TabPanel value={tabValue} index={tabValue}>
              <CodeDisplay 
                code={getCodeContent('matrix-ir')} 
                originalCode={getOriginalCode('matrix-ir')}
                onCodeChange={(newCode) => handleCodeChange(newCode, 'matrix-ir')}
                editable={false}
                language="mlir"
              />
            </TabPanel>
          )}
          
          {currentTabId === 'hardware-instruction' && (
            <TabPanel value={tabValue} index={tabValue}>
              <CodeDisplay 
                code={getCodeContent('hardware-instruction')} 
                originalCode={getOriginalCode('hardware-instruction')}
                onCodeChange={(newCode) => handleCodeChange(newCode, 'hardware-instruction')}
                editable={false}
                language="hardware"
              />
            </TabPanel>
          )}
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