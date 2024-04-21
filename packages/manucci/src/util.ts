import { Parz } from "@disco/parz";

export const coerseStringToDateParser: Parz<Date> = {
  parse(d: unknown) {
    const date = new Date(d as string);
    if (isNaN(date.valueOf())) {
      throw new Error("Invalid date");
    }
    return date;
  },
  mock() {
    return new Date();
  },
};
