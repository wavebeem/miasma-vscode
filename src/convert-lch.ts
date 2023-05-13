import "./colord";
import { colord } from "colord";

export function letsGoLCH(objName: string, obj: Record<string, string>): void {
  function round(n: number): number {
    return Number(n.toFixed(0));
  }
  console.log(`\n\nconst ${objName} = {`);
  for (const [name, color] of Object.entries(obj)) {
    const { l, c, h } = colord(color).toLch();
    console.log(`  ${name}: lch(${round(l)}, ${round(c)}, ${round(h)}),`);
  }
  console.log("};");
}
