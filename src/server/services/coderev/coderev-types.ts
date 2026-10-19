export interface SemanticChunk {
  id: string;
  title: string;
  explanation: string;
  purpose: string;
  importance: number;
  importanceReason: string;
  files: string[];
  diff: string;
}

export interface ReviewResult {
  summary: string;
  chunks: SemanticChunk[];
  stats: {
    filesChanged: number;
    additions: number;
    deletions: number;
  };
}

export interface PRInfo {
  number: number;
  title: string;
  author: string;
  authorAvatar: string;
  state: string;
  createdAt: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  htmlUrl: string;
  body: string | null;
}

export interface RepoInfo {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  isPrivate: boolean;
}
