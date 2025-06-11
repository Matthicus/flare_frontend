// zorgt ervoor dat alleen content area reload wordt bij verandering van pagina
//next js components zijn server side by default

import MainLayout from "./components/MainLayout";

// type Flare = {
//   id: number;
//   latitude: string;
//   longitude: string;
//   note: string;
//   category: string;
//   created_at: string;
// };

export default async function Home() {
  return <MainLayout />;
}
