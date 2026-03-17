'use client'

import React from 'react'
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-linear-to-b from-green-50 to-white border-t">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <div className="font-bold">
                  <span className="text-green-700">SOFT</span>
                  <span className="text-green-400">TL</span>
                </div>
                <div className="text-xs text-gray-600">SOFTWARE TECHNOLOGY LAB</div>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
              SOFTTL delivers innovative digital solutions to help businesses thrive. We specialize in professional website development, mobile and desktop applications, software solutions, graphic design, and full-scale web and application development. Committed to excellence, we transform ideas into reality through cutting-edge technology.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.2-4.982 5.973-4.982 10.023 0 1.396.264 2.823.768 4.171l-1.921 7.019 7.19-1.886c1.21.418 2.487.639 3.777.639h.00a9.926 9.926 0 005.032-1.378c3.055-2.2 4.982-5.973 4.982-10.023a9.797 9.797 0 00-2.833-6.993 9.909 9.909 0 00-7.782-3.23M27.81 13.75c0 5.227-4.26 9.487-9.513 9.487-1.684 0-3.297-.425-4.719-1.236l-.435.259-3.159.828.844-3.08-.259-.435A9.363 9.363 0 015.25 13.75c0-5.227 4.26-9.488 9.513-9.488s9.513 4.261 9.513 9.488z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-900 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.002 12.002 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6">Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="#" className="text-gray-700 hover:text-green-700 transition">Services</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-700 hover:text-green-700 transition">Blog</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-700 hover:text-green-700 transition">About Us</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-700 hover:text-green-700 transition">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Apps Column */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6">Apps</h3>
            <ul className="space-y-3">
              <li>
                <Link to="#" className="text-gray-700 hover:text-green-700 transition">Shop Master</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-700 hover:text-green-700 transition">Bangla Voice to Text Typing Keyboard</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-700 hover:text-green-700 transition">Net Meter for Android</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-700 hover:text-green-700 transition">Text to Speech for All App</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-700 hover:text-green-700 transition">Bangla Voice Calculator</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-700 hover:text-green-700 transition">Voice Notes For All Language</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t pt-8 text-center text-gray-600">
          <p>© 2025 <span className="font-bold">SOFTTL</span> All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
