"use server";

const actorList = [
  { id: 1, label: "Aidy Bryant" },
  { id: 2, label: "Beck Bennett" },
  { id: 3, label: "Kristen Stewart" },
  { id: 4, label: "Kyle Mooney" },
];

export default async function lookupAction(terms: string) {
  if (!terms) return [];

  return actorList.filter((actor) => actor.label.toLowerCase().includes(terms));
}
