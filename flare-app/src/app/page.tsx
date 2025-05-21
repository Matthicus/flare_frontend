import Link from "next/link"; // zorgt ervoor dat alleen content area reload wordt bij verandering van pagina
//next js components zijn server side by default
import ProductCard from "./components/ProductCard";
import MapWrapper from "./components/MapWrapper";
import MainNavigation from "./components/MainNavigation";
import FooterHome from "./components/FooterHome";

type Flare = {
  id: number;
  latitude: string;
  longitude: string;
  note: string;
  category: string;
  created_at: string;
};

export default async function Home() {
  return (
    <div className="p-10">
      <MainNavigation />
      <MapWrapper />
    </div>
  );
}
