import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BookStep1 from "./pages/BookStep1";
import BookStep2 from "./pages/BookStep2";
import BookStep3 from "./pages/BookStep3";
import Confirmation from "./pages/Confirmation";
import { BookingProvider } from "./context/BookingContext";
import { AuthProvider } from "./context/AuthContext";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Events from "./pages/admin/Events";
import Teachers from "./pages/admin/Teachers";
import Timetable from "./pages/admin/Timetable";

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book/details" element={<BookStep1 />} />
            <Route path="/book/teachers" element={<BookStep2 />} />
            <Route path="/book/review" element={<BookStep3 />} />
            <Route path="/book/confirmed" element={<Confirmation />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/events" element={<Events />} />
            <Route path="/admin/teachers" element={<Teachers />} />
            <Route path="/admin/timetable" element={<Timetable />} />
          </Routes>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
