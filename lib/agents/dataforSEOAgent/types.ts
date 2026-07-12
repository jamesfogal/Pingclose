export interface KeywordResult {
  keyword: string;
  monthlySearches: number;
  competition: number;
  cpc: number;
}

export interface LocalCompetitor {
  rank: number;
  domain: string;
  title: string;
  monthlyClicks: number;
}

export interface LocalSerpResult {
  keyword: string;
  location: string;
  customerDomain: string;
  customerRank: number | null;
  customerMonthlyClicks: number;
  topCompetitor: LocalCompetitor | null;
  allCompetitors: LocalCompetitor[];
}
