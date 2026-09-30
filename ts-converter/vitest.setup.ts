// Arrival-time tests use local dates; pin the zone so DST changes on the
// machine running them can never shift an expected value.
process.env.TZ = "UTC";

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";
import { setSystemLanguages } from "./src/test-utils/systemLanguage";

// tests assume a Polish system unless they say otherwise
beforeEach(() => setSystemLanguages(["pl-PL"]));

afterEach(() => cleanup());
