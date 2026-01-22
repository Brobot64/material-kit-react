'use client'

import React from 'react'

interface FeatureCard {
  title: string
  description: string
  icon: string
}

export default function FeatureCards() {
  const cards: FeatureCard[] = [
    {
      title: 'Easy Inventory Management',
      description: 'Track and manage your stock with ease using our intuitive interface.',
      icon: '📦'
    },
    {
      title: 'Detailed Sales Reports',
      description: 'Get insights into your sales with our comprehensive reporting tools.',
      icon: '📈'
    },
    {
      title: 'Customer Management',
      description: 'Manage customer information and enhance their shopping experience.',
      icon: '👥'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Image/Illustration Area */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="text-5xl">{card.icon}</div>
              </div>

              {/* Content */}
              <div className="p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-gray-700 leading-relaxed">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
