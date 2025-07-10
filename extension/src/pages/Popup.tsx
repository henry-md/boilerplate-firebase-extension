import React, { useEffect } from 'react';
import useAuth from '../hooks/useAuth';

const Popup: React.FC = () => {
  const { user, handleSignIn, handleSignOut } = useAuth();

  useEffect(() => {
    if (user) console.log('user', user);
  }, [user]);

  return (
    <div>
      <div>
        {user ? `Signed in as: ${user.email}` : 'Not signed in'}
      </div>
      {!user && (
        <button onClick={handleSignIn}>Sign In</button>
      )}
      {user && (
        <button onClick={handleSignOut}>Sign Out</button>
      )}
    </div>
  );
};

export default Popup;
