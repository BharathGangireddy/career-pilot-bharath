import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/authStore";

import Navbar from "./components/layout/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobForm from "./pages/JobForm";
import JobDetail from "./pages/JobDetail";
import Kanban from "./pages/Kanban";
import Profile from "./pages/Profile";

// 🔒 Private Route
function PrivateRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
}

// Layout
function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >

      {/* 🔥 FIXED TOASTER */}
      <Toaster
        position="top-right"
        containerStyle={{
          top: 80,
          right: 20,
        }}
        toastOptions={{
          duration: 2500,
          style: {
            background: "rgba(17, 24, 39, 0.9)",
            color: "#fff",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
          },
          success: { icon: "✅" },
          error: { icon: "❌" },
        }}
      />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/jobs"
          element={
            <PrivateRoute>
              <AppLayout>
                <Jobs />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/jobs/new"
          element={
            <PrivateRoute>
              <AppLayout>
                <JobForm />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/jobs/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <JobDetail />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/jobs/:id/edit"
          element={
            <PrivateRoute>
              <AppLayout>
                <JobForm />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/kanban"
          element={
            <PrivateRoute>
              <AppLayout>
                <Kanban />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}