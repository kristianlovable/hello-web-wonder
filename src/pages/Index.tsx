import { useEffect, useState } from "react";
import { ChevronRight, ArrowRight, Twitter, Linkedin, Github } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="absolute top-0 right-0 p-4 z-50">
        <Link 
          to="/login"
          className="inline-block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
        >
          Login
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-4 overflow-hidden">
        <div
          className={`text-center transition-opacity duration-1000 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="inline-block px-3 py-1 mb-6 text-sm font-medium bg-black text-white rounded-full animate-fade-in opacity-0 [animation-delay:0.2s]">
            Welcome to the future
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight animate-fade-in opacity-0 [animation-delay:0.4s]">
            Create something
            <br />
            <span className="text-black">extraordinary</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 animate-fade-in opacity-0 [animation-delay:0.6s]">
            Experience the perfect blend of design and functionality, crafted with
            precision and care for those who appreciate the finest details.
          </p>
          <div className="space-x-4 animate-fade-in opacity-0 [animation-delay:0.8s]">
            <button className="px-8 py-4 bg-black text-white rounded-lg hover-lift inline-flex items-center group">
              Get Started
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 border border-gray-200 rounded-lg hover-lift inline-flex items-center group">
              Learn More
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="px-3 py-1 text-sm font-medium bg-black text-white rounded-full">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-6 mb-4">
              Crafted with precision
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every detail has been carefully considered to create an exceptional
              experience that stands out.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-white p-8 rounded-2xl shadow-sm hover-lift animate-scale-in opacity-0"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand/About Column */}
            <div>
              <h3 className="font-bold text-lg mb-4">Your Brand</h3>
              <p className="text-gray-600 mb-4">
                Creating extraordinary experiences through innovative design and technology.
              </p>
              <p className="text-gray-600">
                123 Innovation Street<br />
                Tech Valley, CA 94043
              </p>
            </div>

            {/* Quick Links Column */}
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect Column */}
            <div>
              <h3 className="font-bold text-lg mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 pt-8">
            <p className="text-center text-gray-600 text-sm">
              © {new Date().getFullYear()} Your Company. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: "✨",
    title: "Premium Design",
    description:
      "Carefully crafted interfaces that blend beauty with functionality.",
  },
  {
    icon: "🎯",
    title: "Pixel Perfect",
    description:
      "Every element is precisely positioned for the perfect visual balance.",
  },
  {
    icon: "⚡️",
    title: "Lightning Fast",
    description:
      "Optimized performance ensures a smooth and responsive experience.",
  },
];

export default Index;
