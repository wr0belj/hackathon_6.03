import { useContext, useRef, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { UserContext } from "../../store/user-context";
import GuestGuard from "../guards/GuestGuard";
import UserGuard from "../guards/UserGuard";
import LoadingSpinner from "../UI/LoadingSpinner";
import styles from "./Authorization.module.css";
import Input from "./Input";

export function parseJwt(token) {
  if (!token) {
    return;
  }
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace("-", "+").replace("_", "/");
  return JSON.parse(window.atob(base64));
}

function Authorization() {
  const [isRegister, setIsRegister] = useState(false);
  const { isLoading, error, sendData } = useFetch();
  const usernameRef = useRef();
  const passRef = useRef();
  const confirmRef = useRef();
  const { setUser } = useContext(UserContext);

  const switchModeHandler = function () {
    setIsRegister((prev) => !prev);
  };

  const loginHandler = function (e) {
    e.preventDefault();

    const username = usernameRef.current.value.trim();
    const password = passRef.current.value.trim();
    const confirm = isRegister ? confirmRef.current.value.trim() : "";

    if (isRegister && password !== confirm) {
      console.error("pass !== conf");
      return;
    }

    const data = {
      username: username,
      password: password,
    };

    sendData(
      `http://10.0.5.43:2137/api/${isRegister ? "register" : "login"}`,
      data,
      (data) => {
        const parsedData = parseJwt(data.token);
        const userData = {
          username: parsedData.user,
          token: data.token,
          expiration: parsedData.exp,
        };
        console.log(userData);
        setUser(userData);
        localStorage.setItem(
          "token",
          JSON.stringify({
            token: userData.token,
            expiration: userData.expiration,
          })
        );
      }
    );
  };

  return (
    <UserGuard>
      <main className={styles.main}>
        <div className={styles["login-box"]}>
          <form className={styles["login-form"]}>
            <Input
              id="username"
              type="text"
              label="Username"
              ref={usernameRef}
            />
            <Input
              id="password"
              type="password"
              label="Password"
              ref={passRef}
            />
            {isRegister && (
              <Input
                id="confirm"
                type="password"
                label="Confirm password"
                ref={confirmRef}
              />
            )}
            {!isLoading && (
              <div className={styles.control}>
                <button
                  onClick={loginHandler}
                  type="submit"
                  className={styles.btn}
                >
                  {isRegister ? "Sign up" : "Sign in"}
                </button>

                <button
                  onClick={switchModeHandler}
                  type="button"
                  className={styles.btn}
                >
                  {isRegister ? "Log in" : "Register"}
                </button>
              </div>
            )}
          </form>

          {isLoading && <LoadingSpinner />}
        </div>
      </main>
    </UserGuard>
  );
}

export default Authorization;
