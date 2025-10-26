// Import video từ assets
import bannerVideo from "../assets/video.mp4";

export default function BannerCarousel() {
  return (
    <div className="max-w-7xl mx-auto mt-4 rounded-lg overflow-hidden shadow-lg">
      <video
        src={bannerVideo}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-64 md:h-96 object-cover"
      />
    </div>
  );
}
