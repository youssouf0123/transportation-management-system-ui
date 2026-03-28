export interface SearchItem {
  type: string;
  id: number;
  title: string;
  subtitle: string;
  route: string;
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
