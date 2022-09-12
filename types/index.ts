export interface NoteInterface {
  id: string;
  note_heading: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInterface {
  id: string,
  categoryName: string,
  colorCode: string
}

export interface BackupInterface {
  categories: CategoryInterface,
  notes: NoteInterface[]
}

export interface UserInterface {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: null;
  blog: string;
  location: null;
  email: string;
  hireable: null;
  bio: string;
  twitter_username: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: Date;
  updated_at: Date;
}
