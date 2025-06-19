import { Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useState, useEffect } from 'react';

const CodeDisplay = ({ code, onCodeChange, editable = false }) => {
  const [isEditable, setIsEditable] = useState(false);
  const [editedCode, setEditedCode] = useState(code);

  useEffect(() => {
    setEditedCode(code);
  }, [code]);

  const handleEdit = () => {
    setIsEditable(true);
  };

  const handleSave = () => {
    setIsEditable(false);
    if (onCodeChange) {
      onCodeChange(editedCode);
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
        </Box>
      )}
      <Box
        component={isEditable ? 'textarea' : 'pre'}
        value={isEditable ? editedCode : undefined}
        onChange={isEditable ? handleCodeChange : undefined}
        sx={{
          backgroundColor: '#f8f8f8',
          color: '#333333',
          p: 2,
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          flexGrow: 1,
          width: '100%',
          height: '100%',
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
          '& strong': { fontWeight: 'bold' },
          '& em': { fontStyle: 'italic' },
          ...(isEditable && {
            resize: 'none',
            outline: 'none',
            display: 'block',
            '&:focus': {
              borderColor: 'primary.main',
              boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
            },
          }),
        }}
        dangerouslySetInnerHTML={!isEditable ? { __html: code } : undefined}
      />
    </Box>
  );
};

export default CodeDisplay;