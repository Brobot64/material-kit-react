'use client'

import React from 'react'
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-linear-to-b from-green-50 to-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-lg">
                <span className="text-green-700">SOFT</span>
                <span className="text-green-400">TL</span>
              </div>
              <div className="text-xs text-gray-600 -mt-1">SOFTWARE TECHNOLOGY LAB</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <div className="flex items-center gap-1 cursor-pointer hover:text-green-700">
              <span className="font-semibold">Services</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-green-700">
              <span className="font-semibold">Apps</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <Link to="#" className="font-semibold hover:text-green-700">Blog</Link>
            <Link to="#" className="font-semibold hover:text-green-700">About Us</Link>
            <Link to="#" className="font-semibold hover:text-green-700">Contact Us</Link>
          </nav>

          {/* Contact Info */}
          <div className="flex items-center gap-4">
            {/* Social Icons */}
            <div className="flex gap-2">
              <a href="#" className="text-blue-600 hover:text-blue-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="text-green-500 hover:text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.2-4.982 5.973-4.982 10.023 0 1.396.264 2.823.768 4.171l-1.921 7.019 7.19-1.886c1.21.418 2.487.639 3.777.639h.00a9.926 9.926 0 005.032-1.378c3.055-2.2 4.982-5.973 4.982-10.023a9.797 9.797 0 00-2.833-6.993 9.909 9.909 0 00-7.782-3.23M27.81 13.75c0 5.227-4.26 9.487-9.513 9.487-1.684 0-3.297-.425-4.719-1.236l-.435.259-3.159.828.844-3.08-.259-.435A9.363 9.363 0 015.25 13.75c0-5.227 4.26-9.488 9.513-9.488s9.513 4.261 9.513 9.488z" />
                </svg>
              </a>
              <a href="#" className="text-black hover:text-gray-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7z" />
                </svg>
              </a>
              <a href="#" className="text-blue-700 hover:text-blue-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.474-2.237-1.667-2.237-.909 0-1.451.613-1.688 1.213-.087.216-.109.517-.109.817v5.776h-3.554s.05-9.368 0-10.322h3.554v1.462c.456-.704 1.279-1.706 3.107-1.706 2.269 0 3.97 1.481 3.97 4.66v5.906zM5.337 9.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 10.019H3.555V9.11h3.564v10.342zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
              </a>
              <a href="#" className="text-red-600 hover:text-red-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
            <div className="text-sm font-semibold">+88018182635477</div>
          </div>
        </div>
      </div>
    </header>
  )
}
