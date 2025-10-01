"use client";

import React from "react";
import Image from "next/image";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const popularServices = [
  { value: "netflix", label: "Netflix", logo: "/logos/netflix.png", category: "Entertainment", color: "#f43f5e" },
  { value: "spotify", label: "Spotify", logo: "/logos/spotify.png", category: "Entertainment", color: "#10b981" },
  { value: "amazon", label: "Amazon Prime", logo: "/logos/amazon.png", category: "Shopping", color: "#f97316" },
  { value: "youtube", label: "YouTube Premium", logo: "/logos/youtube.png", category: "Entertainment", color: "#6366f1" },
  { value: "disney", label: "Disney+", logo: "/logos/disney.png", category: "Entertainment", color: "#8b5cf6" },
  { value: "hulu", label: "Hulu", logo: "/logos/hulu.png", category: "Entertainment", color: "#14b8a6" },
];


export default function PopularServiceSelect({ onSelect }) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const selectedService = popularServices.find((s) => s.value === value) || null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedService ? (
            <span className="flex items-center">
              <Image
                src={selectedService.logo}
                alt={selectedService.label}
                width={20}
                height={20}
                className="mr-2 rounded"
              />
              {selectedService.label}
            </span>
          ) : (
            "Select a popular service..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search service..." />
          <CommandList>
            <CommandEmpty>No service found.</CommandEmpty>
            <CommandGroup>
              {popularServices.map((service) => (
                <CommandItem
                  key={service.value}
                  value={service.value}
                  onSelect={(val) => {
                    const newVal = val === value ? "" : val;
                    setValue(newVal);
                    setOpen(false);

                    const chosen = popularServices.find((s) => s.value === newVal);
                    if (onSelect) onSelect(chosen || null);
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value === service.value ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <Image
                    src={service.logo}
                    alt={service.label}
                    width={20}
                    height={20}
                    className="mr-2 rounded"
                  />
                  {service.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
