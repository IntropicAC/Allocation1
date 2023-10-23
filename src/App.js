import './App.css';
import AllocationInput from './components/allocationInput';

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
          
          <table id="observations-table">
            <thead>
              <tr id="header-row">
                
              </tr>
            </thead>
            <tbody>
                
            </tbody>
          </table>
          {/*<button className="modern-button" id="modernButton">
            <span>Create Allocation</span>
  </button>*/}
          <AllocationInput/>
        </main>

        {/* Footer */}
        <footer>
          <p>&copy; 2023 Alex</p>
        </footer>
    </div>
  );
}

export default App;
