import "../scss/Login.scss";
import React, { useEffect, useContext, useState } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import GlobalContext from "../GlobalContext";
import { useParams, useNavigate } from "react-router-dom";
import { login, emailVerification } from "../Firebase";
import Toast from "../components/Toast";

function Login() {
  const { state, dispatch } = useContext(GlobalContext);
  const [email, setEmail] = useState("");
  const [validation, setValidation] = useState({
    email: false,
  });
  const [isDirty, setIsDirty] = useState({
    email: false,
    name: false,
  });
  const [loginAction, setLoginAction] = useState("verify");
  const [isLoading, setIsLoading] = useState(false);
  let navigate = useNavigate();

  function ruleChecker() {
    const emailRule =
      /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    const regex = new RegExp(emailRule);
    const obj = { ...validation };

    obj.email = regex.test(email);

    setValidation(obj);
  }

  async function submit() {
    if (validation.email) {
      switch (loginAction) {
        case "verify":
          await emailVerification(email);
          navigate("/email-send");
          break;
        case "get email":
          login();
          break;
        default:
          break;
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
    async function fetchData() {
      const loginStatus = login(email);
      if (!loginStatus.status) {
        await setLoginAction(loginStatus.action);
      } else {
        navigate('/sign-up');
      }
    }
    fetchData();
  }, [state.isLogin]);

  return (
    <div className="view login">
      <div className="formBox">
        <a className="helpBtn" href="https://6yuwei.com/contact.html">
          <span className="material-icons">help_outline</span>
        </a>
        <h1 className="title">CHAT TOPIC</h1>
        <form>
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
            {/* <Link to="/signup" className="signup">
              註冊
            </Link> */}
            <button className="login" onClick={submit}>
              {isLoading ? (
                <div className="btnLoadingBox">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              ) : loginAction === "verify" ? (
                "驗證電子郵件以登入"
              ) : (
                "登入"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
