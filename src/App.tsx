import React from 'react';
import { Routes, Route } from "react-router-dom";
import Music from "./page/Music/Music.tsx";
import { useTranslation } from "react-i18next";
import Layout from './layout/Layout.tsx';
import NotFound from './page/NotFound/NotFound.tsx';

const App = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Music />} />
        <Route path="*" element={<NotFound content={t("notFound")} />} />
      </Routes>
    </Layout>
  );
};

export default App;
