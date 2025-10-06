import {
  DevicePhoneMobileIcon,
  SpeakerWaveIcon,
  CameraIcon,
  HomeIcon,
  PuzzlePieceIcon,
  ComputerDesktopIcon,
  TvIcon,
  ArrowPathIcon,
  FireIcon,
} from "@heroicons/react/24/outline";

// Định nghĩa map icon theo slug
const iconMap = {
  smartphones: <DevicePhoneMobileIcon className="h-5 w-5 text-blue-500" />,
  laptops: <ComputerDesktopIcon className="h-5 w-5 text-green-500" />,
  accessories: <SpeakerWaveIcon className="h-5 w-5 text-gray-500" />,
  camera: <CameraIcon className="h-5 w-5" />,
  home: <HomeIcon className="h-5 w-5" />,
  pc: <ComputerDesktopIcon className="h-5 w-5" />,
  tv: <TvIcon className="h-5 w-5" />,
  recycle: <ArrowPathIcon className="h-5 w-5" />,
  promotion: <FireIcon className="h-5 w-5 text-red-500" />,
  default: <PuzzlePieceIcon className="h-5 w-5 text-gray-400" />,
};

export default iconMap;
