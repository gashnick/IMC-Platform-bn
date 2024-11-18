import type { User } from "@/api/users/userModel";

export const users: User[] = [
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    password: ""
  },
  {
    id: 2,
    name: "Robert",
    email: "Robert@example.com",
    password: ""
  },
];

export class UserRepository {
  async findAllAsync(): Promise<User[]> {
    return users;
  }

  async findByIdAsync(id: number): Promise<User | null> {
    return users.find((user) => user.id === id) || null;
  }
}
