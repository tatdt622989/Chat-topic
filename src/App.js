import React, { useState, useReducer, useEffect, useMemo } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./scss/App.scss";
import Home from "./views/Home";
import Login from "./views/Login";
import Signup from "./views/Signup";
import EmailSend from "./views/EmailSend";
import Toast from "./components/Toast";
import "./Firebase";
import GlobalContext from "./GlobalContext";

const initialState = {
  userEmail: "",
  userName: "",
  userPhotoUrl: "",
  toastList: [],
  isLogin: false,
};

function setToastList(editableState, action) {
  if (action === 'add') {
    // editableState.toastList.push({
    //   action: action.action,
    //   title: action.title,
    //   content: action.content,
    // });
    editableState.toastList.push(action.payload);
  }
  if (action === 'delete' && action.index) {
    editableState.splice(action.index, 1);
  }
  return editableState;
}

function reducer(state, action) {
  const editableState = {...state};
  switch (action.type) {
    case "setUserEmail":
      editableState.userEmail = action.payload;
      return editableState;
    case "setToastList":
      return setToastList(editableState, action.payload);
    case "setIsLogin":
      return editableState.isLogin = action.payload;
    default:
      throw new Error();
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const contextValue = useMemo(() => ({state, dispatch}), [state, dispatch]);

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

  return (
    <div className="App">
      <GlobalContext.Provider value={contextValue}>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/email-send" element={<EmailSend />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="*" element={<Login />}></Route>
        </Routes>
      </GlobalContext.Provider>
    </div>
  );
}

export default App;
