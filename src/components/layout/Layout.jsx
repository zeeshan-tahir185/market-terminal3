// src/components/layout/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = ({children}) => {
    return (
        <div className='bg-[F8F8F8]'> 
            {/* <header>Header Content</header> */}
            <main>
                {children}
            </main>
            {/* <footer>Footer Content</footer> */}
        </div>
    );
};

export default Layout;