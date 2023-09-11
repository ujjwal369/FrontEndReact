import { store } from "app/store/store";
import ApplicationWrapper from "./containers/ApplicationWrapper";
import { useRoutes } from "react-router-dom";
import routes from "./app/route";

const App = () => {
  const content = useRoutes(routes);
  return (
    <ApplicationWrapper store={store} serviceModuleName="hello">
      {content}
    </ApplicationWrapper>
  );
};

export default App;
