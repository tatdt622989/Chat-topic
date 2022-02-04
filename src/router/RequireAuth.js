import React, { useContext } from "react";
import GlobalContext from "../GlobalContext";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate,
  Outlet
} from "react-router-dom";

function RequireAuth({children}) {
  const { state, dispatch } = useContext(GlobalContext);
  const location = useLocation();
  const auth = state.isLogin;

  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default RequireAuth;