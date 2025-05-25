import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import reportWebVitals from "./reportWebVitals.ts";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./util/theme.ts";
import { HelmetProvider } from 'react-helmet-async';
import './i18n.ts';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";

const container = document.getElementById("root") as HTMLElement;

const queryClient = new QueryClient();


if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    container,
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <RecoilRoot>
            <HelmetProvider>
              <HashRouter>
                <App />
              </HashRouter>
            </HelmetProvider>
          </RecoilRoot>
        </ChakraProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
} else {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <RecoilRoot>
            <HelmetProvider>
              <HashRouter>
                <App />
              </HashRouter>
            </HelmetProvider>
          </RecoilRoot>
        </ChakraProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

reportWebVitals();
