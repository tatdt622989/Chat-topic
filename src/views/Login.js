import "../scss/Login.scss";
import React, { useEffect, useContext, useState } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import GlobalContext from "../GlobalContext";
import { useParams, useNavigate } from "react-router-dom";
import { login, checkUser } from "../Firebase";
import { ReactComponent as GoogleLogo } from "../images/google-icon.svg";
import Toast from "../components/Toast";
import Loading from "../components/Loading";

function Login() {
  const { state, dispatch } = useContext(GlobalContext);
  const [email, setEmail] = useState("");
  const [validation, setValidation] = useState({
    email: false,
    password: false,
  });
  const [isDirty, setIsDirty] = useState({
    email: false,
    password: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [password, setPassword] = useState(false);
  const [hint, setHint] = useState({
    email: "",
    password: "",
  });
  let navigate = useNavigate();

  function pushErrorMsg(msg) {
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
  }

  function ruleChecker(res) {
    const newValidation = { ...validation };
    const newHint = { ...hint };
    const emailRule =
      /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    const rule = /^[a-zA-z0-9_.-]$/;
    newValidation.email = !!emailRule.test(email);
    newValidation.password = !!rule.test(password);

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

    console.log("check", newValidation);

    setValidation(newValidation);
    setHint(newHint);
  }

  async function submit(type) {
    let res;
    if (type === "email") {
      setIsDirty({
        email: true,
        password: true,
        name: true,
      });
      if (validation.name && validation.password) {
        setIsLoading(true);
        res = await login(type, email, password);
        ruleChecker(res);
        setIsLoading(false);
      }
    }
    if (type === "google") {
      res = await login(type);
    }
    if (res && res.status) {
      dispatch({ type: "setIsLogin", payload: res.status });
      // navigate("/");
    }
  }

  useEffect(() => {});

  useEffect(async () => {
    if (!state.isLogin) {
      setIsGlobalLoading(true);
      const res = await checkUser();
      if (res && res.status) {
        const { user } = res;
        await dispatch({ type: "setUserEmail", payload: user.email });
        await dispatch({ type: "setUserName", payload: user.displayName });
        await dispatch({ type: "setUserPhotoURL", payload: user.photoURL });
        await dispatch({ type: "setIsLogin", payload: true });
        navigate("/");
      } else {
        setIsGlobalLoading(false);
      }
    }
  }, [state.isLogin]);

  useEffect(() => {
    ruleChecker();
  }, [email]);

  useEffect(() => {
    ruleChecker();
  }, [password]);

  return (
    <div className="view login">
      <div className="formBox">
        <a className="helpBtn" href="https://6yuwei.com/contact.html">
          <span className="material-icons">help_outline</span>
        </a>
        <h1 className="title">CHAT TOPIC</h1>
        <form>
          <button
            className="googleLogin"
            onClick={(e) => {
              e.preventDefault();
              submit("google");
            }}
          >
            <GoogleLogo />
            <span>使用Google帳號登入</span>
          </button>
          <div className="line">
            <span>或</span>
          </div>
          <input
            type="text"
            placeholder="電子郵件"
            className="inputStyle-1"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            onBlur={() =>
              setIsDirty({ password: isDirty.password, email: true })
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
            className="inputStyle-1"
            type="password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            onBlur={() => setIsDirty({ email: isDirty.email, password: true })}
            className={classNames("inputStyle-1", {
              error: !validation.password && isDirty.password,
            })}
          />
          {!validation.password && isDirty.password ? (
            <span className="hint">{hint.password}</span>
          ) : (
            ""
          )}
          <div className="btnBox">
            <Link to="/signup" className="signup">
              註冊
            </Link>
            <button
              className="login"
              onClick={(e) => {
                e.preventDefault();
                submit("email");
              }}
            >
              {isLoading ? (
                <div className="btnLoadingBox">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              ) : (
                "登入"
              )}
            </button>
          </div>
        </form>
      </div>
      <Toast />
      <Loading isOpen={isGlobalLoading} />
    </div>
  );
}

export default Login;
