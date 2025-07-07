/**
 * SkeletonLoader Component
 * 
 * A reusable component for displaying skeleton loading states
 * with customizable shapes and sizes.
 * 
 * @module SkeletonLoader
 * @author GPDN Team
 * @version 1.0.0
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * SkeletonLoader component displays animated loading placeholders
 * 
 * @param {Object} props - Component props
 * @param {string} [props.type='text'] - Type of skeleton (text, circle, rectangle, card, avatar, etc.)
 * @param {string} [props.width='100%'] - Width of the skeleton
 * @param {string} [props.height='16px'] - Height of the skeleton
 * @param {number} [props.count=1] - Number of skeleton items to display
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} Rendered component
 */
const SkeletonLoader = ({ 
  type = 'text',
  width = '100%',
  height = '16px',
  count = 1,
  className = '',
}) => {
  // Base animation class for the pulse effect
  const baseClass = 'animate-pulse bg-gray-200 rounded';
  
  // Generate skeleton based on type
  const renderSkeleton = (index) => {
    switch (type) {
      case 'circle':
        return (
          <div 
            key={index}
            className={`${baseClass} rounded-full ${className}`}
            style={{ 
              width: width, 
              height: height || width, // Make height equal to width if not specified
            }}
          />
        );
      
      case 'avatar':
        return (
          <div key={index} className="flex items-center space-x-3">
            <div 
              className={`${baseClass} rounded-full ${className}`}
              style={{ width: '40px', height: '40px' }}
            />
            <div className="space-y-2">
              <div className={`${baseClass}`} style={{ width: '120px', height: '10px' }} />
              <div className={`${baseClass}`} style={{ width: '80px', height: '8px' }} />
            </div>
          </div>
        );
      
      case 'card':
        return (
          <div 
            key={index}
            className={`${baseClass} flex flex-col space-y-3 ${className}`}
            style={{ width: width, height: height }}
          >
            <div className={`${baseClass} rounded-md`} style={{ height: '180px' }} />
            <div className="space-y-2 px-2">
              <div className={`${baseClass}`} style={{ height: '12px' }} />
              <div className={`${baseClass}`} style={{ height: '12px', width: '80%' }} />
              <div className={`${baseClass}`} style={{ height: '12px', width: '60%' }} />
            </div>
            <div className="px-2 pt-2 flex justify-between">
              <div className={`${baseClass}`} style={{ height: '20px', width: '30%' }} />
              <div className={`${baseClass}`} style={{ height: '20px', width: '15%' }} />
            </div>
          </div>
        );
      
      case 'table-row':
        return (
          <div 
            key={index}
            className={`${baseClass} flex space-x-2 ${className}`}
            style={{ width: width, height: height || '40px' }}
          >
            <div className={`${baseClass}`} style={{ height: '100%', width: '25%' }} />
            <div className={`${baseClass}`} style={{ height: '100%', width: '45%' }} />
            <div className={`${baseClass}`} style={{ height: '100%', width: '15%' }} />
            <div className={`${baseClass}`} style={{ height: '100%', width: '15%' }} />
          </div>
        );
      
      case 'forum-post':
        return (
          <div 
            key={index}
            className={`${baseClass} flex flex-col space-y-3 p-4 border border-gray-200 rounded-lg ${className}`}
            style={{ width: width }}
          >
            <div className="flex items-center space-x-3">
              <div className={`${baseClass} rounded-full`} style={{ width: '40px', height: '40px' }} />
              <div className="space-y-2 flex-1">
                <div className={`${baseClass}`} style={{ width: '150px', height: '12px' }} />
                <div className={`${baseClass}`} style={{ width: '100px', height: '10px' }} />
              </div>
              <div className={`${baseClass}`} style={{ width: '60px', height: '20px' }} />
            </div>
            <div className="space-y-2">
              <div className={`${baseClass}`} style={{ height: '16px', width: '90%' }} />
              <div className={`${baseClass}`} style={{ height: '16px', width: '95%' }} />
              <div className={`${baseClass}`} style={{ height: '16px', width: '80%' }} />
            </div>
            <div className="flex justify-between pt-2">
              <div className="flex space-x-2">
                <div className={`${baseClass} rounded-full`} style={{ width: '60px', height: '24px' }} />
                <div className={`${baseClass} rounded-full`} style={{ width: '60px', height: '24px' }} />
              </div>
              <div className={`${baseClass} rounded-full`} style={{ width: '40px', height: '24px' }} />
            </div>
          </div>
        );
      
      case 'rectangle':
        return (
          <div 
            key={index}
            className={`${baseClass} ${className}`}
            style={{ width: width, height: height }}
          />
        );
      
      case 'text':
      default:
        return (
          <div 
            key={index}
            className={`${baseClass} mb-2 ${className}`}
            style={{ width: width, height: height }}
          />
        );
    }
  };

  // Render multiple skeletons if count > 1
  return (
    <div className="skeleton-wrapper">
      {Array.from({ length: count }).map((_, index) => renderSkeleton(index))}
    </div>
  );
};

SkeletonLoader.propTypes = {
  type: PropTypes.oneOf(['text', 'circle', 'rectangle', 'card', 'avatar', 'table-row', 'forum-post']),
  width: PropTypes.string,
  height: PropTypes.string,
  count: PropTypes.number,
  className: PropTypes.string,
};

export default SkeletonLoader;
