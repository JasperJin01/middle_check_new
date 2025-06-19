import { Box, IconButton, Tooltip, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useState, useEffect } from 'react';
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

// 添加全局样式覆盖Prism默认样式
// font-size 是黑色字体的大小
const customPrismStyles = `
  pre[class*="language-"], code[class*="language-"] {
    font-size: 0.85rem !important;
    background-color: #f8f8f8 !important;
  }
  .token {
    font-size: 0.75rem !important;
  }
`;

const CodeDisplay = ({ code, onCodeChange, editable = false, originalCode = null, language = 'cpp' }) => {
  const [isEditable, setIsEditable] = useState(false);
  const [editedCode, setEditedCode] = useState(code);
  const [highlightedCode, setHighlightedCode] = useState('');

  // 当传入的code变化时更新本地状态
  useEffect(() => {
    setEditedCode(code);
  }, [code]);

  // 添加自定义样式到DOM
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = customPrismStyles;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 当代码或语言变化时，更新高亮代码
  useEffect(() => {
    if (!isEditable) {
      try {
        // 使用语言关键字映射到Prism支持的语言
        let prismLanguage = language;
        if (language === 'mlir') {
          // 如果是MLIR，使用C++作为替代的语法高亮
          prismLanguage = 'cpp';
        } else if (language === 'hardware') {
          // 硬件指令使用普通文本
          prismLanguage = 'plaintext';
        }

        const highlighted = Prism.highlight(
          editedCode || '',
          Prism.languages[prismLanguage] || Prism.languages.plaintext,
          prismLanguage
        );
        setHighlightedCode(highlighted);
      } catch (error) {
        console.error('语法高亮处理错误:', error);
        setHighlightedCode(editedCode || '');
      }
    }
  }, [editedCode, language, isEditable]);

  const handleEdit = () => {
    setIsEditable(true);
  };

  const handleSave = () => {
    setIsEditable(false);
    if (onCodeChange) {
      onCodeChange(editedCode);
    }
  };

  const handleReset = () => {
    // 如果提供了originalCode，用它来重置，否则保持当前code
    const resetCode = originalCode !== null ? originalCode : code;
    setEditedCode(resetCode);
    if (onCodeChange) {
      onCodeChange(resetCode);
    }
  };

  const handleCodeChange = (e) => {
    setEditedCode(e.target.value);
  };

  return (
    <Box sx={{ 
      position: 'relative', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {editable && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '4px',
          }}
        >
          <Stack direction="row" spacing={0.5}>
            {!isEditable ? (
              <Tooltip title="编辑代码">
                <IconButton onClick={handleEdit} size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="保存代码">
                <IconButton onClick={handleSave} size="small" color="primary">
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="重置为初始代码">
              <IconButton onClick={handleReset} size="small" color="error">
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      )}
      
      {isEditable ? (
        <Box
          component="textarea"
          value={editedCode}
          onChange={handleCodeChange}
          sx={{
            color: '#333',
            p: 2,
            borderRadius: 1,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
            fontSize: '0.85rem', // 模版代码的大小
            flexGrow: 1,
            width: '100%',
            height: '100%',
            maxHeight: '500px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            border: '1px solid #e0e0e0',
            m: 0,
            boxSizing: 'border-box',
            resize: 'none',
            outline: 'none',
            '&:focus': {
              borderColor: 'primary.main',
              boxShadow: '0 0 0 1px rgba(25, 118, 210, 0.2)',
            },
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { background: '#f5f5f5' },
            '&::-webkit-scrollbar-thumb': { 
              background: '#bdbdbd',
              borderRadius: '3px',
              '&:hover': { background: '#9e9e9e' }
            },
            scrollbarWidth: 'thin',
            scrollbarColor: '#bdbdbd #f5f5f5',
          }}
        />
      ) : (
        <Box
          component="pre"
          className={`language-${language}`}
          sx={{
            color: '#333',
            p: 2,
            borderRadius: 1,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
            flexGrow: 1,
            width: '100%',
            height: '100%',
            maxHeight: '500px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            border: '1px solid #e0e0e0',
            m: 0,
            boxSizing: 'border-box',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { background: '#f5f5f5' },
            '&::-webkit-scrollbar-thumb': { 
              background: '#bdbdbd',
              borderRadius: '3px',
              '&:hover': { background: '#9e9e9e' }
            },
            scrollbarWidth: 'thin',
            scrollbarColor: '#bdbdbd #f5f5f5',
            '& .token': {
              fontSize: '0.85rem !important',
            } // 彩色字体的大小
          }}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      )}
    </Box>
  );
};

export default CodeDisplay;