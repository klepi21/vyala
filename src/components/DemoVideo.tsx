"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";

export function DemoVideo({ caption }: { caption: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <figure>
      <div className="relative overflow-hidden rounded-2xl border border-black/[.07] bg-black shadow-2xl shadow-black/[.12]">
        <video
          ref={ref}
          className="block w-full"
          poster="/demo-poster.jpg"
          muted
          loop
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          controls={playing}
        >
          <source src="/demo.mp4" type="video/mp4" />
        </video>

        {!playing && (
          <button
            onClick={() => ref.current?.play()}
            aria-label="Play the product tour"
            className="absolute inset-0 flex items-center justify-center bg-black/10 transition hover:bg-black/20"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition group-hover:scale-105">
              <Play size={24} className="ml-1 fill-brand-700 text-brand-700" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3 text-center text-sm text-muted">{caption}</figcaption>
    </figure>
  );
}
