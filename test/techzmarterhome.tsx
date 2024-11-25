import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button"

const products = [
  {
    name: "Oculus Meta Quest 2",
    price: "$550",
    description: "Your gateway to immersive virtual reality with vibrant graphics and easy-to-use touch controllers.",
  },
  {
    name: "JBL Tune Buds",
    price: "$74.95",
    description: "Exceptional JBL Pure Bass Sound with Active Noise Cancelling for up to 48 hours of playtime.",
  },
  {
    name: "TP-Link Tapo Security Camera",
    price: "$52.55",
    description: "Keep your home safe with 2.5K resolution, two-way audio, and easy setup via the Tapo app.",
  },
  {
    name: "Anker 737 Power Bank",
    price: "$150",
    description: "High-capacity charging on the go with three versatile ports for multiple devices.",
  },
];

export default function TechzmarterHome() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800">techzmarter</Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/about" className="text-gray-600 hover:text-blue-500 transition-colors">About</Link>
            <Link href="/products" className="text-gray-600 hover:text-blue-500 transition-colors">Products</Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-500 transition-colors">Contact</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Amazing Tech</h1>
                <p className="text-xl mb-6">Explore our curated selection of cutting-edge gadgets and accessories.</p>
                <Button size="lg" variant="secondary">Shop Now</Button>
              </div>
              <div className="md:w-1/2">
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="Featured Product"
                  width={400}
                  height={400}
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                  <Image
                    src={`/placeholder.svg?height=200&width=200`}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="w-full object-cover h-48"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <p className="text-blue-600 font-semibold mb-2">{product.price}</p>
                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                    <Button variant="outline" className="w-full">Learn More</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-100 py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="About Us"
                  width={400}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="md:w-1/2 md:pl-10">
                <h2 className="text-3xl font-bold mb-4">About Us</h2>
                <p className="text-gray-600 mb-6">
                  At techzmarter, we're passionate about bringing you the latest and greatest in technology. 
                  Our curated selection of products represents the cutting edge of innovation, designed to 
                  enhance your daily life and keep you connected to what matters most.
                </p>
                <Button variant="default">Learn More</Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Get in Touch</h2>
            <div className="max-w-2xl mx-auto">
              <form className="space-y-4">
                <input type="text" placeholder="Name" className="w-full p-2 border border-gray-300 rounded" />
                <input type="email" placeholder="Email" className="w-full p-2 border border-gray-300 rounded" />
                <textarea placeholder="Message" rows={4} className="w-full p-2 border border-gray-300 rounded"></textarea>
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">techzmarter</h3>
              <ul className="space-y-2">
                <li><Link href="/products" className="hover:text-blue-400 transition-colors">Products</Link></li>
                <li><Link href="/about" className="hover:text-blue-400 transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="https://www.tiktok.com/@techzmarter" target="_blank" rel="noopener noreferrer">
                  <Image src="/placeholder.svg?height=24&width=24" alt="TikTok" width={24} height={24} />
                </a>
                <a href="https://www.instagram.com/techzmarter" target="_blank" rel="noopener noreferrer">
                  <Image src="/placeholder.svg?height=24&width=24" alt="Instagram" width={24} height={24} />
                </a>
                <a href="https://www.youtube.com/@techzmarter" target="_blank" rel="noopener noreferrer">
                  <Image src="/placeholder.svg?height=24&width=24" alt="YouTube" width={24} height={24} />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Newsletter</h3>
              <p className="mb-4">Stay updated with our latest products and offers.</p>
              <form className="flex">
                <input type="email" placeholder="Your email" className="flex-grow p-2 rounded-l" />
                <Button type="submit" className="rounded-l-none">Subscribe</Button>
              </form>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            <p>&copy; 2023 techzmarter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

