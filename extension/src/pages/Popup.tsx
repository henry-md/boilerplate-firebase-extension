
import React, { useEffect, useState } from 'react';
import type { User } from '../types/User';

const Popup: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    chrome.storage.local.get(['user'], (result) => {
      setUser(result.user || null);
    });
  }, []);

  useEffect(() => {
    console.log('user', user);
  }, [user]);

  const handleSignIn = () => {
    chrome.runtime.sendMessage({ action: 'signIn' }, (response) => {
      if (response?.user) setUser(response.user);
    });
  };

  const handleSignOut = () => {
    chrome.runtime.sendMessage({ action: 'signOut' }, () => {
      setUser(null);
    });
  };

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
