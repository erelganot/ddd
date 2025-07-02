import Layout from "./Layout.jsx";

import Registration from "./Registration";

import Admin from "./Admin";

import Display from "./Display";

import Landing from "./Landing";

import TestCircular from "./TestCircular";

import BaseImageView from "./BaseImageView";

import Display1 from "./Display1";

import Display2 from "./Display2";

import Display3 from "./Display3";

import Display4 from "./Display4";

import Display5 from "./Display5";

import Display6 from "./Display6";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Registration: Registration,
    
    Admin: Admin,
    
    Display: Display,
    
    Landing: Landing,
    
    TestCircular: TestCircular,
    
    BaseImageView: BaseImageView,
    
    Display1: Display1,
    
    Display2: Display2,
    
    Display3: Display3,
    
    Display4: Display4,
    
    Display5: Display5,
    
    Display6: Display6,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Registration />} />
                
                
                <Route path="/Registration" element={<Registration />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/Display" element={<Display />} />
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/TestCircular" element={<TestCircular />} />
                
                <Route path="/BaseImageView" element={<BaseImageView />} />
                
                <Route path="/Display1" element={<Display1 />} />
                
                <Route path="/Display2" element={<Display2 />} />
                
                <Route path="/Display3" element={<Display3 />} />
                
                <Route path="/Display4" element={<Display4 />} />
                
                <Route path="/Display5" element={<Display5 />} />
                
                <Route path="/Display6" element={<Display6 />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}