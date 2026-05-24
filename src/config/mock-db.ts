interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'contributor' | 'maintainer';
  created_at: Date;
  updated_at: Date;
}

interface Issue {
  id: number;
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
  status: 'open' | 'in_progress' | 'resolved';
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

let users: User[] = [];
let issues: Issue[] = [];
let userIdCounter = 1;
let issueIdCounter = 1;

export const db = {
  users: {
    insert: async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
      const newUser: User = {
        ...user,
        id: userIdCounter++,
        created_at: new Date(),
        updated_at: new Date()
      };
      users.push(newUser);
      return newUser;
    },
    findByEmail: async (email: string) => {
      return users.find(u => u.email === email) || null;
    },
    findById: async (id: number) => {
      return users.find(u => u.id === id) || null;
    },
    findByIds: async (ids: number[]) => {
      return users.filter(u => ids.includes(u.id));
    }
  },
  issues: {
    insert: async (issue: Omit<Issue, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
      const newIssue: Issue = {
        ...issue,
        id: issueIdCounter++,
        status: 'open',
        created_at: new Date(),
        updated_at: new Date()
      };
      issues.push(newIssue);
      return newIssue;
    },
    findAll: async (filters?: { type?: any; status?: any; sort?: 'newest' | 'oldest' }) => {
      let filtered = [...issues];
      if (filters?.type && typeof filters.type === 'string') {
        filtered = filtered.filter(i => i.type === filters.type);
      }
      if (filters?.status && typeof filters.status === 'string') {
        filtered = filtered.filter(i => i.status === filters.status);
      }
      if (filters?.sort === 'newest') {
        filtered.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      } else {
        filtered.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
      }
      return filtered;
    },
    findById: async (id: number) => {
      return issues.find(i => i.id === id) || null;
    },
    update: async (id: number, updates: Partial<Omit<Issue, 'id' | 'created_at' | 'updated_at'>>) => {
      const index = issues.findIndex(i => i.id === id);
      if (index === -1) return null;
      issues[index] = {
        ...issues[index],
        ...updates,
        updated_at: new Date()
      };
      return issues[index];
    },
    delete: async (id: number) => {
      const index = issues.findIndex(i => i.id === id);
      if (index === -1) return false;
      issues.splice(index, 1);
      return true;
    }
  }
};
