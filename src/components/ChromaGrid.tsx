'use client';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface TestimonialItem {
  image: string;
  name: string;
  title: string;
  blurb: string;
  borderColor: string;
  gradient: string;
}

interface ChromaGridProps {
  items: TestimonialItem[];
  className?: string;
  radius?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
}

export default function ChromaGrid({
  items,
  className = '',
  radius = 300,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out'
}: ChromaGridProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<gsap.QuickSetter | null>(null);
  const setY = useRef<gsap.QuickSetter | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, '--x', 'px');
    setY.current = gsap.quickSetter(el, '--y', 'px');
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true
    });
  };

  const handleMove = (e: React.PointerEvent) => {
    const r = rootRef.current?.getBoundingClientRect();
    if (!r) return;
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, {
      opacity: 1,
      duration: fadeOut,
      overwrite: true
    });
  };

  const handleCardMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <>
      <style>{`
        .chroma-grid {
          position: relative;
          width: 100%;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          justify-content: center;
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
          box-sizing: border-box;
          --x: 50%;
          --y: 50%;
          --r: 220px;
        }

        @media (max-width: 900px) {
          .chroma-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 0.5rem;
          }
        }

        .chroma-card {
          position: relative;
          display: flex;
          flex-direction: row;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #333;
          transition: border-color 0.3s ease;
          background: var(--card-gradient);
          --mouse-x: 50%;
          --mouse-y: 50%;
          --spotlight-color: rgba(255, 255, 255, 0.3);
        }

        .chroma-card:hover {
          border-color: var(--card-border);
        }

        .chroma-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: 2;
        }

        .chroma-card:hover::before {
          opacity: 1;
        }

        .chroma-img-wrapper {
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          width: 140px;
          padding: 12px;
          box-sizing: border-box;
        }

        .chroma-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
          display: block;
          aspect-ratio: 1;
        }

        .chroma-content {
          position: relative;
          z-index: 1;
          flex: 1;
          padding: 1rem 1rem 1rem 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: #fff;
          font-family: system-ui, sans-serif;
        }

        .chroma-blurb {
          font-size: 1rem;
          line-height: 1.5;
          margin: 0 0 0.75rem 0;
          color: #e0e0e0;
        }

        .chroma-meta .name {
          font-weight: 700;
          font-size: 1.1rem;
          margin: 0;
          color: #fff;
        }

        .chroma-meta .title {
          font-size: 0.85rem;
          line-height: 1.3;
          color: #aaa;
          margin: 0.25rem 0 0;
        }

        .chroma-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 3;
          backdrop-filter: grayscale(1) brightness(0.78);
          -webkit-backdrop-filter: grayscale(1) brightness(0.78);
          background: rgba(0, 0, 0, 0.001);
          mask-image: radial-gradient(
            circle var(--r) at var(--x) var(--y),
            transparent 0%,
            transparent 15%,
            rgba(0, 0, 0, 0.1) 30%,
            rgba(0, 0, 0, 0.22) 45%,
            rgba(0, 0, 0, 0.35) 60%,
            rgba(0, 0, 0, 0.5) 75%,
            rgba(0, 0, 0, 0.68) 88%,
            white 100%
          );
          -webkit-mask-image: radial-gradient(
            circle var(--r) at var(--x) var(--y),
            transparent 0%,
            transparent 15%,
            rgba(0, 0, 0, 0.1) 30%,
            rgba(0, 0, 0, 0.22) 45%,
            rgba(0, 0, 0, 0.35) 60%,
            rgba(0, 0, 0, 0.5) 75%,
            rgba(0, 0, 0, 0.68) 88%,
            white 100%
          );
        }

        .chroma-fade {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 4;
          backdrop-filter: grayscale(1) brightness(0.78);
          -webkit-backdrop-filter: grayscale(1) brightness(0.78);
          background: rgba(0, 0, 0, 0.001);
          mask-image: radial-gradient(
            circle var(--r) at var(--x) var(--y),
            white 0%,
            white 15%,
            rgba(255, 255, 255, 0.9) 30%,
            rgba(255, 255, 255, 0.78) 45%,
            rgba(255, 255, 255, 0.65) 60%,
            rgba(255, 255, 255, 0.5) 75%,
            rgba(255, 255, 255, 0.32) 88%,
            transparent 100%
          );
          -webkit-mask-image: radial-gradient(
            circle var(--r) at var(--x) var(--y),
            white 0%,
            white 15%,
            rgba(255, 255, 255, 0.9) 30%,
            rgba(255, 255, 255, 0.78) 45%,
            rgba(255, 255, 255, 0.65) 60%,
            rgba(255, 255, 255, 0.5) 75%,
            rgba(255, 255, 255, 0.32) 88%,
            transparent 100%
          );
          opacity: 1;
          transition: opacity 0.25s ease;
        }

        @media (max-width: 600px) {
          .chroma-card {
            flex-direction: column;
          }
          .chroma-img-wrapper {
            width: 100%;
            height: 200px;
          }
          .chroma-content {
            padding: 1rem;
          }
        }
      `}</style>

      <div
        ref={rootRef}
        className={`chroma-grid ${className}`}
        style={{ '--r': `${radius}px` } as React.CSSProperties}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        {items.map((item, i) => (
          <article
            key={i}
            className="chroma-card"
            onMouseMove={handleCardMove}
            style={{
              '--card-border': item.borderColor || 'transparent',
              '--card-gradient': item.gradient
            } as React.CSSProperties}
          >
            <div className="chroma-img-wrapper">
              <img src={item.image} alt={item.name} loading="lazy" />
            </div>
            <div className="chroma-content">
              <p className="chroma-blurb">{item.blurb}</p>
              <div className="chroma-meta">
                <h3 className="name">{item.name}</h3>
                <p className="title">{item.title}</p>
              </div>
            </div>
          </article>
        ))}
        <div className="chroma-overlay" />
        <div ref={fadeRef} className="chroma-fade" />
      </div>
    </>
  );
}
