'use client';

import React from 'react';

export default function EmbeddedPage() {
  const url = 'http://disgraphui.xning.site:5380';
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      height: '100vh',
      paddingTop: '5px'
    }}>
      <div style={{
        width: '100%',  // 增加宽度
        height: '90vh', // 增加高度
        transformOrigin: 'top center', // 从顶部中心缩放
      }}>
        <iframe
          src={url}
          width="100%"
          height="100%"
          title="Embedded Page"
          style={{
            border: 'none',
            borderRadius: '8px'
          }}
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms"
          allow="same-origin allow-scripts allow-popups allow-forms allow-storage-access-by-user-activation"
        ></iframe>
      </div>
    </div>
  );
}
