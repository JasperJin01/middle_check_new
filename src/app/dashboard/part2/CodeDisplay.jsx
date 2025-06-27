import { Box } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';

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
    height: 100%;
    min-height: 500px;
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
`;

const CodeDisplay = ({ 
  code, 
  onCodeChange,
  language = 'cpp',
  animated = false
}) => {
  const [editedCode, setEditedCode] = useState(code);
  const [highlightedCode, setHighlightedCode] = useState('');
  const [linesDisplayed, setLinesDisplayed] = useState(0);
  const [codeLines, setCodeLines] = useState([]);
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);

  // 同步滚动
  const syncScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // 当传入的code变化时更新本地状态
  useEffect(() => {
    setEditedCode(code);
    
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

  // 当代码变化时，更新高亮代码
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
      
      // 代码更新后确保滚动同步
      setTimeout(syncScroll, 0);
    } catch (error) {
      console.error('语法高亮处理错误:', error);
      setHighlightedCode(editedCode || '');
    }
  }, [editedCode, language, animated, codeLines, linesDisplayed]);

  const handleCodeChange = (e) => {
    setEditedCode(e.target.value);
    if (onCodeChange) {
      onCodeChange(e.target.value);
    }
  };

  return (
    <Box sx={{ height: '100%', minHeight: '500px' }}>
      <div className="editor-container">
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
        />
      </div>
    </Box>
  );
};

export default CodeDisplay;