'use client'

import React from 'react'
import { Check } from 'lucide-react'

interface PricingTier {
  name: string
  subtitle: string
  price: string
  originalPrice: string
  features: string[]
  buttonText: string
  isHighlighted?: boolean
}

export default function Pricing() {
  const tiers: PricingTier[] = [
    {
      name: 'STANDARD',
      subtitle: 'For Small Business',
      price: '৳699/month',
      originalPrice: '৳999/month',
      features: [
        'Manage Single Business',
        '1 Admin Account & 3 Sales Account',
        'Free Online Support',
        'Manage Stock, Accounting with Due Collection, Invoice Printing, Barcode Scanning & More'
      ],
      buttonText: 'Select Plan'
    },
    {
      name: 'PREMIUM',
      subtitle: 'For Medium Business',
      price: '৳999/month',
      originalPrice: '৳1,499/month',
      features: [
        'Manage Multiple Businesses',
        '2 Admin Account & 5 Sales Account',
        'Free Online Support',
        'Free Barcode Scanner',
        'Manage Stock, Accounting with Due Collection, Invoice Printing, Label Printing, Barcode Scanning, Reward Point & More'
      ],
      buttonText: 'Select Plan',
      isHighlighted: true
    },
    {
      name: 'CUSTOM',
      subtitle: 'For Large Business',
      price: 'Negotiable',
      originalPrice: '',
      features: [
        'Manage Unlimited Businesses',
        'Unlimited Admin Account & Unlimited Sales Account',
        'Free Online Support',
        'Free Barcode Scanner',
        'Free Invoice Printer',
        'Manage Stock, Accounting with Due Collection, Invoice Printing, Label Printing, Barcode Scanning, Reward Point & More'
      ],
      buttonText: 'Negotiable'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Pricing</h2>
          <p className="text-2xl text-gray-700">The Best Investment for Your Growth!</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`rounded-lg overflow-hidden ${
                tier.isHighlighted ? 'ring-2 ring-blue-500 transform md:scale-105' : ''
              }`}
            >
              {/* Card Header */}
              <div className={`p-8 ${tier.isHighlighted ? 'bg-blue-600 text-white' : 'bg-white'}`}>
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className={`text-sm mb-4 ${tier.isHighlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                  {tier.subtitle}
                </p>
                <div className="h-px bg-gray-300 mb-4" />
              </div>

              {/* Card Content */}
              <div className="p-8 bg-white">
                {/* Features */}
                <div className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Price and Button */}
                <div className="border-t pt-8">
                  {tier.price === 'Negotiable' ? (
                    <button className="w-full bg-black text-white py-3 rounded font-semibold hover:bg-gray-800 transition-colors">
                      {tier.buttonText}
                    </button>
                  ) : (
                    <>
                      <div className="bg-black text-white p-4 rounded text-center mb-4">
                        <div className="text-lg font-bold">{tier.price}</div>
                        {tier.originalPrice && (
                          <div className="text-sm line-through text-gray-400">{tier.originalPrice}</div>
                        )}
                      </div>
                      <button className="w-full bg-black text-white py-3 rounded font-semibold hover:bg-gray-800 transition-colors">
                        {tier.buttonText}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
