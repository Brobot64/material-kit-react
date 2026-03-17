'use client'

import React from 'react'

export default function BarcodeFeature() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Illustration */}
          <div className="relative h-96 flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-pink-50 rounded-3xl flex items-center justify-center p-8">
              {/* Store Illustration Placeholder */}
              <div className="space-y-4">
                <div className="text-6xl text-center">🏪</div>
                <div className="text-gray-600 text-center">Store Illustration</div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Fast & Accurate Selling with Barcode Scanner
            </h2>

            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Speed up your sales process with our smart barcode scanning feature. Simply scan product barcodes to instantly retrieve prices, update stock, and process transactions with 100% accuracy. Reduce manual errors, save time, and enhance customer experience with seamless checkouts.
            </p>

            {/* Key Points */}
            <div className="space-y-4 mb-12">
              <div className="flex items-start gap-4">
                <span className="text-2xl">⚡</span>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Instant Product Identification</h4>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl">💳</span>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Faster Billing & Checkout</h4>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl">📊</span>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Real-Time Inventory Updates</h4>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl">✅</span>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Error-Free Transactions</h4>
                </div>
              </div>
            </div>

            <p className="text-lg text-gray-700">
              Boost efficiency and streamline your sales with smart barcode scanning!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
