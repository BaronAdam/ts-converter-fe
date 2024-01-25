import type { MetaFunction } from "@remix-run/node";
import TsConverter from "~/domain/ats-converter";

export const meta: MetaFunction = () => {
  return [
    { title: "Truck Sim Time Converter" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return <TsConverter></TsConverter>;
}
