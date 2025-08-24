"use client";

import { Users } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import DeveloperCard from "./DeveloperCard";
import { mockDevelopers } from "@/constants/developers";

export default function SuggestedDevelopers() {
  return (
    <div className="mb-6">
      {/* Label heading */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-600" />
        Suggested Developers
      </h2>

      {/* Carousel wrapper */}
      <Carousel opts={{ align: "start" }}>
        <div className="relative">
          <CarouselContent>
            {mockDevelopers.map((developer) => (
              <CarouselItem
                key={developer.id}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <DeveloperCard developer={developer} />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Arrows positioned relative to list */}
          <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white shadow rounded-full border border-gray-200" />
          <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white shadow rounded-full border border-gray-200" />
        </div>
      </Carousel>
    </div>
  );
}
