
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
  const duckDuckGoSearchText = isArabic ? "بحث DuckDuckGo" : "DuckDuckGo Search";
  const feelingDuckyText = isArabic ? "أشعر بالحظ" : "I'm Feeling Ducky";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white p-4">
      <div className="flex flex-col items-center" style={{ marginTop: "-8vh" }}>
        {/* A DuckDuckGo-like Logo */}
        <div className="flex items-center gap-2 mb-7">
            <svg xmlns="http://www.w3.org/2000/svg" width="92" height="92" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[60px] w-auto text-gray-700"><path d="M10.61 15.39a2.5 2.5 0 0 1 3.54 0"/><path d="M14.12 11.88a2.5 2.5 0 0 1 0 3.54"/><path d="M11.88 9.88a2.5 2.5 0 0 1 3.54 0"/><path d="M9.88 14.12a2.5 2.5 0 0 1 0-3.54"/><path d="M17.66 7.34a2.5 2.5 0 0 1 0 3.54"/><path d="M7.34 9.34a2.5 2.5 0 0 1 3.54 0"/><path d="M7.34 17.66a2.5 2.5 0 0 1 0-3.54"/><circle cx="12" cy="12" r="10"/></svg>
            <span className="text-4xl font-bold text-gray-600">DuckDuckGo</span>
        </div>

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
              placeholder={isArabic ? "ابحث في الويب دون أن يتم تعقبك..." : "Search the web without being tracked..."}
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
            {duckDuckGoSearchText}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="bg-[#f8f9fa] hover:bg-[#f1f3f4] text-[#3c4043]"
            onClick={() => onSearch(query)}
          >
            {feelingDuckyText}
          </Button>
        </div>
      </div>
    </div>
  );
}
