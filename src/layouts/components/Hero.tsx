'use client'

import React from 'react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 min-h-screen flex items-center">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full translate-x-1/3 translate-y-1/3 opacity-40" />

      <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-left">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 bg-teal-700 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-teal-700">SHOP</h2>
                <p className="text-xl text-gray-700">M A S T E R</p>
              </div>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Optimize your shop with Shop Master—your all-in-one solution for inventory management, sales tracking, and accurate financial records. Enhance operations and make informed decisions effortlessly!
            </p>

            <button className="bg-teal-700 text-white px-8 py-3 rounded hover:bg-teal-800 font-semibold">
              Download for PC
            </button>
          </div>

          {/* Right Side - Device Mockups */}
          <div className="relative h-96 flex items-center justify-center">
            {/* This is a placeholder for device mockups - in a real scenario, you'd use actual images */}
            <div className="relative w-full h-full">
              {/* Desktop Mockup */}
              <div className="absolute top-0 right-10 w-64 h-40 bg-gray-900 rounded-lg shadow-2xl border-4 border-gray-800 p-2">
                <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                  <div className="text-xs text-gray-400">Dashboard</div>
                </div>
              </div>

              {/* Tablet Mockup */}
              <div className="absolute top-32 left-10 w-48 h-32 bg-gray-900 rounded-lg shadow-2xl border-4 border-gray-800 p-1.5">
                <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                  <div className="text-xs text-gray-400">Tablet</div>
                </div>
              </div>

              {/* Mobile Mockup */}
              <div className="absolute bottom-10 left-0 w-24 h-40 bg-gray-900 rounded-2xl shadow-2xl border-2 border-gray-800 p-1">
                <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-xs text-gray-400">Mobile</div>
                </div>
              </div>

              {/* Barcode Scanner Icon */}
              <div className="absolute bottom-20 right-0 w-20 h-20 bg-gray-600 rounded-lg shadow-lg flex items-center justify-center">
                <div className="text-white text-2xl">📱</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
