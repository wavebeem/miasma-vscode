import Color from "colorjs.io";

function round(number: number): number {
  return Number(number.toFixed(2));
}

export function letsGoOKLCH(
  objName: string,
  obj: Record<string, string>
): void {
  console.log(`\n\nconst ${objName} = {`);
  for (const [name, color] of Object.entries(obj)) {
    const [l, c, h] = new Color(color).oklch.map(round);
    console.log(`  ${name}: lch(${l}, ${c}, ${h}),`);
  }
  console.log("} as const;");
}
