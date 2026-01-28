function Hero() {
  return (
    <section className="relative bg-white py-20 sm:py-28 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Turn Your Photos Into
          <span className="block text-gray-700 mt-2">Fridge Magnets</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Upload your favorite photos and we'll turn them into beautiful fridge magnets.
        </p>
        <a
          href="#order"
          className="inline-block bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg"
        >
          Start Creating
        </a>
      </div>
    </section>
  )
}

export default Hero
