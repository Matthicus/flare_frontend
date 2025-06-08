import HotFlares from "./HotFlares";
import Logo from "./Logo";
import { Flare } from "./HotFlares";
import MapWrapper from "./MapWrapper";

const MainLayout = () => {
  const dummyFlares: Flare[] = [
    {
      id: 1,
      latitude: 40.7128,
      longitude: -74.006,
      note: "Street performance going on!",
      category: "regular",
      participantsCount: 14,
      place: { name: "Times Square" },
    },
    {
      id: 2,
      latitude: 34.0522,
      longitude: -118.2437,
      note: "Skate jam at the park",
      category: "blue",
      participantsCount: 11,
      place: { name: "Venice Beach" },
    },
    {
      id: 3,
      latitude: 51.5074,
      longitude: -0.1278,
      note: "Open mic night",
      category: "violet",
      participantsCount: 9,
      place: { name: "Soho Pub" },
    },
    {
      id: 4,
      latitude: 48.8566,
      longitude: 2.3522,
      note: "Outdoor film screening",
      category: "regular",
      participantsCount: 8,
      place: { name: "Parc de la Villette" },
    },
    {
      id: 5,
      latitude: 35.6895,
      longitude: 139.6917,
      note: "Dance circle forming",
      category: "blue",
      participantsCount: 7,
      place: { name: "Shibuya Crossing" },
    },
  ];

  return (
    <div className="relative w-screen h-screen">
      <Logo />
      <HotFlares flares={dummyFlares} />
      <MapWrapper />
    </div>
  );
};

export default MainLayout;
