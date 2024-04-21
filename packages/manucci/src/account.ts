import * as z from "@disco/parz";
import { createId } from "./id";
import { SqliteReader } from "./sqlite-reader";
import { coerseStringToDateParser } from "./util";

export const AccountId = createId("a", "Account");
export type AccountId = ReturnType<typeof AccountId>;

export type Account = {
  accountId: AccountId;
  name: string;
  balance: number; // cents;
  createdAt: Date;
};

export const schema = z.object({
  accountId: AccountId,
  name: z.string(),
  balance: z.number(),
  createdAt: coerseStringToDateParser,
});

export const tableDefinition = `
  CREATE TABLE IF NOT EXISTS account (
    accountId TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    balance INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

export class Reader extends SqliteReader<Account> {
  tableName = "account";
  selectFields = ["accountId", "name", "balance", "createdAt"];

  async transform(rows: unknown[]): Promise<Account[]> {
    return rows.map((r) => schema.parse(r));
  }
}
