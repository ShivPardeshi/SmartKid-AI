import { USERS } from '../mock/data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  login: async (email: string, password: string) => {
    await delay(1000);
    const user = USERS[email];
    if (user && user.password === password) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    throw new Error('Invalid email or password');
  },

  register: async (name: string, email: string, password: string) => {
    await delay(1000);
    if (USERS[email]) {
      throw new Error('Email already exists');
    }
    return {
      id: Math.random().toString(),
      name,
      email,
      age: 8,
    };
  },
};
