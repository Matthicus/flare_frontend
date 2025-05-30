// zorgt ervoor dat alleen content area reload wordt bij verandering van pagina
//next js components zijn server side by default

import { use, useState } from "react";
import { useEffect } from "react";

import MapWrapper from "./components/MapWrapper";
import MainNavigation from "./components/MainNavigation";
import test from "node:test";
import { testConnection } from "@/lib/axios";

// type Flare = {
//   id: number;
//   latitude: string;
//   longitude: string;
//   note: string;
//   category: string;
//   created_at: string;
// };

export default async function Home() {
  return (
    <div className="p-10">
      <MainNavigation />
      <MapWrapper />
    </div>
  );
}
