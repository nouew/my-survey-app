
"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Language } from "@/lib/translations";

interface GoogleHomeProps {
  onSearch: (query: string) => void;
  lang: Language;
}

export function GoogleHome({ onSearch, lang }: GoogleHomeProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const isArabic = lang === "ar";
  const googleSearchText = isArabic ? "بحث Google" : "Google Search";
  const feelingLuckyText = isArabic ? "ضربة حظ" : "I'm Feeling Lucky";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white p-4">
      <div className="flex flex-col items-center" style={{ marginTop: "-8vh" }}>
        {/* Google Logo */}
        <svg
          className="w-auto h-[92px] mb-7"
          viewBox="0 0 272 92"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#4285F4"
            d="M86.8,78.2c-12.8,0-23.2-10.4-23.2-23.2s10.4-23.2,23.2-23.2c6.2,0,11.7,2.4,15.8,6.3l-6.6,6.4c-2.5-2.4-6-4-9.2-4c-7.8,0-14.1,6.3-14.1,14.1s6.3,14.1,14.1,14.1c9,0,13-6.5,13.5-9.9h-13.5v-8.4h22.6c0.1,1.2,0.2,2.3,0.2,3.6c0,16.2-10.9,27.8-22.8,27.8Z"
          />
          <path
            fill="#34A853"
            d="M110.1,55c0-15.1,11.8-27.2,26.5-27.2c14.7,0,26.5,12.1,26.5,27.2c0,15.1-11.8,27.2-26.5,27.2C121.9,82.2,110.1,70.1,110.1,55ZM155,55c0-9.4-7.5-16.9-18.4-16.9s-18.4,7.5-18.4,16.9,7.5,16.9,18.4,16.9S155,64.4,155,55Z"
          />
          <path
            fill="#FBBC05"
            d="M165,55c0-15.1,11.8-27.2,26.5-27.2c14.7,0,26.5,12.1,26.5,27.2c0,15.1-11.8,27.2-26.5,27.2C176.8,82.2,165,70.1,165,55ZM210,55c0-9.4-7.5-16.9-18.4-16.9s-18.4,7.5-18.4,16.9,7.5,16.9,18.4,16.9S210,64.4,210,55Z"
          />
          <path
            fill="#EA4335"
            d="M220.8,32.2h8.3v45.1h-8.3Z"
          />
          <path
            fill="#4285F4"
            d="M239.5,41.9h-8.3v35.4h-8.3V41.9h-8.3v-7.7h24.9Z"
          />
        </svg>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="w-full max-w-[584px] mb-7">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-full border border-gray-200 hover:shadow-md focus:shadow-md focus:outline-none"
              dir={isArabic ? "rtl" : "ltr"}
            />
          </div>
        </form>

        {/* Search Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            onClick={handleSubmit}
            variant="secondary"
            className="bg-[#f8f9fa] hover:bg-[#f1f3f4] text-[#3c4043]"
          >
            {googleSearchText}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="bg-[#f8f9fa] hover:bg-[#f1f3f4] text-[#3c4043]"
            onClick={() => onSearch(feelingLuckyText)}
          >
            {feelingLuckyText}
          </Button>
        </div>
      </div>
    </div>
  );
}
