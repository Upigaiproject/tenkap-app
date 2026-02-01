import { Routes, Route, Link } from 'react-router-dom';
import HeatMapPage from './pages/HeatMapPage';
import SMSAnalytics from './pages/SMSAnalytics';
import Users from './pages/Users';

function App() {
  return (
    <div>
      {/* Simple Admin Nav */}
      <nav className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center px-6 gap-6 shadow-sm">
        <span className="font-bold text-lg mr-4">TENKAP Admin</span>
        <Link to="/" className="text-gray-600 hover:text-purple-600 font-medium">Heat Map</Link>
        <Link to="/users" className="text-gray-600 hover:text-purple-600 font-medium">Users</Link>
        <Link to="/sms" className="text-gray-600 hover:text-purple-600 font-medium">SMS Analytics</Link>
      </nav>

      {/* Main Content - Full Height minus Nav */}
      <div className="pt-14 h-screen">
        <Routes>
          <Route path="/" element={<HeatMapPage />} />
          <Route path="/users" element={<Users />} />
          <Route path="/sms" element={<SMSAnalytics />} />
        </Routes>
      </div>
    </div>
  );
}

export default App
