import React from 'react';
import { DailyInspiration } from '../../services/contentCuration';

interface BlackoutGazeProps {
  inspiration: DailyInspiration | null;
  isLoading?: boolean;
  fullScreen?: boolean;
}

/**
 * The Blackout Gaze component displays a daily inspiration
 * featuring an image of a Black man with eyes as a focal point,
 * along with an inspirational quote.
 */
const BlackoutGaze: React.FC<BlackoutGazeProps> = ({ 
  inspiration, 
  isLoading = false,
  fullScreen = false
}) => {
  if (isLoading) {
    return (
      <div className={`bg-black text-white flex flex-col items-center justify-center ${fullScreen ? 'h-screen' : 'h-96'} rounded-lg overflow-hidden animate-pulse`}>
        <div className="w-full h-full bg-gray-800"></div>
      </div>
    );
  }

  if (!inspiration) {
    return (
      <div className={`bg-gray-900 text-white flex flex-col items-center justify-center ${fullScreen ? 'h-screen' : 'h-96'} rounded-lg overflow-hidden`}>
        <p className="text-gray-400 italic text-center px-8">
          No inspiration available for today. Check back tomorrow.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${fullScreen ? 'h-screen' : 'h-[36rem]'}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={inspiration.imageUrl} 
          alt="The Blackout Gaze" 
          className="w-full h-full object-cover filter brightness-75"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
      </div>
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-8 text-white">
        <div className="mb-auto pt-6">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            The Blackout Gaze
          </h2>
          <p className="text-sm text-gray-300">
            Daily Inspiration • {new Date(inspiration.publishDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric'
            })}
          </p>
        </div>
        
        <div 
          className="max-w-2xl bg-black bg-opacity-50 backdrop-blur-sm p-6 rounded-lg shadow-xl border-l-4 border-indigo-500"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
        >
          <blockquote className="text-2xl md:text-3xl font-serif mb-4 leading-relaxed">
            "{inspiration.quote}"
          </blockquote>
          <footer className="text-right">
            <p className="font-medium">— {inspiration.author}</p>
            {inspiration.authorYears && (
              <p className="text-sm text-gray-300">{inspiration.authorYears}</p>
            )}
          </footer>
        </div>
        
        <div className="mt-4 flex items-center text-sm text-gray-300">
          <span className="inline-block px-2 py-1 rounded-full bg-indigo-900 text-indigo-100 text-xs capitalize">
            {inspiration.category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BlackoutGaze;