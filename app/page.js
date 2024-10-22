// pages/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Select Your Drawing App</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 border rounded-md shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-4">NYT Pictures</h2>
          <p className="mb-4">Use today&apos;s images from the NYT to create a generative art piece.</p>
          <Link href="/nyt1">
            <button className="text-blue-500 hover:underline">Go</button>
          </Link>
        </div>

        <div className="p-6 border rounded-md shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-4">Other NYT</h2>
          <p className="mb-4">Using most Popular Titles</p>
          <Link href="/nyt2">
            <button className="text-blue-500 hover:underline">Go</button>
          </Link>
        </div>

        <div className="p-6 border rounded-md shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-4">Bible Text</h2>
          <p className="mb-4">Drawing with biblical texts</p>
          <Link href="/yourText">
            <button className="text-blue-500 hover:underline">Go</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
