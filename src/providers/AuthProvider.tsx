import { useEffect } from "react";
import { useAppDispatch } from "../hooks";
import { restoreAuth, hydrate } from "../feature/auth/authSlice";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const user = localStorage.getItem("user");
    if (accessToken && refreshToken && user) {
      dispatch(restoreAuth({ tokens: { accessToken, refreshToken }, user: JSON.parse(user) }));
    } else {
      dispatch(hydrate());
    }
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
