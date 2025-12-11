import Link from 'next/link';

interface Deity {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  blessings: string[];
}

interface DeityCardProps {
  deity: Deity;
  userPujaCount: number;
}

export default function DeityCard({ deity, userPujaCount }: DeityCardProps) {
  const pujaUrl = `/puja/${deity.name.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="group hover:scale-105 transition-transform duration-300">
      <Link href={pujaUrl}>
        <div className="bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-saffron/30 transition-all duration-300 overflow-hidden">
          {/* Deity Icon */}
          <div className={`${deity.color} p-8 text-center relative`}>
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {deity.icon}
            </div>
            <div className="absolute top-2 right-2">
              {userPujaCount > 0 && (
                <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  {userPujaCount} pujas
                </div>
              )}
            </div>
          </div>

          {/* Deity Info */}
          <div className="p-6">
            <h3 className="text-xl font-playfair font-bold text-deep-brown mb-2 group-hover:text-saffron transition-colors">
              {deity.name}
            </h3>
            <p className="text-deep-brown/70 text-sm mb-4 leading-relaxed">
              {deity.description}
            </p>

            {/* Blessings */}
            <div className="space-y-2 mb-4">
              <p className="text-xs font-semibold text-deep-brown/80 uppercase tracking-wide">
                Blessings:
              </p>
              <div className="flex flex-wrap gap-1">
                {deity.blessings.slice(0, 2).map((blessing, index) => (
                  <span
                    key={index}
                    className="bg-cream text-deep-brown/80 text-xs px-2 py-1 rounded-full"
                  >
                    {blessing}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-deep-brown/60">
                  Start Puja
                </span>
                <div className="flex items-center text-saffron">
                  <span className="text-sm font-medium">Begin →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}