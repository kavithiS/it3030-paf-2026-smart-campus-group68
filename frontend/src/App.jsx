import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<div className="p-8 text-center bg-white rounded-xl shadow-sm"><h1 className="text-2xl font-bold text-indigo-600">Smart Campus Booking - Project Initialized</h1></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
