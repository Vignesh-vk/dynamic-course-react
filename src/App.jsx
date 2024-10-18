import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import EditCourse from './components/Edit-course';
import './App.css';
import CoursePreview from './components/CoursePreview';
import Auth from './components/Auth/Auth';
import AuthGuard from './components/Auth/Authguard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        
        <Route 
          path="/dashboard" 
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          } 
        />

        <Route 
          path="/course/:id" 
          element={
            <AuthGuard allowedRoles={['instructor']}>
              <EditCourse />
            </AuthGuard>
          } 
        />

        <Route 
          path="/course/preview/:id" 
          element={
            <AuthGuard>
              <CoursePreview />
            </AuthGuard>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
