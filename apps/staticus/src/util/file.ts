import { exec } from "child_process";
import { stat } from "node:fs/promises";

export async function getFileCreatedAt(filePath: string): Promise<Date> {
  const stats = await stat(filePath);
  return stats.birthtime;
}

export async function getFileUpdatedAt(filePath: string): Promise<Date> {
  const stats = await stat(filePath);
  return stats.mtime;
}

export async function getGitCreatedAt(filePath: string): Promise<Date | undefined> {
  const createdAt = await execCommand(
    `git log --diff-filter=A --follow --format=%aI -1 -- "${filePath}"`,
  );
  const date = new Date(createdAt);
  return isNaN(date.getTime()) ? undefined : date;
}

export async function getGitUpdatedAt(filePath: string) {
  const updatedAt = await execCommand(`git log -1 --format=%aI -- "${filePath}"`);
  const date = new Date(updatedAt);
  return isNaN(date.getTime()) ? undefined : date;
}

function execCommand(command: string): Promise<string> {
  const { promise, resolve, reject } = Promise.withResolvers<string>();

  exec(command, { encoding: "utf8" }, (error, stdout, stderr) => {
    if (error) {
      return reject(stderr.trim() || error.message);
    }
    resolve(stdout.trim());
  });

  return promise;
}
