import React from 'react';

import './App.css';

import Fotter from "./Components/Footer";

import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Components/Header';

function App() {
    return (
        <>
            <Header />
            
            <Fotter className="footer"/>
        </>
    );
}

export default App;