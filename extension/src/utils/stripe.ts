// src/utils/stripe.ts
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { FirebaseError } from 'firebase/app';

const PRICE_ID = 'price_1Rk4yCFMpQHsTX0mHPa6SOkn'; // Replace with your actual Stripe price ID

/**
 * Check if user has completed payment for premium features
 */
export async function checkPaymentStatus(userId: string): Promise<boolean> {
  try {
    console.log('Checking payment status for userId:', userId);

    // Check in customers/{userId}/payments
    const paymentsRef = collection(db, 'customers', userId, 'payments');
    const querySnapshot = await getDocs(paymentsRef);
    console.log('Customer payments found:', querySnapshot.size, querySnapshot);
    
    // Check each payment document
    for (const doc of querySnapshot.docs) {
      const paymentData = doc.data();
      console.log('Payment data found:', paymentData);
      if (paymentData.status === 'succeeded') {
        return true;
      }
      
      // Uncomment the following to verify exact payment amount
      // if ((paymentData.amount === 999 || paymentData.amount === '999') && 
      //     paymentData.currency === 'usd' &&
      //     paymentData.status === 'succeeded') {
      //   console.log('Valid payment found in customer payments');
      //   return true;
      // }
    }

    // Also check in root payments collection as fallback
    const rootPaymentsRef = collection(db, 'payments');
    const rootQuery = query(rootPaymentsRef, 
      where('customer', '==', userId)
    );
    const rootSnapshot = await getDocs(rootQuery);
    console.log('Root payments found:', rootSnapshot.size);

    for (const doc of rootSnapshot.docs) {
      const paymentData = doc.data();
      console.log('Root payment data found:', paymentData);
      
      if ((paymentData.amount === 999 || paymentData.amount === '999') && 
          paymentData.currency === 'usd' &&
          paymentData.status === 'succeeded') {
        console.log('Valid payment found in root payments');
        return true;
      }
    }

    console.log('No valid payments found');
    return false;

  } catch (error) {
    console.error('Error checking payment status:', error);
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      console.log('Permission denied when checking payments');
      return false;
    }
    throw error;
  }
}

/**
 * Create a Stripe checkout session for premium upgrade
 */
export async function createCheckoutSession(userId: string, userEmail: string): Promise<string> {
  try {
    const checkoutSessionRef = collection(
      db,
      'customers',
      userId,
      'checkout_sessions'
    );

    const sessionData = {
      price: PRICE_ID,
      success_url: chrome.runtime.getURL('success.html'),
      cancel_url: chrome.runtime.getURL('cancel.html'),
      mode: 'payment',
      metadata: {
        userId: userId,
        userEmail: userEmail,
        product: 'video_speed_controller_premium'
      }
    };

    console.log('Creating checkout session...');
    const docRef = await addDoc(checkoutSessionRef, sessionData);
    console.log('Checkout session created:', docRef.id);

    // Wait for the checkout session URL to be generated
    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(docRef, (snap) => {
        const data = snap.data();
        console.log('Session data:', data);

        if (data?.error) {
          console.error('Checkout error:', data.error);
          unsubscribe();
          reject(new Error(data.error.message || 'Checkout session creation failed'));
        }
        
        if (data?.url) {
          console.log('Payment URL available:', data.url);
          unsubscribe();
          resolve(data.url);
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        unsubscribe();
        reject(new Error('Timeout waiting for checkout session'));
      }, 30000);
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}
