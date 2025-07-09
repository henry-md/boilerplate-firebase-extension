import './App.css'

function App() {
  return (
    <>
      <h1>Firebase Auth Extension</h1>
      <div id="userInfo"></div>
      <button id="signInButton">Sign In</button>
      <button id="signOutButton" style={{ display: "none" }}>Sign Out</button>
      <script src="popup.js"></script>
    </>
  )

  
}

export default App
