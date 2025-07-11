import { Box, IconButton, Tooltip, LinearProgress, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import request from '@/lib/request/request';

// 引入 Prism 的浅色主题样式
import 'prismjs/themes/prism.css';
// 引入常用语言支持
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-asm6502';  // 6502汇编
import 'prismjs/components/prism-nasm';     // NASM汇编

// 添加全局样式覆盖Prism默认样式
// font-size 是黑色字体的大小
const customPrismStyles = `
  .editor-container {
    position: relative;
    width: 100%;
    // 这边调整代码高度，实际上自动高度效果就挺好，似乎是在calculateEditorHeight已经调整了
    // height: auto;
    // max-height: 100%;
    // min-height: 100px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #fbfbfb;
    overflow: hidden;
    font-family: monospace;
  }
  
  .editor-textarea,
  .editor-highlight,
  .editor-highlight pre,
  .editor-highlight code,
  .editor-highlight .token,
  pre[class*="language-"],
  code[class*="language-"] {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
    letter-spacing: normal !important;
    tab-size: 4 !important;
    -moz-tab-size: 4 !important;
  }
  
  /* 修改注释的颜色为绿色 */
  .token.comment {
    color: #4aa467 !important;
    font-weight: bold !important;
    font-style: normal !important;
  }
  
  .editor-textarea {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 16px;
    margin: 0;
    border: none;
    resize: none;
    background-color: transparent;
    color: transparent;
    caret-color: black;
    outline: none;
    overflow: auto;
    white-space: pre;
    z-index: 2;
    box-sizing: border-box;
  }
  
  .editor-highlight {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 16px;
    margin: 0;
    overflow: auto;
    white-space: pre;
    pointer-events: none;
    z-index: 1;
    box-sizing: border-box;
  }
  
  .editor-highlight pre {
    margin: 0;
    padding: 0;
    background: transparent;
  }
  
  .editor-highlight code {
    display: block;
    background: transparent;
  }

  .save-button {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 4px;
  }
  
  .progress-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 8px;
    background-color: rgba(255, 255, 255, 0.9);
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;


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
    datasets: ['Rmat-16','Rmat-18', 'Rmat-20','euroroad', 'physics'],
  },
  'ppr': {
    url: 'ppr',
    datasets: ['Rmat-16','Rmat-18','Rmat-20','smallgraph', 'physics', 'facebook'],
  },
  'gcn': {
    url: 'gcn',
    datasets: ['Rmat-16','Rmat-17','Rmat-18', 'cora'],
  }
};

const CodeDisplay = ({ 
  code, 
  onCodeChange,
  language = 'cpp',
  animated = false,
  showSaveButton = false,
  algorithm = 'bfs', // 当前选择的算法
  dataset = 'nodataset', // 当前选择的数据集
  onIRChange = () => {}, // 当IR代码更新时的回调
  onSave = () => {} // 当保存触发时的回调
}) => {
  const [editedCode, setEditedCode] = useState(code);
  const [highlightedCode, setHighlightedCode] = useState('');
  const [linesDisplayed, setLinesDisplayed] = useState(0);
  const [codeLines, setCodeLines] = useState([]);
  const [editorHeight, setEditorHeight] = useState('auto');
  const [isCodeModified, setIsCodeModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [parentHeight, setParentHeight] = useState(0);  // 添加父容器高度状态
  const originalCodeRef = useRef(code);
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const containerRef = useRef(null);
  const resizeObserverRef = useRef(null);  // 添加ResizeObserver引用

  // 设置ResizeObserver来监听父容器大小变化
  useEffect(() => {
    if (!containerRef.current) return;

    // 获取Paper容器（向上查找到Paper组件）
    const findPaperContainer = (element) => {
      while (element && !element.classList.contains('MuiPaper-root')) {
        element = element.parentElement;
      }
      return element;
    };

    const paperContainer = findPaperContainer(containerRef.current);
    if (!paperContainer) return;

    console.log('Found Paper container:', paperContainer);

    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        console.log('Paper container height:', height);
        setParentHeight(height);
      }
    });

    resizeObserverRef.current.observe(paperContainer);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  // 计算编辑器高度
  const calculateEditorHeight = () => {
    if (!editedCode || !containerRef.current || !parentHeight) return;
    
    // 创建临时元素来测量文本高度
    const tempDiv = document.createElement('div');
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.position = 'absolute';
    tempDiv.style.fontFamily = '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace';
    tempDiv.style.fontSize = '14px';
    tempDiv.style.lineHeight = '1.6';
    tempDiv.style.whiteSpace = 'pre';
    tempDiv.style.padding = '16px';
    tempDiv.style.width = `${containerRef.current.clientWidth - 32}px`; // 减去padding
    tempDiv.textContent = editedCode;
    document.body.appendChild(tempDiv);
    
    // 计算内容高度并添加一些额外空间
    const contentHeight = tempDiv.clientHeight + 3; 

    document.body.removeChild(tempDiv);
    
    // 设置最大高度限制
    const maxHeight = Math.min(550, parentHeight - 150); // 取固定值和父容器高度的最小值

    // 如果内容高度超过最大高度，则使用最大高度，否则使用内容高度
    const calculatedHeight = Math.min(contentHeight, maxHeight);
    
    console.log('Parent & calculated height:', parentHeight, calculatedHeight);
    
    setEditorHeight(`${calculatedHeight}px`);
  };

  // 同步滚动
  const syncScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // 设置滚动事件监听
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('scroll', syncScroll);
      return () => {
        textarea.removeEventListener('scroll', syncScroll);
      };
    }
  }, []);

  // 当传入的code变化时更新本地状态
  useEffect(() => {
    setEditedCode(code);
    originalCodeRef.current = code;
    setIsCodeModified(false);
    
    // 如果有动画效果，初始时重置已显示的行数
    if (animated) {
      setLinesDisplayed(0);
      // 将代码分割成行
      setCodeLines((code || '').split('\n'));
    }
  }, [code, animated]);

  // 添加自定义样式到DOM
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = customPrismStyles;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 动画效果：逐行显示代码
  useEffect(() => {
    if (!animated || codeLines.length === 0) return;

    // 根据代码长度决定显示速度和每次显示的行数
    const isLongCode = codeLines.length > 30;
    const linesPerStep = 1;
    const intervalTime = isLongCode ? 50 : 80;
    
    const interval = setInterval(() => {
      setLinesDisplayed(prev => {
        const newValue = prev + linesPerStep;
        if (newValue >= codeLines.length) {
          clearInterval(interval);
          return codeLines.length;
        }
        return newValue;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [animated, codeLines]);

  // 当代码变化时，计算高度和更新高亮代码
  useEffect(() => {
    try {
      // 使用语言关键字映射到Prism支持的语言
      let prismLanguage = language;
      if (language === 'mlir') {
        // 如果是MLIR，使用C++作为替代的语法高亮
        prismLanguage = 'cpp';
      } else if (language === 'hardware') {
        // 硬件指令使用汇编语法基础
        prismLanguage = 'asm6502'; // 或其他适合的语言
      }

      let codeToHighlight = editedCode;
      
      // 处理动画效果
      if (animated) {
        codeToHighlight = codeLines.slice(0, linesDisplayed).join('\n');
      }
      
      // 高亮代码
      const highlighted = Prism.highlight(
        codeToHighlight || '',
        Prism.languages[prismLanguage] || Prism.languages.plaintext,
        prismLanguage
      );
      
      setHighlightedCode(highlighted);
      
      // 计算编辑器高度
      calculateEditorHeight();
      
      // 代码更新后确保滚动同步
      setTimeout(syncScroll, 0);
    } catch (error) {
      console.error('语法高亮处理错误:', error);
      setHighlightedCode(editedCode || '');
    }
  }, [editedCode, language, animated, codeLines, linesDisplayed]);

  // 窗口大小变化时重新计算高度
  useEffect(() => {
    const handleResize = () => calculateEditorHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 当父容器高度变化时重新计算编辑器高度
  useEffect(() => {
    if (parentHeight > 0) {
      calculateEditorHeight();
    }
  }, [parentHeight]);

  // 检查代码是否被修改
  useEffect(() => {
    // 仅当编辑后的代码与原始代码不同时，设置修改状态为true
    setIsCodeModified(editedCode !== originalCodeRef.current);
  }, [editedCode]);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setEditedCode(newCode);
    
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  // NOTE 负责处理保存代码的函数
  const handleSaveCode = async () => {
    console.log('保存代码:', editedCode);
    
    // 检查并提取特定算法的参数值
    if (algorithm === 'ppr') {
      // 使用正则表达式提取maxiter值
      const maxiterRegex = /self\.CGAprop\.maxiter\s*=\s*(\d+)/;
      const match = editedCode.match(maxiterRegex);
      if (match && match[1]) {
        console.log('检测到PPR的maxiter值:', match[1]);
      }
    } else if (algorithm === 'kcore') {
      // 使用正则表达式提取K值
      const kRegex = /self\.K\s*:\s*int\s*=\s*(\d+)/;
      const match = editedCode.match(kRegex);
      if (match && match[1]) {
        console.log('检测到KCore的K值:', match[1]);
      }
    }
    
    // 触发父组件的保存回调
    onSave();
    
    try {
      setIsSaving(true);
      setProgressMessage('正在保存代码...');
      setProgress(10);

      // 步骤1: 将修改后的CGA代码写入后端
      const algorithmUrl = algorithmMappings[algorithm]?.url || algorithm;
      const writeUrl = `${request.BASE_URL}/part3/write/1/${algorithmUrl}/`;
      console.log(`调用API: ${writeUrl}`);
      
      const writeResponse = await fetch(writeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: editedCode }),
      });

      if (!writeResponse.ok) {
        throw new Error(`保存代码失败: ${writeResponse.statusText}`);
      }

      console.log('代码保存成功，准备执行');
      setProgress(20);
      setProgressMessage('代码保存成功，正在验证...');
      
      // 步骤2: 执行代码 - 处理流式响应
      const actualDataset = dataset || 'nodataset';
      const executeUrl = `${request.BASE_URL}/part3/execute/1/${algorithm}/${actualDataset}/`;
      console.log(`调用API: ${executeUrl}`);
      
      // 获取响应但不立即等待其完成
      const executeResponse = await fetch(executeUrl);
      
      if (!executeResponse.ok) {
        throw new Error(`执行代码失败: ${executeResponse.statusText}`);
      }

      // 获取响应的可读流
      const reader = executeResponse.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let executionOutput = '';
      
      // 跟踪执行进度
      setProgress(30);
      let progressValue = 30;
      
      // 处理流式数据
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log("流式响应接收完毕");
          break;
        }
        
        // 解码并添加到输出
        const chunk = decoder.decode(value, { stream: true });
        executionOutput += chunk;
        
        // 更新进度消息，显示最新的输出行
        const lines = executionOutput.split('\n');
        if (lines.length > 0) {
          const lastLine = lines[lines.length - 1].trim();
          if (lastLine) {
            setProgressMessage(`执行中: ${lastLine}`);
          }
        }
        
        // 逐渐更新进度条
        progressValue = Math.min(85, progressValue + 4); // 从30%最多更新到85%
        setProgress(progressValue);
      }
      
      console.log('代码执行完成，准备获取结果');
      setProgress(90);
      
      // 步骤3: 获取执行结果
      const resultUrl = `${request.BASE_URL}/part3/result/1/${algorithm}/`;
      console.log(`调用API: ${resultUrl}`);
      
      const resultResponse = await fetch(resultUrl);
      
      if (!resultResponse.ok) {
        throw new Error(`获取结果失败: ${resultResponse.statusText}`);
      }

      // 解析结果数据
      const resultData = await resultResponse.json();
      console.log('获取结果成功:', resultData);
      
      // 提取IR代码和硬件指令
      const graphIR = resultData.data.GraphIR ? resultData.data.GraphIR.join('\n') : null;
      const matrixIR = resultData.data.MatrixIR ? resultData.data.MatrixIR.join('\n') : null;
      const hardwareInstructions = resultData.data.asm ? resultData.data.asm.join('\n') : null;
      console.log('graphIR', graphIR);
      console.log('matrixIR', matrixIR);
      console.log('hardwareInstructions', hardwareInstructions);
      
      // 通知父组件更新IR代码
      onIRChange({
        graphIR,
        matrixIR,
        hardwareInstructions
      });

      // 完成进度条
      setProgress(100);
      setProgressMessage('验证完成!');
      
      // 3秒后隐藏进度条
      setTimeout(() => {
        setIsSaving(false);
        setProgress(0);
        setProgressMessage('');
      }, 3000);
      
      // 更新原始代码引用，使得保存按钮消失
      originalCodeRef.current = editedCode;
      setIsCodeModified(false);
      
    } catch (error) {
      console.error('处理请求时出错:', error);
      setProgressMessage(`错误: ${error.message}`);
      
      // 出错时也隐藏进度条，但稍晚一些
      setTimeout(() => {
        setIsSaving(false);
        setProgress(0);
        setProgressMessage('');
      }, 5000);
    }
  };

  // 渲染保存按钮的条件：需要显示保存按钮 AND 代码已被修改
  const shouldShowSaveButton = showSaveButton && isCodeModified && !isSaving;

  return (
    <Box sx={{ height: editorHeight, minHeight: '100px', maxHeight: '550px' }}>
      <div className="editor-container" ref={containerRef} style={{ height: editorHeight }}>
        {shouldShowSaveButton && (
          <Tooltip title="保存代码">
            <IconButton 
              onClick={handleSaveCode} 
              size="small" 
              color="primary"
              className="save-button"
              disabled={isSaving}
            >
              <SaveIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        
        {isSaving && (
          <div className="progress-container">
            <Typography variant="body2" color="primary">
              {progressMessage}
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </div>
        )}
        
        <div className="editor-highlight" ref={highlightRef}>
          <pre>
            <code 
              className={`language-${language}`}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        </div>
        <textarea
          ref={textareaRef}
          value={animated ? codeLines.slice(0, linesDisplayed).join('\n') : editedCode}
          onChange={handleCodeChange}
          className="editor-textarea"
          spellCheck="false"
          disabled={isSaving}
        />
      </div>
    </Box>
  );
};

export default CodeDisplay;