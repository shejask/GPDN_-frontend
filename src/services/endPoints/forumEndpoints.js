/**
 * Forum API endpoint definitions
 * Organized by HTTP method and functionality
 */
const forumRoutes = {
    // GET Methods
    fetchThread: "/thread/fetchThread",
    fetchtags: "/thread/ThreadFilter",
     
    // POST Methods
    addThread: "/thread/AddThread",
    deleteThread: "/thread/DeleteThread",
    threadSearch: "/thread/ThreadSearch",
    threadFilter: "/thread/ThreadFilter",
    addComment: "/thread/AddComment",
    deleteComment: "/thread/DeleteComment",
    tagsBasedThread: "/thread/tagsBasedThread",
    fetchThreadById: "/thread/threadById",


    
    // PATCH Methods
    editThread: "/thread/EditThread",
    threadUpvote: "/thread/ThreadUpvote",
    threadDownvote: "/thread/ThreadDownvote",
    threadShares: "/thread/ThreadShares",
    editComment: "/thread/EditComment",
    commentLikes: "/thread/CommentLikes",
    commentDislikes: "/thread/CommentDislikes",
    realTimeReplies: "/thread/Real-time-replies",
    
 
};

export default forumRoutes;

