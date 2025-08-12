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

const PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID as string;
const ITEM_DESCRIPTION = import.meta.env.VITE_ITEM_DESCRIPTION as string;
const TEST_FLAG = import.meta.env.VITE_TEST_FLAG as string === 'true';
const TEST_FLAG_PREMIUM = import.meta.env.VITE_TEST_FLAG_PREMIUM as string === 'true';

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

    const PUBLIC_SUCCESS_URL = import.meta.env.VITE_PUBLIC_SUCCESS_URL as string;
    const PUBLIC_CANCEL_URL = import.meta.env.VITE_PUBLIC_CANCEL_URL as string;

    if (!PRICE_ID) {
      throw new Error('VITE_STRIPE_PRICE_ID is not set');
    }
    if (!PUBLIC_SUCCESS_URL || !PUBLIC_CANCEL_URL) {
      throw new Error('VITE_PUBLIC_SUCCESS_URL or VITE_PUBLIC_CANCEL_URL is not set');
    }

    const sessionData = {
      price: PRICE_ID,
      success_url: PUBLIC_SUCCESS_URL,
      cancel_url: PUBLIC_CANCEL_URL,
      mode: 'payment',
      metadata: {
        userId: userId,
        userEmail: userEmail,
        product: ITEM_DESCRIPTION // Just used for transaction metadata — does nothing functional.
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
