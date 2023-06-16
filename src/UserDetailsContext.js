import React from 'react';

export const UserDetailsContext = React.createContext({
  userDetails: {
    username: null,
    userId: null,
  },
  setUserDetailsNeedsUpdate: () => {},
  setUserLoggingOut: () => {},
});
UserDetailsContext.displayName = "UserDetailsContext";