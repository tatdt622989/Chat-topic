import React, { useState, useReducer, useEffect, useMemo } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./scss/App.scss";
import Home from "./views/Home";
import Login from "./views/Login";
import Signup from "./views/Signup";
import Toast from "./components/Toast";
import "./Firebase";
import GlobalContext from "./GlobalContext";
import RequireAuth from "./router/RequireAuth";

const initialState = {
  userId: "",
  userEmail: "",
  userName: "",
  userPhotoURL: "",
  userChannelList: [],
  userDescription: "",
  toastList: [],
};

function reducer(state, action) {
  const editableState = { ...state };
  switch (action.type) {
    case "setUserEmail":
      editableState.userEmail = action.payload;
      return editableState;
    case "setUserName":
      editableState.userName = action.payload;
      return editableState;
    case "setUserPhotoURL":
      editableState.userPhotoURL = action.payload;
      return editableState;
    case "setUserId":
      editableState.userId = action.payload;
      return editableState;
    case "setUserChannelList":
      editableState.userChannelList = action.payload;
      return editableState;
    case "setUserDescription":
      editableState.userDescription = action.payload;
      return editableState;
    case "setToastList":
      const obj = {
        theme: action.payload.theme,
        action: action.payload.action,
        title: action.payload.title,
        content: action.payload.content,
        id: action.payload.id,
      }
      if (action.payload.action === "add") {
        editableState.toastList = [...editableState.toastList, obj];
      } else if (action.payload.action === "delete") {
        editableState.toastList = editableState.toastList.filter((item) => item.id !== action.payload.id);
      }
      return editableState;
    default:
      throw new Error();
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  // 讓重複的值不會導致元件重新渲染
  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  useEffect(() => {
    try {
      const userEmail = localStorage.getItem("emailForSignIn");
      if (!state.userEmail) {
        dispatch({ type: "setUserEmail", payload: userEmail });
      }
    } catch (error) {
      console.log(error);
    }
  }, [state.userEmail]);

  useEffect(() => {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }, []);

  return (
    <div className="App">
      <GlobalContext.Provider value={contextValue}>
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route
            path="/channel/:channelId"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          ></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="*" element={<Login />}></Route>
        </Routes>
      </GlobalContext.Provider>
    </div>
  );
}

export default App;
