import React, { useEffect, useState, useContext } from "react";
//import { GlobalContext } from "../context/globalContext";
import bgImg from "assets/bg.gif";

const Aside = ({ props }) => {
  return (
    <aside>
      <img src={bgImg} alt="Background" />
    </aside>
  );
};

export default Aside;
