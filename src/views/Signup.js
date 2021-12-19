import "../scss/Signup.scss";
import React, { useEffect, useContext, useState } from "react";
import GlobalContext from "../GlobalContext";
import classNames from "classnames";
import {
  fileUpload,
  emailVerification,
  updateUserData,
  login,
} from "../Firebase";
import Toast from "../components/Toast";
import { useParams, useNavigate } from "react-router-dom";

function Signup() {
  // 全域資料及方法
  const { state, dispatch } = useContext(GlobalContext);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [validation, setValidation] = useState({
    email: false,
    name: false,
  });
  const [isDirty, setIsDirty] = useState({
    email: false,
    name: false,
  });
  const [fileUrl, setFileUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  let navigate = useNavigate();

  function ruleChecker() {
    const emailRule =
      /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    const regex = new RegExp(emailRule);
    const obj = { ...validation };

    obj.email = regex.test(email);
    obj.name = !!username.trim();

    setValidation(obj);
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(reader.error);
      };
    });
  }

  async function handlerFileChange(e) {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      const url = await fileToBase64(e.target.files[0]);
      setFileUrl(url);
    }
  }

  async function submit() {
    console.log("submit");
    if (state.isLogin) {
      setIsDirty({
        name: true,
      });
      if (validation.name && !isLoading) {
        await fileUpload(file);
      }
    } else {
      setIsDirty({
        email: true,
      });
      if (validation.email && !isLoading) {
        await emailVerification(email);
      }
    }
  }

  // 當input的email變動時，更新全域的email
  useEffect(() => {
    if (!state.isLogin) {
      ruleChecker();
      dispatch({ type: "setUserEmail", payload: email });
    }
  }, [email]);

  useEffect(() => {
    if (state.isLogin) {
      ruleChecker();
    }
  }, [username]);

  useEffect(() => {
    async function fetchData() {
      const user = login();
      console.log(user);
      if (user === "verification email") {
        navigate("/login");
        return;
      }
      if (user) {
        await dispatch({ type: "setIsLogin", payload: true });
      }
    }
    fetchData();
  }, [state.isLogin]);

  return (
    <div className="view signup">
      <div className="formBox">
        <h1 className="title">{state.isLogin ? "SUCCESS!" : "SIGN UP"}</h1>
        <form>
          {state.isLogin ? (
            <div className="fileStyle-1">
              <label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlerFileChange}
                />
                <div className="imgBox">
                  {fileUrl ? (
                    <img src={fileUrl} alt="account photo" />
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
          ) : (
            ""
          )}
          {state.isLogin ? (
            <input
              className={classNames("inputStyle-1", {
                error: !validation.name && isDirty.name,
              })}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => setIsDirty({ email: isDirty.email, name: true })}
              type="text"
              placeholder="暱稱"
            />
          ) : (
            ""
          )}
          {!validation.name && isDirty.name && state.isLogin ? (
            <span className="hint">暱稱不能為空</span>
          ) : (
            ""
          )}
          <input
            className={classNames("inputStyle-1", {
              error: !validation.email && isDirty.email,
            })}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setIsDirty({ email: true, name: isDirty.name })}
            placeholder="電子郵件"
            type="email"
          />
          {!validation.email && isDirty.email ? (
            <span className="hint">
              {email ? "電子郵件格式錯誤" : "電子郵件不能為空"}
            </span>
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
              ) : state.isLogin ? (
                "登入"
              ) : (
                "驗證電子郵件"
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
