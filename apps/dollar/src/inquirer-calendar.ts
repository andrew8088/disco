import {
  createPrompt,
  useState,
  useKeypress,
  isEnterKey,
  isUpKey,
  isDownKey,
  KeypressEvent,
  makeTheme,
  usePrefix,
} from "@inquirer/core";
import { add, format } from "date-fns";

type Config = {
  message: string;
};

const elements = ["years", "months", "days", "hours", "minutes"] as const;
const formats = [
  "|yyyy|-MM-dd HH:mm",
  "yyyy-|MM|-dd HH:mm",
  "yyyy-MM-|dd| HH:mm",
  "yyyy-MM-dd |HH|:mm",
  "yyyy-MM-dd HH:|mm|",
] as const;

export const calendar = createPrompt<Date, Config>((config, done) => {
  const theme = makeTheme();
  const [date, setDate] = useState(new Date());
  const [elIdx, setElIdx] = useState(0);
  const elementName = elements[elIdx];
  const prefix = usePrefix({});

  useKeypress((key) => {
    switch (true) {
      case isEnterKey(key):
        return done(date);
      case isUpKey(key):
        return setDate(add(date, { [elementName]: -1 }));
      case isDownKey(key):
        return setDate(add(date, { [elementName]: 1 }));
      case isLeftKey(key):
        return setElIdx(Math.max(elIdx - 1, 0));
      case isRightKey(key):
        return setElIdx(Math.min(elIdx + 1, elements.length - 1));
    }
  });

  const [start, toHighlight, end] = format(date, formats[elIdx]).split("|");

  return `${prefix} ${config.message}: ${start}${theme.style.highlight(toHighlight)}${end}`;
});

function isLeftKey(key: KeypressEvent): boolean {
  return key.name === "left" || key.name === "h";
}

function isRightKey(key: KeypressEvent): boolean {
  return key.name === "right" || key.name === "l";
}
