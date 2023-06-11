import "../scss/Toast.scss";
import React, { useEffect, useContext, useState } from "react";
import GlobalContext from "../GlobalContext";

function ToastItem({ title, id, content }) {
  const { state, dispatch } = useContext(GlobalContext);
  return (
    <li className="toast">
      <div className="header">
        <p className="title">{title}</p>
        <button className="remove" onClick={() => {
          dispatch({
            type: 'setToastList',
            payload: {
              action: 'delete',
              id,
            }
          });
        }}>
          <span className="material-icons">close</span>
        </button>
      </div>
      <div className="content">{content}</div>
    </li>
  )
}

function ToastRender() {
  // 全域資料及方法
  const { state, dispatch } = useContext(GlobalContext);
  const list = state.toastList ? state.toastList : [];
  const listItem = list.map((obj, i) => {
    return (
      <ToastItem key={i} title={obj.title} content={obj.content} id={obj.id} />
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
    console.log(JSON.stringify(state.toastList), 'toast list aaa');
  }, [state.toastList]);

  return (
    <ToastRender />
  );
}

export default Toast;
