import { useContext } from "react";
import { UserContext } from "../../store/user-context";
import { Navigate } from "react-router";

function GuestGuard(props) {
  const { user } = useContext(UserContext);

  if (user.token.length === 0) {
    return <Navigate to="/authorization" />;
  }

  return <>{props.children}</>;
}

export default GuestGuard;
