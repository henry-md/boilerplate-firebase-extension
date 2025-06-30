import React, { useState, useEffect } from "react";
import { auth, signInWithEmailAndPassword } from "./firebase";
import { onAuthStateChanged } from "firebase/auth/web-extension";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import type { User } from "firebase/auth";

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        console.log('Logged in!')
      }
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        {user ? (
          <div>
            <p>Signed in as {user.email}</p>
          </div>
        ) : (
          <form onSubmit={handleSignIn}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="submit">Sign in with Email</button>
            {error && <div style={{ color: "red" }}>{error}</div>}
          </form>
        )}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
};

export default App;
