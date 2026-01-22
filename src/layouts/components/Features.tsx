'use client'

import React from 'react'
import { Check } from 'lucide-react'

export default function Features() {
  const features = [
    'Accurate Financial Tracking',
    'Automated Reports & Analytics',
    'Easy Inventory Management',
    'Faster Transactions',
    'Secure & Cloud-Based',
    'User-Friendly Interface'
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Features List */}
          <div>
            <h2 className="text-3xl font-bold mb-12">Why Choose Shop Master?</h2>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-teal-700 flex-shrink-0 mt-1" />
                  <span className="text-xl text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <p className="mt-12 text-lg text-gray-700">
              Boost efficiency, save time, and grow your business with Shop Master!
            </p>
          </div>

          {/* Right - Illustration Placeholder */}
          <div className="relative h-96 flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <div className="text-lg text-gray-600">Analytics Illustration</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
