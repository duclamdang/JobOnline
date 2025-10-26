import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routes";

import { useAppDispatch, useAppSelector } from "@context/hooks";
import { refreshAdmin } from "@admin/store/redux/authSlice";

import Loading from "@components/Loading";

function App() {
  const dispatch = useAppDispatch();
  const { initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(refreshAdmin());
  }, [dispatch]);

  if (!initialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <Loading />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;
