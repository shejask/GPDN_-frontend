"use client";

import { message as antdMessage, App } from 'antd';
import React, { createContext, useContext, useRef } from 'react';

// Create a context for the message instance
const MessageContext = createContext(null);

// Create a statically accessible message instance
let staticMessage = null;

// Message provider component that uses Ant Design's App component
export function MessageProvider({ children }) {
  return (
    <App message={antdMessage}>
      {children}
    </App>
  );
}

// Custom hook to use message within components
export function useMessage() {
  return antdMessage;
}

// Create a message API that works properly with Ant Design v5
const message = {
  success: (content, duration, onClose) => {
    if (typeof window !== 'undefined') {
      // Use App's message context
      return antdMessage.success(content, duration, onClose);
    }
  },
  error: (content, duration, onClose) => {
    if (typeof window !== 'undefined') {
      return antdMessage.error(content, duration, onClose);
    }
  },
  warning: (content, duration, onClose) => {
    if (typeof window !== 'undefined') {
      return antdMessage.warning(content, duration, onClose);
    }
  },
  info: (content, duration, onClose) => {
    if (typeof window !== 'undefined') {
      return antdMessage.info(content, duration, onClose);
    }
  },
  loading: (content, duration, onClose) => {
    if (typeof window !== 'undefined') {
      return antdMessage.loading(content, duration, onClose);
    }
  }
};

export default message;
