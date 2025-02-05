import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import Login from "./pages/login";
import Search from "./pages/search";
import "antd/dist/reset.css";
import "./App.css";

function App() {
  return (
    <div>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to={ "/search" }/>} />  {/* ✅ default Route */}
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Private Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/search" element={<Search />} />
            </Route>

            <Route path="*" element={<Navigate to={"/"} />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
