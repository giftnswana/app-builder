mixin () {
  public query func getApiDoc() : async Text {
    let doc = "# Mechanical Engineering Toolkit API\n\n" #
      "## Purpose\n\n" #
      "Backend for a mobile-first mechanical engineering reference app. It stores\n" #
      "saved calculation results and serves a material property reference table.\n" #
      "All results are for preliminary design only and must be verified against\n" #
      "official standards.\n\n" #
      "## Authentication and authorization\n\n" #
      "- `saveCalculation` and `deleteCalculation` are update calls that accept any\n" #
      "caller, including anonymous. The caller principal is not recorded and does\n" #
      "not scope the data: saved calculations are shared across all callers.\n" #
      "- `listCalculations`, `listMaterials`, and `getApiDoc` are query calls and\n" #
      "require no authentication.\n" #
      "- The authorization mixin exposes `_initialize_access_control`,\n" #
      "`_internet_identity_sign_in_start`, `_internet_identity_sign_in_finish`,\n" #
      "`assignCallerUserRole`, `getCallerUserRole`, and `isCallerAdmin`. The first\n" #
      "caller of `_initialize_access_control` becomes admin; later callers become\n" #
      "regular users. These roles do not gate the calculation or material\n" #
      "endpoints in this version.\n" #
      "- The frontend pins an Internet Identity derivation origin, published at\n" #
      "`/.well-known/ii-derivation-origin` when available. An agent already holding\n" #
      "the user's Internet Identity authorization derives the correct per-app\n" #
      "principal against that origin (for example `icp identity link web <name>\n" #
      "--app <host>`). Such a delegation acts with the user's full authority in\n" #
      "this app until it expires.\n\n" #
      "## Units and encoding\n\n" #
      "- `Timestamp` is `Int` nanoseconds since the Unix epoch, matching\n" #
      "`Time.now()`.\n" #
      "- `CalculationId` is a `Nat` assigned sequentially from 0.\n" #
      "- `ValueEntry.value` is a `Text` decimal string; `ValueEntry.unit` is a\n" #
      "free-form unit label. Numeric parsing and unit conversion happen in the\n" #
      "frontend.\n" #
      "- `MaterialProperty.value` is a `Float` with its `unit` label.\n" #
      "- `MaterialCategory` is the variant `#steel`, `#aluminum`, or `#plastic`.\n\n" #
      "## Lifecycle and polling\n\n" #
      "- `saveCalculation` returns the new id immediately; there is no pending\n" #
      "state to poll.\n" #
      "- `listCalculations` returns all saved results sorted newest-first by\n" #
      "`createdAt`.\n" #
      "- `listMaterials` returns the built-in material reference table; it is\n" #
      "static and needs no polling.\n\n" #
      "## Mutation retry safety\n\n" #
      "- `saveCalculation` is not idempotent: each call appends a new record with a\n" #
      "fresh id. Retrying after a timeout creates a duplicate.\n" #
      "- `deleteCalculation` is idempotent: deleting an already-absent id returns\n" #
      "`false` and changes nothing.\n\n" #
      "## Errors and gotchas\n\n" #
      "- `deleteCalculation` returns `false` when no record matches the id; it does\n" #
      "not trap.\n" #
      "- Saved calculations are global, not per-user. Any caller can list and\n" #
      "delete any saved result.\n" #
      "- The OQL surface (`schema` and `execute`) is exposed for the Data\n" #
      "Intelligence agent; the saved-calculation and material tables are readable\n" #
      "by the platform controller only.";
    doc;
  };
};
