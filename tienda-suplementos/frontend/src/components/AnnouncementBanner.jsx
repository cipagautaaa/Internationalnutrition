import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, Gift } from 'lucide-react';

const AnnouncementBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const announcements = [
    {
      text: 'Compra más, ahorra más',
      link: '/products',
      icon: ShoppingCart
    },
    {
      text: 'Combos imperdibles HOT',
      link: '/combos',
      icon: Gift
    },
    {
      text: 'Tu envío es gratis desde $0',
      link: '/envios',
      icon: ShieldCheck
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === announcements.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-red-700 via-red-7000 to-red-700 text-white text-sm font-medium">
      <div className="h-8 relative overflow-hidden">
        <div 
          className="absolute inset-0 flex flex-col transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(-${currentIndex * 100}%)` }}
        >
          {announcements.map((announcement, index) => {
            const Icon = announcement.icon;
            return (
              <Link
                key={index}
                to={announcement.link}
                className="flex-shrink-0 w-full h-8 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors duration-300 group"
              >
                <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="tracking-wide">{announcement.text}</span>
                <span className="ml-1 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;