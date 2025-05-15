import Link from "next/link"; // zorgt ervoor dat alleen content area reload wordt bij verandering van pagina
//next js components zijn server side by default
import ProductCard from "./components/ProductCard";
import { get } from "./server/user";

type Flare = {
  id: number;
  latitude: string;
  longitude: string;
  note: string;
  category: string;
  created_at: string;
};

export default async function Home() {
  const data = await get();
  return (
    <div>
      {data.map((user) => (
        <p key={user.id}>{user.email}</p>
      ))}
    </div>
  );
}
