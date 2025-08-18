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

// Test flags
const TEST_FLAG = import.meta.env.VITE_TEST_FLAG as string === 'true';
const TEST_FLAG_PREMIUM = import.meta.env.VITE_TEST_FLAG_PREMIUM as string === 'true';

// Firebase
const FIREBASE_HOSTING_URL = import.meta.env.VITE_FIREBASE_HOSTING_URL as string;

// Premium subscription
const PREMIUM_PRICE_ID = import.meta.env.VITE_PREMIUM_STRIPE_PRICE_ID as string;
const PREMIUM_PRICE_TYPE = import.meta.env.VITE_PREMIUM_PRICE_TYPE as string;
const PREMIUM_ITEM_DESCRIPTION = import.meta.env.VITE_PREMIUM_ITEM_DESCRIPTION as string;
const PREMIUM_SUCCESS_URL = `${FIREBASE_HOSTING_URL}/payment-success.html`;
const PREMIUM_CANCEL_URL = `${FIREBASE_HOSTING_URL}/payment-cancel.html`;

/**
 * Check if user has completed payment for premium features. Note that we 
 * check (1) in customers/{userId}/payments and (2) in root payments 
 * collection for defensive programming, but either should be sufficient.
 */
export async function checkPaymentStatus(userId: string): Promise<boolean> {
  try {
    console.log('Checking payment status for userId:', userId);

    // Gather all possible payment documents from both locations
    const nestedPaymentsRef = collection(db, 'customers', userId, 'payments');
    const rootPaymentsRef = collection(db, 'payments');
    
    const nestedQuery = getDocs(nestedPaymentsRef);
    const rootQueryTask = getDocs(query(rootPaymentsRef, where('customer', '==', userId)));

    // Run queries in parallel for better performance
    const [nestedSnapshot, rootSnapshot] = await Promise.all([nestedQuery, rootQueryTask]);

    const allPaymentDocs = [...nestedSnapshot.docs, ...rootSnapshot.docs];
    console.log(`Found ${nestedSnapshot.size} nested and ${rootSnapshot.size} root payments. Total: ${allPaymentDocs.length}`);

    // Validate any of the found documents against a single, consistent rule
    for (const doc of allPaymentDocs) {
      const paymentData = doc.data();
      
      // Can reference paymentData.amount or .currency for more strict validation
      let premiumPurchaseExpectedAmount = 100; // In cents
      if (TEST_FLAG) {
        premiumPurchaseExpectedAmount = TEST_FLAG_PREMIUM ? 0 : Math.pow(10, 6);
      }
      const isValid = (paymentData.status === 'succeeded' && parseInt(paymentData.amount) >= premiumPurchaseExpectedAmount); // paymentData.amount is cents
      
      if (isValid) {
        console.log('A valid payment was found.', {docId: doc.id, ...paymentData});
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

    if (!PREMIUM_PRICE_ID) {
      throw new Error('VITE_STRIPE_PRICE_ID is not set');
    }
    if (!PREMIUM_SUCCESS_URL || !PREMIUM_CANCEL_URL) {
      throw new Error('VITE_PREMIUM_SUCCESS_URL or VITE_PREMIUM_CANCEL_URL is not set');
    }

    const sessionData = {
      price: PREMIUM_PRICE_ID,
      success_url: PREMIUM_SUCCESS_URL,
      cancel_url: PREMIUM_CANCEL_URL,
      mode: PREMIUM_PRICE_TYPE,
      metadata: {
        userId: userId,
        userEmail: userEmail,
        product: PREMIUM_ITEM_DESCRIPTION
      }
    };

    console.log('Creating checkout session...', sessionData);
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
