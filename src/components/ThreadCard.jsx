/**
 * ThreadCard Component
 * 
 * A reusable component for displaying forum thread cards
 * with voting, sharing, and navigation functionality.
 * 
 * @module ThreadCard
 * @author GPDN Team
 * @version 1.0.0
 */

import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpOutlined, ArrowDownOutlined, ShareAltOutlined, MessageOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

/**
 * ThreadCard component displays a forum thread with interactive elements
 * 
 * @param {Object} props - Component props
 * @param {Object} props.thread - Thread data object
 * @param {Function} props.onUpvote - Upvote handler function
 * @param {Function} props.onDownvote - Downvote handler function
 * @param {Function} props.onShare - Share handler function
 * @param {Function} props.formatDate - Date formatter function
 * @param {Object} props.actionLoading - Loading states for actions
 * @returns {JSX.Element} Rendered component
 */
const ThreadCard = ({ 
  thread, 
  onUpvote, 
  onDownvote, 
  onShare, 
  formatDate,
  actionLoading = {}
}) => {
  if (!thread) return null;
  
  const {
    _id,
    title,
    content,
    author,
    authorId,
    createdAt,
    updatedAt,
    upvotes = [],
    downvotes = [],
    shares = 0,
    comments = [],
    tags = [],
    thumbnail
  } = thread;

  // Calculate vote count
  const voteCount = (upvotes?.length || 0) - (downvotes?.length || 0);
  
  // Truncate content for preview
  const truncateContent = (text, maxLength = 200) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Get author display name
  const getAuthorName = () => {
    if (!author) return 'Anonymous';
    if (typeof author === 'object') {
      return author.name || author.username || author.email || 'Unknown User';
    }
    return author;
  };

  // Get author avatar
  const getAuthorAvatar = () => {
    if (!author || typeof author !== 'object' || !author.profilePicture) {
      return null;
    }
    return author.profilePicture;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        {/* Thread Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3 flex-shrink-0">
              {getAuthorAvatar() ? (
                <Image 
                  src={getAuthorAvatar().startsWith('/') || getAuthorAvatar().startsWith('http') ? getAuthorAvatar() : `/${getAuthorAvatar()}`} 
                  alt={getAuthorName()}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#00A99D] text-white text-lg font-semibold">
                  {getAuthorName().charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{getAuthorName()}</h3>
              <p className="text-xs text-gray-500">
                {formatDate(createdAt)}
                {updatedAt && updatedAt !== createdAt && ' (edited)'}
              </p>
            </div>
          </div>
          
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-end">
              {tags.slice(0, 2).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <Tooltip title={tags.slice(2).join(', ')}>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full cursor-help">
                    +{tags.length - 2}
                  </span>
                </Tooltip>
              )}
            </div>
          )}
        </div>
        
        {/* Thread Content */}
        <Link href={`/forum/${_id}`} className="block group">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#00A99D] transition-colors duration-200">
            {title}
          </h2>
          
          <div className="flex mb-4">
            {thumbnail && (
              <div className="mr-4 w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                <Image 
                  src={thumbnail.startsWith('/') || thumbnail.startsWith('http') ? thumbnail : `/${thumbnail}`} 
                  alt={title}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <p className="text-gray-600 line-clamp-3">
              {truncateContent(content)}
            </p>
          </div>
        </Link>
        
        {/* Thread Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* Vote Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <button 
                onClick={onUpvote}
                disabled={actionLoading.upvote}
                className={`p-1.5 rounded-full ${
                  actionLoading.upvote ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                }`}
                aria-label="Upvote"
              >
                <ArrowUpOutlined 
                  className={`text-lg ${
                    actionLoading.upvote ? 'animate-pulse' : ''
                  }`} 
                />
              </button>
              <span className="mx-1 font-medium text-gray-700">{voteCount}</span>
              <button 
                onClick={onDownvote}
                disabled={actionLoading.downvote}
                className={`p-1.5 rounded-full ${
                  actionLoading.downvote ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                }`}
                aria-label="Downvote"
              >
                <ArrowDownOutlined 
                  className={`text-lg ${
                    actionLoading.downvote ? 'animate-pulse' : ''
                  }`} 
                />
              </button>
            </div>
            
            {/* Comments Count */}
            <Link href={`/forum/${_id}`} className="flex items-center text-gray-500 hover:text-gray-700">
              <MessageOutlined className="mr-1" />
              <span>{comments?.length || 0}</span>
            </Link>
          </div>
          
          {/* Share Button */}
          <button 
            onClick={onShare}
            disabled={actionLoading.share}
            className={`flex items-center text-gray-500 hover:text-gray-700 p-1.5 rounded-full ${
              actionLoading.share ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
            }`}
            aria-label="Share"
          >
            <ShareAltOutlined 
              className={`mr-1 ${
                actionLoading.share ? 'animate-pulse' : ''
              }`} 
            />
            <span>{shares}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

ThreadCard.propTypes = {
  thread: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
    author: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    authorId: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    upvotes: PropTypes.array,
    downvotes: PropTypes.array,
    shares: PropTypes.number,
    comments: PropTypes.array,
    tags: PropTypes.array,
    thumbnail: PropTypes.string
  }).isRequired,
  onUpvote: PropTypes.func.isRequired,
  onDownvote: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  actionLoading: PropTypes.shape({
    upvote: PropTypes.bool,
    downvote: PropTypes.bool,
    share: PropTypes.bool
  })
};

export default ThreadCard;
