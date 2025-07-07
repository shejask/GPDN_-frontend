"use client"

// Import the compatibility utilities
import '../utils/antdCompatible';
import React, { useEffect } from 'react';
import { ConfigProvider, App, message } from 'antd';

// Provider component that applies Ant Design compatibility settings
export function AntdCompatibilityProvider({ children }) {
  useEffect(() => {
    // Ensure compatibility flags are set when the provider mounts
    if (typeof window !== 'undefined') {
      window.ANTD_ENABLE_REACT_18_SUPPORT = true;
      window.ANTD_MESSAGE_ENABLE_REACT_18_SUPPORT = true;
    }
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          // You can customize theme tokens here if needed
          colorPrimary: '#00A99D',
        },
        // Enable legacy compatibility mode
        hashed: true,
      }}
    >
      <App message={message}>
        {children}
      </App>
    </ConfigProvider>
  );
}

export default AntdCompatibilityProvider;
