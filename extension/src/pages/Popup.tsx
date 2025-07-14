import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { checkPaymentStatus, createCheckoutSession } from '../utils/stripe';

const Popup: React.FC = () => {
  const { user, handleSignIn, handleSignOut } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'paid' | 'unpaid'>('loading');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('user', user);
      checkUserPaymentStatus();
    }
  }, [user]);

  const checkUserPaymentStatus = async () => {
    if (!user) return;
    
    try {
      const hasPaid = await checkPaymentStatus(user.uid);
      setPaymentStatus(hasPaid ? 'paid' : 'unpaid');
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('unpaid');
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      const checkoutUrl = await createCheckoutSession(user.uid, user.email);
      
      // Open checkout in new tab
      chrome.tabs.create({ url: checkoutUrl });
      
      // Set up listener for when user returns
      const handleTabUpdate = (_tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
        if (changeInfo.url && (
          changeInfo.url.includes('success') || 
          changeInfo.url.includes('cancel')
        )) {
          // Re-check payment status after a brief delay
          setTimeout(() => {
            checkUserPaymentStatus();
          }, 2000);
          
          chrome.tabs.onUpdated.removeListener(handleTabUpdate);
        }
      };
      
      chrome.tabs.onUpdated.addListener(handleTabUpdate);
      
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 w-80">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Boilerplate Chrome Extension</h2>
          <p className="text-gray-600 mb-4">Sign in</p>
          <button 
            onClick={handleSignIn}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'loading') {
    return (
      <div className="p-6 w-80">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-80">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Boilerplate Chrome Extension</h2>
          <p className="text-sm text-gray-600">Signed in as: {user.email}</p>
        </div>

        {paymentStatus === 'unpaid' ? (
          <div className="bg-green-50 border rounded-lg align-center">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Premium Active ✨</h3>
          </div>
        ) : (
          <button
            onClick={handleUpgrade}
            disabled={isProcessing}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium"
          >
            {isProcessing ? 'Processing...' : 'Upgrade to Premium - $9.99'}
          </button>
        )}

        <button 
          onClick={handleSignOut}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Popup;
