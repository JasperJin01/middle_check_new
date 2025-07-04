// src/components/CustomTabs.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
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

// 添加存储更新后的IR代码
const updatedIRCodes = {
  'graph-ir': null,
  'matrix-ir': null,
  'hardware-instruction': null
};

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
  editedCodes = {},
  onCodeChange,
  animatedTabs = [],
  frameworkSelection = { framework: '', algorithm: '' },
  setFrameworkSelection = () => {},
  visibleIRTabs = [],
  cgaAnimationEnabled = false,
  onSave = () => {}
}) => {
  // 为每个面板类型创建独立的状态标识符
  const panelId = useMemo(() => `${panelType}-panel`, [panelType]);
  
  const [tabValue, setTabValue] = useState(-1); // 初始值为-1，表示没有选中任何选项卡
  const [visibleTabs, setVisibleTabs] = useState([]); // 记录哪些选项卡是可见的
  const [selectedFramework, setSelectedFramework] = useState('');
  const [selectedExistingAlgorithm, setSelectedExistingAlgorithm] = useState('');
  const [activeAnimatedTabs, setActiveAnimatedTabs] = useState([]);
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

  // 同步外部传入的需要动画的选项卡
  useEffect(() => {
    setActiveAnimatedTabs(animatedTabs);
  }, [animatedTabs]);

  // 同步本地状态和props中的框架选择
  useEffect(() => {
    setSelectedFramework(frameworkSelection.framework);
    setSelectedExistingAlgorithm(frameworkSelection.algorithm);
  }, [frameworkSelection]);
  
  // 当本地状态变化时，更新props中的框架选择
  useEffect(() => {
    setFrameworkSelection({
      framework: selectedFramework,
      algorithm: selectedExistingAlgorithm
    });
  }, [selectedFramework, selectedExistingAlgorithm, setFrameworkSelection]);

  // 获取选项卡索引
  const getTabIndex = (tab) => {
    const tabList = panelType === 'middle' ? tabsConfig.middle : tabsConfig.right;
    return tabList.findIndex(item => item.id === tab);
  };

  // 根据activeTab决定显示哪个选项卡
  useEffect(() => {
    if (!activeTab) return;
    
    const tabIndex = getTabIndex(activeTab);
    if (tabIndex !== -1) {
      // 如果这个选项卡还没有显示，添加到可见选项卡列表
      if (!visibleTabs.includes(tabIndex)) {
        const newVisibleTabs = [...visibleTabs, tabIndex].sort((a, b) => a - b);
        setVisibleTabs(newVisibleTabs);
        // 找出新添加的选项卡在排序后的位置
        const newTabPosition = newVisibleTabs.indexOf(tabIndex);
        setTabValue(newTabPosition);
      } else {
        // 选项卡已存在，直接切换
        setTabValue(visibleTabs.indexOf(tabIndex));
      }
    }
  }, [activeTab, panelType]); // 移除visibleTabs依赖，避免循环更新

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
    
    // 当手动切换选项卡时，清除该选项卡的动画效果
    const tabList = panelType === 'middle' ? tabsConfig.middle : tabsConfig.right;
    const selectedTabId = tabList[visibleTabs[newValue]]?.id;
    
    if (selectedTabId && activeAnimatedTabs.includes(selectedTabId)) {
      setActiveAnimatedTabs(prev => prev.filter(tab => tab !== selectedTabId));
    }
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

  // 处理IR代码更新
  const handleIRUpdate = (irData) => {
    console.log('IR代码已更新:', irData);
    
    // 更新存储的IR代码
    if (irData.graphIR) updatedIRCodes['graph-ir'] = irData.graphIR;
    if (irData.matrixIR) updatedIRCodes['matrix-ir'] = irData.matrixIR;
    if (irData.hardwareInstructions) updatedIRCodes['hardware-instruction'] = irData.hardwareInstructions;
  };

  // 获取要显示的代码内容，优先使用更新后的IR代码
  const getCodeContent = (codeType, algorithm = selectedAlgorithm) => {
    // 检查是否存在更新后的IR代码
    if (['graph-ir', 'matrix-ir', 'hardware-instruction'].includes(codeType) && updatedIRCodes[codeType]) {
      return updatedIRCodes[codeType];
    }

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
      // 如果算法是'custom'(模版)，则显示对应的模版IR代码
      if (algorithm === 'custom' && codeData[codeType]['custom']) {
        return codeData[codeType]['custom'];
      }
      // 否则显示具体算法的IR代码，如果不存在则回退到BFS
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
      .map(index => {
        const tab = tabList[index];
        // 如果是IR相关选项卡，检查是否在visibleIRTabs中
        if (tab && ['graph-ir', 'matrix-ir', 'hardware-instruction'].includes(tab.id)) {
          return visibleIRTabs.includes(tab.id) ? tab : null;
        }
        return tab;
      })
      .filter(Boolean);
      
    if (visibleTabItems.length === 0) {
      return null;
    }
    const primaryPurple = '#625BF6';
    return (
      <Tabs 
        value={tabValue} 
        onChange={handleChange}
        sx={{
          mb: 1.5,
          margin: '0',
          minHeight: '44px', // 这个和tab的minHeight共同调整按钮高度
          '& .MuiTabs-flexContainer': {
            borderBottom: `2px solid ${primaryPurple}60`
          },
          // 不添加就会导致tab间距很大（默认是24px我也不知道为什么）
          '& .MuiButtonBase-root.MuiTab-root+.MuiButtonBase-root.MuiTab-root': {
            marginLeft: '4px'
          },
          '& .MuiTab-root': {
            fontSize: '0.9rem',
            padding: '6px 20px',
            transition: 'all 0.3s',
            borderRadius: '6px 6px 0 0',
            '&:not(.Mui-selected):hover': {
              backgroundColor: `${primaryPurple}20`,
              color: primaryPurple
            }
          },
          '& .Mui-selected': {
            backgroundColor: primaryPurple,
            color: 'white !important'
          },
          '& .MuiTabs-indicator': {
            height: 2,
            backgroundColor: primaryPurple
          }
        }}
      >
        {visibleTabItems.map((tab, index) => (
          <Tab 
            key={tab.id} 
            label={tab.label}
            sx={{ margin: 0, minHeight: '44px' }}
          />
        ))}
      </Tabs>
    );
  };

  // 渲染选项卡的内容
  const renderTabContent = (tabType, isAnimated) => {
    switch(tabType) {
      case 'device-cga':
        return (
          <CodeDisplay 
            code={selectedAlgorithm === 'custom' && editedCodes['device-cga'] ? editedCodes['device-cga'] : getCodeContent('device-cga')} 
            onCodeChange={(newCode) => handleCodeChange(newCode, 'device-cga')}
            language="python"
            animated={cgaAnimationEnabled}
            showSaveButton={true}
            algorithm={selectedAlgorithm}
            dataset={selectedDataset}
            onIRChange={handleIRUpdate}
            onSave={onSave}
          />
        );
        
      case 'host-code':
        return (
          <CodeDisplay 
            code={getCodeContent('host-code')} 
            onCodeChange={(newCode) => handleCodeChange(newCode, 'host-code')}
            language="cpp"
            animated={false}
          />
        );
        
      case 'existing-framework':
        return (
          <>
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
              language="python"
              animated={false}
            />
          </>
        );
        
      case 'graph-ir':
        return (
          <CodeDisplay 
            code={getCodeContent('graph-ir')} 
            onCodeChange={(newCode) => handleCodeChange(newCode, 'graph-ir')}
            language="mlir"
            animated={isAnimated}
          />
        );
        
      case 'matrix-ir':
        return (
          <CodeDisplay 
            code={getCodeContent('matrix-ir')} 
            onCodeChange={(newCode) => handleCodeChange(newCode, 'matrix-ir')}
            language="mlir"
            animated={isAnimated}
          />
        );
        
      case 'hardware-instruction':
        return (
          <CodeDisplay 
            code={getCodeContent('hardware-instruction')} 
            onCodeChange={(newCode) => handleCodeChange(newCode, 'hardware-instruction')}
            language="hardware"
            animated={isAnimated}
          />
        );
        
      default:
        return <Typography>内容不可用</Typography>;
    }
  };

  // 根据activeTab和panelType决定显示什么内容
  const renderContent = () => {
    const tabList = panelType === 'middle' ? tabsConfig.middle : tabsConfig.right;
    
    // 如果没有可见选项卡，显示提示信息
    if (visibleTabs.length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">
            请从左侧选择要查看的内容
          </Typography>
        </Box>
      );
    }
    
    return (
      <>
        {visibleTabs.map((tabIndex, idx) => {
          const tab = tabList[tabIndex];
          if (!tab) return null;

          const tabType = tab.id;
          const isAnimated = activeAnimatedTabs.includes(tabType);
          
          // 对于IR相关选项卡，检查是否在visibleIRTabs中
          if (['graph-ir', 'matrix-ir', 'hardware-instruction'].includes(tabType) && 
              !visibleIRTabs.includes(tabType)) {
            return null;
          }
          
          return (
            <TabPanel 
              key={`${panelId}-panel-${tabType}`} 
              value={tabValue} 
              index={idx}
            >
              {renderTabContent(tabType, isAnimated)}
            </TabPanel>
          );
        })}
      </>
    );
  };

  // 组件初始化和清理
  useEffect(() => {
    // 组件卸载时重置状态
    return () => {
      setVisibleTabs([]);
      setTabValue(-1);
    };
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      {renderTabs()}
      {renderContent()}
    </Box>
  );
};

export default SelectTab;