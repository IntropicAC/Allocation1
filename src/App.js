import './App.css';

function App() {
  return (
    <div className="App">
      {/* Navigation */}
      <nav>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
            {/* Add more navigation links as necessary */}
          </ul>
        </nav>

        {/* Main Content Area */}
        <main id="content-area">
          {/* This is where table will go */}
          <table id="observations-table">
            <thead>
              <tr id="header-row">
                {/* headers will be inserted here */}
              </tr>
            </thead>
            <tbody>
                {/* rows will be inserted here */}
            </tbody>
          </table>
          <button className="modern-button" id="modernButton" onClick={this.onClick}>
            <span>Create Allocation</span>
          </button>
        </main>

        {/* Footer */}
        <footer>
          <p>&copy; 2023 Alex</p>
        </footer>
    </div>
  );
}

export default App;
