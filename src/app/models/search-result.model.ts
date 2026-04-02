export interface SearchItem {
  type: string;
  id: number;
  title: string;
  subtitle: string;
  route: string;
  queryParams?: Record<string, string | number>;
}

export interface SearchSection {
  key: string;
  title: string;
  results: SearchItem[];
}

export interface SearchResponse {
  query: string;
  totalResults: number;
  sections: SearchSection[];
}
