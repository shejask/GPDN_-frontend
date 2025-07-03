// This file provides compatibility between Ant Design v5 and React
// Based on recommendations from https://u.ant.design/v5-for-19

import React from 'react';

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Mock the legacy findDOMNode method that Ant Design depends on
if (isBrowser && typeof React.findDOMNode !== 'function') {
  React.findDOMNode = (component) => {
    if (!component) {
      return null;
    }
    
    if (typeof component === 'string') {
      return document.querySelector(component);
    }
    
    return component instanceof Element ? component : component.nodeType ? component : null;
  };
}

// Set up compatibility for Ant Design's render function
if (isBrowser) {
  window.ANTD_ENABLE_REACT_18_SUPPORT = true;
  
  // Patch for message component specifically
  if (typeof window.ANTD_MESSAGE_ENABLE_REACT_18_SUPPORT === 'undefined') {
    window.ANTD_MESSAGE_ENABLE_REACT_18_SUPPORT = true;
  }
}

export default React;
