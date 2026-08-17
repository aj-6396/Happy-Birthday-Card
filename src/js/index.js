//jshint esversion:8

import { isBDay } from "./ext/openDate.js";
import setPage from "./ext/setPage.js";
import { late } from "./pages.js";
import { animate } from "./animation.js";
import { initCountdown } from "./ext/countdown.js";

/******************************************************* SETUP ************************************************************/

const openDate = process.env.OPEN_DATE || process.env.BIRTH_DATE;
if (openDate) {
  const status = isBDay();
  if (status === "IS_EARLY") initCountdown();
  else if (status === "IS_LATE") setPage(late);
  else animate();
} else {
  animate();
}

