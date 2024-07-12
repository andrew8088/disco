// menu example {{{
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

export const menu = createMenu(["new", "open", "save"], "new");

// }}}

// user example {{{
type StandardUser = {
  type: "standard";
};

type AdminUser = {
  type: "admin";
};

type UnauthenticatedUser = {
  type: "unauthed";
};

type User = StandardUser | AdminUser | UnauthenticatedUser;

export function getUser(): StandardUser | AdminUser {
  return { type: "admin" };
}

export function getSession(): StandardUser | UnauthenticatedUser {
  return { type: "unauthed" };
}

export const user1 = getUser();

export const user2 = getSession();

function isTypeOfUser<T extends User["type"]>(user: { type: T }, type: NoInfer<T>) {
  return user.type === type;
}

isTypeOfUser(user1, "admin");

isTypeOfUser(user2, "standard");
