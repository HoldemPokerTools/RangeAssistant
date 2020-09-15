import Ajv from "ajv";
import schema from "./range.schema.json";

const ajv = new Ajv();
ajv.addSchema(schema);
export const validateActions = ajv.getSchema("actions");
export const validateCombos = ajv.getSchema("combos");
export const validate = ajv.compile(schema);
