import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DirectoryView from "./DirectoryView";
import Register from "./Register";
import Login from "./Login";
import Logout from "./Logout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DirectoryView />,
  },
  {
    path:"/directory/:dirId",
    element:<DirectoryView/>
  },
  {
    path:"/register",
    element:<Register/>
  },
  {
    path:"/login",
    element:<Login/>
  },
  {
    path:"/logout",
    element:<Logout/>
  }

]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;