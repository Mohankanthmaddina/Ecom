import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatWidget from './ChatWidget';

function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow pt-20">
                {children}
            </main>
            <Footer />
            <ChatWidget />
        </div>
    );
}

export default Layout;
