import * as bcrypt from 'bcrypt';
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS) || 10);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
