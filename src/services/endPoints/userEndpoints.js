const userRoutes = {
  userContactDetails: "/user/userContactDetails",
  userRegister: "/user/register",
  userLogin: "/user/Login",
  resetPassword: "/user/ResetORForgotPassword",
  userProfile: "/user/fetchUserById",  // Will be called with ?_id=userId
  editProfile: "/user/EditUser",
};

export default userRoutes;
