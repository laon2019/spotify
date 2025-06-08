import React from 'react';
import { Routes, Route } from "react-router-dom";
import Music from "./page/Music/index.tsx";
import { useTranslation } from "react-i18next";
import Signup from './page/Singup/index.tsx';
import Login from './page/Login/index.tsx';

const App = () => {
  const { t } = useTranslation();
  return (
    <Routes>
      <Route path="/" element={<Music />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default App;
