import React from "react";
import Header from "./Header.tsx";
import { useBreakpointValue } from "@chakra-ui/react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobileOrTablet = useBreakpointValue({ base: true, md: true, lg: false });
  return (
    <div style={{height: "100vh"}}>
      <Header />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
