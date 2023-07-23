import React, { useContext } from "react";
import GlobalContext from "../GlobalContext";
import { auth } from "../Firebase";
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
  const isLogin = auth.currentUser;

  if (!isLogin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

export default RequireAuth;