const resourceRoutes = {
    fetchResources: "/resource/fetchResource",
    createResource: "/resource/AddResource",
    editResource: "/resource/EditResource",
    deleteResource: "/resource/DeleteResource",
    fetchResourceByAuthor: "/resource/fetchResourceByAuthorId",
    fetchResourceById: "/resource/fetchResourceById", // ID will be appended to this path
    fetchtags: "/resource/ResourceFilter",
    fetchResourcebytag: "/resource/tagsBasedResource",
  };

export default resourceRoutes;