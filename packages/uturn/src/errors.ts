import { createErrorClass } from "@disco/common";
import { Req } from "./uturn";

export const UturnParseError = createErrorClass<Req>("UturnParseError");
