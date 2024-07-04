export function compare<T>(a: NoInfer<T>, b: T): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export const a = compare("1", "string");

export function createMenu<T extends string>(list: T[], initial: NoInfer<T>) {
  let idx = list.findIndex((i) => i === initial);

  return {
    get() {
      return list[idx];
    },

    set(t: T) {
      if (list.includes(t)) {
        idx = list.findIndex((i) => i === t);
      } else {
        throw new Error(`Invalid menu item: ${t}`);
      }
    },
  };
}

export const menu = createMenu(["new", "open", "save"], "close");

type StandardUser = {
  type: "standard";
};

type AdminUser = {
  type: "admin";
};

type UnauthenticatedUser = {
  type: "unauthed";
};

export function getUser(): StandardUser | AdminUser {
  return { type: "admin" };
}

export function getSession(): StandardUser | UnauthenticatedUser {
  return { type: "unauthed" };
}

export const user1 = getUser();

export const user2 = getSession();

export function isTypeOfUser<T extends string>(user: { type: T }, type: NoInfer<T>) {
  return user.type === type;
}

isTypeOfUser(user2, "admin");
