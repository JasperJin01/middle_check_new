'use client';

import React from 'react';

export default function EmbeddedPage() {
  const url = 'http://disgraphui.xning.site:5380';
  return (
    <div
      style={{
        width: '1700px',
        height: '100vh',
        transform: 'scale(0.8)', // 可根据需要调整缩放比例
        transformOrigin: 'top left',
      }}
    >
      <iframe
        src={url}
        width="100%"
        height="100%"
        title="Embedded Page"
        style={{
          border: 'none',
        }}
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-forms"
        allow="same-origin allow-scripts allow-popups allow-forms allow-storage-access-by-user-activation"
      ></iframe>
    </div>
  );
}
