import { ElementDefinition } from "cytoscape";
import { v4 as uuidv4 } from "uuid";

function randint(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min));
}

export function generateGraph(n = 8, m = n * 2, acyclic = false) {
  const ids = [];
  const randName = [
    "Ali",
    "John Jack",
    "Jane Doe",
    "아름",
    "준호영",
    "미란수빈",
    "윤재현",
  ];
  for (let i = 0; i < n; i++) {
    ids.push(uuidv4());
  }

  const elements: ElementDefinition[] = [];

  ids.forEach((id) => {
    elements.push({
      data: {
        id,
        label: randName[Math.floor(Math.random() * randName.length)],
      },
    });
  });

  for (let i = 0; i < m; i++) {
    const idIndex1 = randint(0, ids.length);
    const id1 = ids[idIndex1];
    const id2 = ids[randint(acyclic ? idIndex1 + 1 : 0, ids.length)];
    elements.push({
      data: {
        source: id1,
        target: id2,
        label: randName[Math.floor(Math.random() * randName.length)],
        // label: "\uf173\n twitter vs FB",
        selfReference: { size: 50 },
      },
    });
  }
  return elements;
}
