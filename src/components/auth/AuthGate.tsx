import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/** Opens the auth modal when navigation requests sign-in (e.g. protected dashboard). */
export default function AuthGate() {
  const location = useLocation();
  const { openAuthModal } = useAuth();

  useEffect(() => {
    const state = location.state as { authRequired?: boolean } | null;
    if (state?.authRequired) {
      openAuthModal();
    }
  }, [location.state, location.pathname, openAuthModal]);

  return null;
}
