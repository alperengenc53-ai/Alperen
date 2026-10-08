export interface AppUser {
  id: string;
  name: string; // Full name: "Ad Soyad"
  firstName?: string;
  lastName?: string;
  username: string; // email
  role?: 'user' | 'admin';
  createdAt: string;
}
