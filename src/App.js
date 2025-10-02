// src/App.jsx
import "./styles/App.css";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./components/layout/Routes";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AuthProvider } from "./hooks/useAuth";
import { SelectedEventProvider } from "./contexts/SelectedEventContext";
import { SignalRProvider } from "./contexts/SignalRContext";
import NotificationContainer from "./components/NotificationContainer";

export default function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <SignalRProvider>
            <SelectedEventProvider>
              <AppRoutes />
              <NotificationContainer />
            </SelectedEventProvider>
          </SignalRProvider>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}
