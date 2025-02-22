export type User = {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  caffeine_sensitivity: number;
};

export type LoginResponse = {
  message: string;
  user: Omit<User, "first_name" | "last_name" | "caffeine_sensitivity">;
  token: string;
};

export type SignUpResponse = {
  message: string;
  user: User;
  token: string;
};
