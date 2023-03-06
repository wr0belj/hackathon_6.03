import { useContext, useEffect } from "react";
import { Routes, Route } from "react-router";
import Authorization from "./components/authorization/Authorization";
import BasicView from "./components/BasicView/BasicView";
import { UserContext, UserContextProvider } from "./store/user-context";
import { parseJwt } from "./components/authorization/Authorization";

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/*" element={<BasicView />} />
        <Route path="/authorization" element={<Authorization />} />
      </Routes>
    </UserContextProvider>
  );
}

export default App;
