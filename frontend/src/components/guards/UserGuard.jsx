import { useContext } from "react";
import { UserContext } from "../../store/user-context";
import { Navigate } from "react-router";

function UserGuard(props) {
  const { user } = useContext(UserContext);

  if (user.token.length > 0) {
    return <Navigate to="/map-view" />;
  }

  return <>{props.children}</>;
}

export default UserGuard;
