export interface ProfileData {
  income: string;
  occupation: string;
  technology: string;
  country: string;
  state: string;
}

export const countries = [
  { name: "United States", code: "US" },
  { name: "Germany", code: "DE" },
  { name: "Canada", code: "CA" },
  { name: "United Kingdom", code: "GB" },
  { name: "Russia", code: "RU" },
  { name: "France", code: "FR" },
];

export const states: { [country: string]: { name: string; code: string }[] } = {
  "United States": [
    { name: "California", code: "CA" },
    { name: "Texas", code: "TX" },
    { name: "New York", code: "NY" },
  ],
  "Germany": [
    { name: "Bavaria", code: "BY" },
    { name: "Berlin", code: "BE" },
    { name: "Hesse", code: "HE" },
  ],
  "Canada": [
    { name: "Ontario", code: "ON" },
    { name: "Quebec", code: "QC" },
    { name: "British Columbia", code: "BC" },
  ],
  "United Kingdom": [
    { name: "England", code: "ENG" },
    { name: "Scotland", code: "SCT" },
    { name: "Wales", code: "WLS" },
  ],
  "Russia": [
    { name: "Moscow", code: "MOW" },
    { name: "Saint Petersburg", code: "SPE" },
    { name: "Krasnodar Krai", code: "KDA" },
  ],
  "France": [
    { name: "Île-de-France", code: "IDF" },
    { name: "Provence-Alpes-Côte d'Azur", code: "PAC" },
    { name: "Auvergne-Rhône-Alpes", code: "ARA" },
  ],
};
