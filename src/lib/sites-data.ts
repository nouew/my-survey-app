
export interface SiteData {
    name: string;
    minPayout: string;
    proxyType?: 'Static' | 'Rotating' | 'Injection' | 'N/A';
  }
  
  export const surveySites: SiteData[] = [
    { name: "Freecash", minPayout: "$5" },
    { name: "SwagBucks", minPayout: "$5" },
    { name: "HeyCash", minPayout: "$1" },
    { name: "Prime Opinion", minPayout: "$5" },
    { name: "HeyPiggy", minPayout: "$1" },
    { name: "Pawns", minPayout: "$5" },
    { name: "Branded Surveys", minPayout: "$5" },
    { name: "TopSurveys", minPayout: "$10" },
    { name: "Surveyeah", minPayout: "$10" },
    { name: "InboxDollars", minPayout: "$30" },
    { name: "Superpay.me", minPayout: "$1" },
    { name: "Triaba", minPayout: "$5" },
    { name: "Survey Junkie", minPayout: "$5" },
    { name: "appKarma", minPayout: "$3" },
    { name: "Earnably", minPayout: "$1" },
    { name: "ySense", minPayout: "$10" },
    { name: "YouGov", minPayout: "$15" },
    { name: "Toluna", minPayout: "$10" },
    { name: "PrizeRebel", minPayout: "$5" },
    { name: "Madai", minPayout: "$5" },
    { name: "Rewards1", minPayout: "$5" },
    { name: "Reward XP", minPayout: "$5" },
    { name: "RedMonkey", minPayout: "$5" },
    { name: "MyPoints", minPayout: "$10" },
    { name: "Opinion Edge", minPayout: "$10" },
  ];
