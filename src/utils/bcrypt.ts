import bcrypt from "bcryptjs";

export const getHash = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  return hash;
};

export const comparePassword = async (plain_password: string, hashed_password: string) => {
  const isMatch = await bcrypt.compare(plain_password, hashed_password);
  return isMatch;
};
