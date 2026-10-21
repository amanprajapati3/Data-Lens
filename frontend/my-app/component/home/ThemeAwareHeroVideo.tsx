"use client";

import { useSyncExternalStore } from "react";
import {
  getServerThemeSnapshot,
  getThemeSnapshot,
  subscribeToTheme,
} from "@/component/shared/themeStore";

export default function ThemeAwareHeroVideo() {
  const isDarkTheme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const videoSrc = isDarkTheme
    ? "/12280043_1920_1080_30fps.mp4"
    : "/istockphoto-2184547913-640_adpp_is.mp4";

  return (
    <>
      <video
        key={videoSrc}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/70"
      />
    </>
  );
}
