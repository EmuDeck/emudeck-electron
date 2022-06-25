import React, { useEffect, useState, useContext } from 'react';

const Header = ({ title, bold }) => {
  return (
    <header>
      <h1 className="h2">
        {title} <span>{bold}</span>
      </h1>
    </header>
  );
};

export default Header;
