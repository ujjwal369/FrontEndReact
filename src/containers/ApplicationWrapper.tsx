import { ThemeProvider, createTheme } from "@mui/material";
import { MatxLayout, MatxTheme } from "base/components";
import themeOptions from "base/components/MatxTheme/themeOptions";
import AppDetailProvider from "base/contexts/AppDetailProvider";
import { AuthProvider } from "base/contexts/JWTAuthContext";
import { LayoutProvider } from "base/contexts/LayoutContext";
import { FixMeLater } from "base/types/FixMeLater";
import { Startup } from "base/utils/startup";
import React, { Suspense, useEffect } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import "./applicationWrapper.css";
import { Provider } from "react-redux";
import { store as ReduxStore } from "base/store";

type ApplicationWrapperProps = {
  children: React.ReactElement | null;
  serviceModuleName?: string;
  store: FixMeLater;
};

const envServiceModuleName = process.env.REACT_APP_SERVICE_NAME;
Startup();

const ApplicationWrapper = ({
  children,
  serviceModuleName,
  store,
}: ApplicationWrapperProps) => {
  const theme = createTheme(themeOptions);

  useEffect(() => {
    document.title = `Artha | ${serviceModuleName || envServiceModuleName}`;
  }, []);

  return (
    <Provider store={ReduxStore}>
      <AuthProvider>
        <Suspense fallback={<MatxLayout />}>
          <ErrorBoundary>
            <AppDetailProvider>
              <ThemeProvider theme={theme}>
                <LayoutProvider>
                  <MatxTheme>{children}</MatxTheme>
                </LayoutProvider>
              </ThemeProvider>
            </AppDetailProvider>
          </ErrorBoundary>
        </Suspense>
      </AuthProvider>
    </Provider>
  );
};

export default ApplicationWrapper;
