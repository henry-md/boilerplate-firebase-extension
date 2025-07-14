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
      <div className="flex flex-col space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Boilerplate Chrome Extension</h2>
          <p className="text-sm text-gray-600">Signed in as: {user.email}</p>
        </div>

        {paymentStatus === 'paid' ? (
          <div className="text-sm text-gray-600">Premium Active</div>
        ) : (
          <button
            onClick={handleUpgrade}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Upgrade to Premium'}
          </button>
        )}

        <button onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Popup;
