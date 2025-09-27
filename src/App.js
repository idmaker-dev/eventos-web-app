// src/App.jsx
import "./styles/App.css";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./components/layout/Routes";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AuthProvider } from "./hooks/useAuth";
import { SelectedEventProvider } from "./contexts/SelectedEventContext";
import NotificationContainer from "./components/NotificationContainer";


export default function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <SelectedEventProvider>
            <AppRoutes />
            <NotificationContainer />
          </SelectedEventProvider>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}
