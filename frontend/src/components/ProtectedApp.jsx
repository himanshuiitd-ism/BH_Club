import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProtectedApp = ({ children }) => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status when user value changes
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]); // Add user and navigate to dependencies

  // Return null or loading spinner while checking auth status
  if (user === undefined) {
    return null; // Or <LoadingSpinner />
  }

  // Only render children if user exists
  return user ? <>{children}</> : null;
};

export default ProtectedApp;
