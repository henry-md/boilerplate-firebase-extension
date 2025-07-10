import { useEffect, useState } from 'react';
import type { User } from '../types/User';

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    chrome.storage.local.get(['user'], (result) => {
      setUser(result.user || null);
    });
  }, []);

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

  return { user, handleSignIn, handleSignOut };
}

export default useAuth;
