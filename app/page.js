// pages/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Select Your Drawing App</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 border rounded-md shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-4">NYT Drawing App</h2>
          <p className="mb-4">Use today's images from the NYT to create a generative art piece.</p>
          <Link href="/nyt1">
            <button className="text-blue-500 hover:underline">Go to NYT Drawing App</button>
          </Link>
        </div>

        <div className="p-6 border rounded-md shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-4">Other Drawing App</h2>
          <p className="mb-4">Try out another drawing app you’ve built!</p>
          <Link href="/nyt2">
            <button className="text-blue-500 hover:underline">Go to Other Drawing App</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
