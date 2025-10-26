import React from "react";
import {
  DevicePhoneMobileIcon,
  SpeakerWaveIcon,
  FireIcon,
  ComputerDesktopIcon,
  CameraIcon,
  HomeIcon,
  PuzzlePieceIcon,
  TvIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// map slug -> hàm render icon (JSX)
const ICONS = {
  smartphones: () => <DevicePhoneMobileIcon className="h-5 w-5 text-blue-500" />,
  laptops: () => <ComputerDesktopIcon className="h-5 w-5 text-green-500" />,
  accessories: () => <SpeakerWaveIcon className="h-5 w-5 text-gray-500" />,
  camera: () => <CameraIcon className="h-5 w-5 text-indigo-500" />,
  home: () => <HomeIcon className="h-5 w-5 text-yellow-500" />,
  tv: () => <TvIcon className="h-5 w-5 text-purple-500" />,
  recycle: () => <ArrowPathIcon className="h-5 w-5 text-gray-700" />,
  "khuyen-mai": () => <FireIcon className="h-5 w-5 text-red-500" />,
};

export function getIcon(slug) {
  const render = ICONS[slug];
  return render ? render() : <PuzzlePieceIcon className="h-5 w-5 text-gray-400" />;
}

export default ICONS;
