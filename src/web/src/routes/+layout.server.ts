import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
  return {
    session: await event.locals.getSession(),
    userid: event.locals.userid,
    isAdmin: event.locals.isAdmin
  };
};