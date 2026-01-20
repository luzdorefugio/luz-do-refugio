export interface Contact {
  id?: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdBy?: string;
  createdAt?: string;
}
