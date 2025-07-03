"use client";

import { message as antdMessage } from 'antd';

// Create a simple wrapper around antd message API that works in client-side only

// Create a simpler message API that works in client-side only
const customMessage = {
  success: (content, duration, onClose) => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      antdMessage.success(content, duration, onClose);
    }
  },
  error: (content, duration, onClose) => {
    if (typeof window !== 'undefined') {
      antdMessage.error(content, duration, onClose);
    }
  },
  warning: (content, duration, onClose) => {
    if (typeof window !== 'undefined') {
      antdMessage.warning(content, duration, onClose);
    }
  },
  info: (content, duration, onClose) => {
    if (typeof window !== 'undefined') {
      antdMessage.info(content, duration, onClose);
    }
  },
  loading: (content, duration, onClose) => {
    if (typeof window !== 'undefined') {
      antdMessage.loading(content, duration, onClose);
    }
  }
};

export default customMessage;
