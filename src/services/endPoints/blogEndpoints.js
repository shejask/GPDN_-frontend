const blogRoutes = {
  // Blog posts endpoints
  FetchNewsAndBlogs: "/blog/FetchNewsAndBlogs",
  dislikeNewsAndBlogs: "/blog/NewsAndBlogsDislike",
  likeNewsAndBlogs: "/blog/NewsAndBlogsLike",
  SearchNewsAndBlogs: "/blog/SearchNewsAndBlogs",
  FetchNewsAndBlogsById: "/blog/FetchNewsAndBlogsById",
  createNewsAndBlogs: "/blog/AddNewsAndBlogs",
  filterNewsAndBlogs: "/blog/filterNewsAndBlogs",
  filterBlogsbyCategory: "/blog/categoryBasedBlog",

  
  // Comment endpoints
  addComment: "/blog/AddComment",
  editComment: "/blog/EditComment",
  deleteComment: "/blog/DeleteComment",
  commentlikes: "/blog/CommentLikes",
  commentdislikes: "/blog/CommentDislikes",
  realtimeReplies: "/blog/Real-time-replies"
};
  
export default blogRoutes;  