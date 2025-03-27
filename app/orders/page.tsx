'use client';

import NavBar from "../components/NavBar";
import OrderGrid from "../components/OrderGrid";

export default function Page() {
    return (
        <>
            <NavBar />
        <div className="h-screen w-screen bg-gradient-to-b from-violet-400 to-fuchsia-950">
            
            <h1 className="text-5xl text-white text-center">Orders</h1>
            <OrderGrid />
        </div>
        </>
    )
}