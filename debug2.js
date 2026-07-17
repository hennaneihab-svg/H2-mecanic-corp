async function main() {
  const url = "https://firestore.googleapis.com/v1/projects/h2-mechanic-corp/databases/(default)/documents/appointments";
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
main();
