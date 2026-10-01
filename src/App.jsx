import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import InstallPrompt from './components/InstallPrompt';

function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        await fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        setLoading(true);
        await fetchUserRole(session.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    setRole(data?.role || null);
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Determine homepage based on role
  const getHomeRoute = () => {
    if (role === 'admin') return "/admin";
    if (role === 'teacher') return "/teacher";
    if (role === 'student') return "/student";
    return "/login";
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to={getHomeRoute()} />} 
        />
        
        {/* Admin only route */}
        <Route 
          path="/admin" 
          element={session && role === 'admin' ? <AdminDashboard session={session} /> : <Navigate to={getHomeRoute()} />} 
        />
        
        {/* Teacher only route */}
        <Route 
          path="/teacher" 
          element={session && role === 'teacher' ? <TeacherDashboard session={session} /> : <Navigate to={getHomeRoute()} />} 
        />

        {/* Student only route */}
        <Route 
          path="/student" 
          element={session && role === 'student' ? <StudentDashboard session={session} /> : <Navigate to={getHomeRoute()} />} 
        />
        
        {/* Catch all */}
        <Route 
          path="*" 
          element={<Navigate to={getHomeRoute()} />} 
        />
      </Routes>
      <InstallPrompt />
    </Router>
  );
}

export default App;
