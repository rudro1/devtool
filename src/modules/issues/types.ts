export interface Issue {
  id: number;
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
  status: 'open' | 'in_progress' | 'resolved';
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Reporter {
  id: number;
  name: string;
  role: 'contributor' | 'maintainer';
}

export interface IssueWithReporter extends Issue {
  reporter: Reporter;
}

export interface CreateIssueRequest {
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  type?: 'bug' | 'feature_request';
}

export interface GetIssuesQuery {
  sort?: 'newest' | 'oldest';
  type?: 'bug' | 'feature_request';
  status?: 'open' | 'in_progress' | 'resolved';
}
