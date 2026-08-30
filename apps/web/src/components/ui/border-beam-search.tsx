"use client";

import dynamic from "next/dynamic";
import type {
  BorderBeamProps,
  BorderBeamSize,
  BorderBeamTheme,
  BorderBeamColorVariant,
} from "border-beam";

export type {
  BorderBeamProps,
  BorderBeamSize,
  BorderBeamTheme,
  BorderBeamColorVariant,
};

const BorderBeam = dynamic(() => import("border-beam").then((mod) => mod.BorderBeam), {
  ssr: false,
});

export { BorderBeam };
export default BorderBeam;
