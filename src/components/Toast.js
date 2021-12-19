import "../scss/Toast.scss";
import React, { useEffect, useContext, useState } from "react";
import GlobalContext from "../GlobalContext";

function ToastItem() {
  return (
    <li className="toast">
      <div className="header">
        <button className="remove">
          <span className="material-icons">close</span>
        </button>
      </div>
      <div className="content"></div>
    </li>
  )
}

function ToastRender() {
  // 全域資料及方法
  const { state, dispatch } = useContext(GlobalContext);
  const list = state.toastList ? state.toastList : [];
  const listItem = list.map((obj, i) => {
    return (
      <ToastItem key={i} />
    )
  });
  return (
    <ul className="toastList">
      {listItem}
    </ul>
  )
}

function Toast() {
  // 全域資料及方法
  const { state, dispatch } = useContext(GlobalContext);

  useEffect(() => {
    console.log(state.toastList);
  }, [state.toastList]);

  return (
    <ToastRender />
  );
}

export default Toast;
