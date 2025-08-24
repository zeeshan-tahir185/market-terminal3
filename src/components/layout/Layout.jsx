// src/components/layout/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = ({children}) => {
    return (
        <div className='bg-[F8F8F8]'> 
            <main>
                {children}
            </main>
        </div>
    );
};

export default Layout;