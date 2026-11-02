// The release command: runs once per deploy, before the new release starts.
import { migrate, openDb } from "./index";

const db = openDb();
const applied = migrate(db);
db.close();
console.log(applied.length ? `applied ${applied.join(", ")}` : "nothing to apply");
