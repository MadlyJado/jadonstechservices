'use client';
import Link from 'next/link';
import 'react';
import logo from "../lib/logo.png";
import Image from 'next/image';

import React, { Component } from 'react'

export default class NavBar extends Component {
  render() {
    return (
         <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link href="/"><Image src={logo} alt="Jadon's Tech Services" width={128} height={128}></Image></Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li className="menu-item">
            <Link className="menu-link" href="/">Home</Link>
          </li>
          <li className="menu-item">
            <Link className="menu-link" href="/">About</Link>
          </li>
          <li className="menu-item">
            <Link className="menu-link" href="/">Services</Link>
          </li>
          <li className="menu-item">
            <Link className="menu-link" href="/">Contact</Link>
          </li>
        </ul>
      </div>
      
    </div>
    )
  }
}
