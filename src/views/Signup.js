import "../scss/Signup.scss";
import React, { useEffect, useContext, useState, useCallback } from "react";
import GlobalContext from "../GlobalContext";
import classNames from "classnames";
import { fileUploader, updateUserData, login, createUser } from "../Firebase";
import Toast from "../components/Toast";
import { useNavigate } from "react-router-dom";
import imgToBase64 from "../utils/imgToBase64";

function Signup() {
  // 全域資料及方法
  const { state, dispatch } = useContext(GlobalContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [validation, setValidation] = useState({
    email: false,
    password: false,
    name: false,
  });
  const [isDirty, setIsDirty] = useState({
    email: false,
    password: false,
    name: false,
  });
  const [hint, setHint] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [fileUrl, setFileUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  let navigate = useNavigate();

  const pushErrorMsg = useCallback((msg) => {
    const id = Date.now();
    dispatch({
      type: "setToastList",
      payload: {
        action: "add",
        title: "發生錯誤",
        content: msg,
        theme: "error",
        id,
      },
    });
    setTimeout(() => {
      dispatch({
        type: "setToastList",
        payload: {
          action: "delete",
          id,
        },
      });
    }, 5000);
  }, [dispatch]);

  const ruleChecker = useCallback((res) => {
    const newValidation = { ...validation };
    const newHint = { ...hint };
    newValidation.name = !!username.trim();
    newValidation.email = !!email.trim();
    newValidation.password = !!password.trim();

    if (!newValidation.name) {
      newHint.name = "暱稱不能為空";
    }
    if (!newValidation.email) {
      newHint.email = "電子郵件不能為空";
    }
    if (!newValidation.password) {
      newHint.password = "密碼不能為空";
    }

    if (res && !res.status) {
      switch (res.type) {
        case "email":
          newValidation.email = false;
          if (res.msg === "auth/email-already-in-use") {
            newHint.email = "電子郵件已被使用";
          }
          if (res.msg === "auth/invalid-email") {
            newHint.email = "電子郵件格式錯誤";
          }
          break;
        case "password":
          newValidation.password = false;
          if (res.msg === "auth/weak-password") {
            newHint.password = "密碼至少需為六個字";
          }
          break;
        default:
          pushErrorMsg(res.msg);
          break;
      }
    }

    let isValidationChange = false;

    Object.keys(newValidation).forEach((key) => {
      if (validation[key] !== newValidation[key]) {
        isValidationChange = true;
      }
    });

    if (isValidationChange) {
      setValidation(newValidation);
    }

    let isHintChange = false;

    Object.keys(newHint).forEach((key) => {
      if (hint[key] !== newHint[key]) {
        isHintChange = true;
      }
    });

    if (isHintChange) {
      setHint(newHint);
    }

  }, [email, hint, password, pushErrorMsg, username, validation]);

  async function handlerFileChange(e) {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      const url = await imgToBase64(e.target.files[0]);
      setFileUrl(url);
    }
  }

  async function submit() {
    setIsDirty({
      email: true,
      password: true,
      name: true,
    });
    if (validation.name && validation.email && validation.password) {
      setIsLoading(true);
      const res = await createUser(email, password, username, file);
      ruleChecker(res);
      setIsLoading(false);
      if (res && res.status) {
        const { user } = res;
        await dispatch({ type: "setUserEmail", payload: user.email });
        await dispatch({ type: "setUserName", payload: user.displayName });
        await dispatch({ type: "setUserPhotoURL", payload: user.photoURL });
        await dispatch({ type: "setUserId", payload: user.uid });
        navigate("/");
      }
    }
  }

  useEffect(() => {
    ruleChecker();
  }, [password, email, username, ruleChecker]);

  return (
    <div className="view signup">
      <div className="formBox">
        <div className="head">
          <button className="back" onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}>
            <span className="material-icons">arrow_back</span>
          </button>
        </div>
        <h1 className="title">SIGN UP</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="fileStyle-1">
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={handlerFileChange}
              />
              <div className="imgBox">
                {fileUrl ? (
                  <img src={fileUrl} alt="account" />
                ) : (
                  <span className="material-icons">account_circle</span>
                )}
                <div className="iconBox">
                  {fileUrl ? (
                    <span className="material-icons">edit</span>
                  ) : (
                    <span className="material-icons">add_a_photo</span>
                  )}
                </div>
              </div>
            </label>
          </div>
          <input
            className={classNames("inputStyle-1", {
              error: !validation.name && isDirty.name,
            })}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            onBlur={() =>
              setIsDirty({
                email: isDirty.email,
                name: true,
                password: isDirty.password,
              })
            }
            type="text"
            placeholder="暱稱"
          />
          {!validation.name && isDirty.name ? (
            <span className="hint">{hint.name}</span>
          ) : (
            ""
          )}
          <input
            type="email"
            placeholder="電子郵件"
            autoComplete="on"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            onBlur={() =>
              setIsDirty({
                password: isDirty.password,
                email: true,
                name: isDirty.name,
              })
            }
            className={classNames("inputStyle-1", {
              error: !validation.email && isDirty.email,
            })}
          />
          {!validation.email && isDirty.email ? (
            <span className="hint">{hint.email}</span>
          ) : (
            ""
          )}
          <input
            placeholder="密碼"
            type="password"
            onBlur={() =>
              setIsDirty({
                email: isDirty.email,
                password: true,
                name: isDirty.name,
              })
            }
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className={classNames("inputStyle-1", {
              error: !validation.password && isDirty.password,
            })}
          />
          {!validation.password && isDirty.password ? (
            <span className="hint">{hint.password}</span>
          ) : (
            ""
          )}
          {/* <input placeholder="密碼" className="inputStyle-1" type="password" /> */}
          <div className="btnBox">
            <button
              type="button"
              onClick={() => submit()}
              className={classNames("signup", { block: isLoading })}
            >
              {isLoading ? (
                <div className="btnLoadingBox">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              ) : (
                "註冊"
              )}
            </button>
          </div>
        </form>
      </div>
      <Toast />
    </div>
  );
}

export default Signup;
