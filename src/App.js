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
  userEmail: "",
  userName: "",
  userPhotoURL: "",
  toastList: [],
  isLogin: false,
};

class ToastItem {
  constructor(state, payload) {
    this.payload = payload;
    this.state = state;
  }

  updateToast() {
    console.log("update toast data!");
    const obj = {
      theme: this.payload.theme,
      action: this.payload.action,
      title: this.payload.title,
      content: this.payload.content,
      id: this.payload.id,
    };
    if (obj.action === "add") {
      this.state.toastList.push(obj);
    }
    if (obj.action === "delete") {
      const index = this.state.toastList.filter((item, i) => {
        if (item.id === obj.id) {
          return i;
        }
      });
      if (index >= 0) {
        this.state.toastList.splice(index, 1);
      }
    }
    return this.state;
  }
}

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
    case "setToastList":
      const item = new ToastItem(editableState, action.payload);
      console.log(item);
      return item.updateToast();
    case "setIsLogin":
      editableState.isLogin = action.payload;
      return editableState;
    default:
      throw new Error();
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
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

  return (
    <div className="App">
      <GlobalContext.Provider value={contextValue}>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          ></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="*" element={<Login />}></Route>
        </Routes>
      </GlobalContext.Provider>
    </div>
  );
}

export default App;
