'use client';

/**
 * Static lanyard badges image
 * Replaces the 3D Three.js component for better performance
 * Desktop: 359KB WebP vs 1.1MB+ JS bundle
 * Mobile: 98KB WebP
 */

export default function Lanyard() {
  return (
    <div className="relative z-0 w-full h-full flex items-end justify-center">
      <picture>
        <source 
          media="(max-width: 768px)" 
          srcSet="/images/lanyard-badges-mobile.webp"
        />
        <source 
          media="(min-width: 769px)" 
          srcSet="/images/lanyard-badges-desktop.webp"
        />
        <img 
          src="/images/lanyard-badges-desktop.webp"
          alt="Conference badges showing different delegate types - Guest, Alternate Delegate, Voting Delegate, Voting Member, and Brother"
          className="w-full h-auto max-h-full object-contain"
          loading="eager"
          width="1000"
          height="1100"
        />
      </picture>
    </div>
  );
}
