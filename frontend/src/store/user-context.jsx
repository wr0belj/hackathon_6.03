import React, { useState } from "react";
import { parseJwt } from "../components/authorization/Authorization";

export const userClear = {
  username: "",
  token: "",
  expiration: 0,
};

let userInitial = userClear;

(function () {
  const tokenInfo = localStorage.getItem("token");
  const parsedTokenInfo = JSON.parse(tokenInfo);

  if (!parsedTokenInfo) return;

  const userInfo = parseJwt(parsedTokenInfo?.token);

  userInitial = {
    username: userInfo.user,
    expiration: userInfo.expiration,
    token: parsedTokenInfo?.token,
  };
})();

export const UserContext = React.createContext({
  user: userInitial,
  setUser: (user) => {},
});

export function UserContextProvider(props) {
  const [user, setUser] = useState(userInitial);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {props.children}
    </UserContext.Provider>
  );
}
