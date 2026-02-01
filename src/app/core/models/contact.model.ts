export interface Contact {
  id?: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdBy?: string;
  createdAt?: string;
}
