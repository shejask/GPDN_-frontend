const forumRoutes = {
    // Thread Operations
    AddThread: "/thread/AddThread",
    EditThread: "/thread/EditThread",
    DeleteThread: "/thread/DeleteThread",
    ThreadUpvote: "/thread/ThreadUpvote",
    ThreadDownvote: "/thread/ThreadDownvote",
    ThreadShares: "/thread/ThreadShares",
    ThreadFilter: "/thread/ThreadFilter",
    ThreadSearch: "/thread/ThreadSearch",


    //fetch threads
    Threadfetch: "/admin/fetchThreads",

    // Comment Operations
    AddComment: "/thread/AddComment",
    EditComment: "/thread/EditComment",
    DeleteComment: "/thread/DeleteComment",
    CommentLikes: "/thread/CommentLikes",
    CommentDislikes: "/thread/CommentDislikes",
    RealTimeReplies: "/thread/Real-time-replies"
};

export default forumRoutes;

