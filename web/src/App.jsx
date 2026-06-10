import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Landing    from './pages/Landing';
import Login      from './pages/Login';
import Layout     from './components/Layout';
import Dashboard  from './pages/Dashboard';
import Messages   from './pages/Messages';
import Crew       from './pages/Crew';
import Tasks      from './pages/Tasks';
import Alerts     from './pages/Alerts';
import MissionLog from './pages/MissionLog';
import Latency    from './pages/Latency';
import Satellites from './pages/Satellites';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login"   element={<Login />} />
        <Route
          path="/app"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index                  element={<Dashboard />} />
          <Route path="messages"        element={<Messages />} />
          <Route path="crew"            element={<Crew />} />
          <Route path="tasks"           element={<Tasks />} />
          <Route path="alerts"          element={<Alerts />} />
          <Route path="log"             element={<MissionLog />} />
          <Route path="latency"         element={<Latency />} />
          <Route path="satellites"      element={<Satellites />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
