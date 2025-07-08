'use client';

import { Box, Paper, Button } from '@mui/material';
import { useState, useEffect } from 'react';

const Page = () => {
  // 默认视频文件路径
  const defaultVideoPath = '/middle_check.mp4';
  const [videoUrl, setVideoUrl] = useState(defaultVideoPath);
  const [videoError, setVideoError] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setVideoError(false);
    }
  };

  // 处理视频加载错误
  const handleVideoError = () => {
    console.log('视频加载失败:', videoUrl);
    setVideoError(true);
  };

  return (
    <Box sx={{ p: 1, height: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {videoError && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            component="label"
            sx={{ mr: 2 }}
          >
            选择视频文件
            <input
              type="file"
              hidden
              accept="video/*"
              onChange={handleFileSelect}
            />
          </Button>
        </Box>
      )}
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          height: 'calc(100% - 80px)',
          width: '90%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Box
          component="video"
          controls
          sx={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            display: videoError ? 'none' : 'block'
          }}
          src={videoUrl}
          onError={handleVideoError}
        />
        {videoError && !videoUrl && (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary'
            }}
          >
            无法加载默认视频，请选择要播放的视频文件
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Page; 