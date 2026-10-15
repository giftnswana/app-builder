import Map "mo:core/Map";
import Types "../types/calculations";

module {
  // Persist a new saved calculation and return its assigned id.
  public func saveCalculation(
    calculations : Map.Map<Types.CalculationId, Types.SavedCalculation>,
    state : { var nextCalculationId : Nat },
    calculator : Text,
    inputs : [Types.ValueEntry],
    outputs : [Types.ValueEntry],
    createdAt : Types.Timestamp,
  ) : Types.CalculationId {
    let id = state.nextCalculationId;
    state.nextCalculationId := id + 1;
    calculations.add(id, {
      id;
      calculator;
      inputs;
      outputs;
      createdAt;
    });
    id;
  };

  // List saved calculations newest-first.
  public func listCalculations(
    calculations : Map.Map<Types.CalculationId, Types.SavedCalculation>
  ) : [Types.SavedCalculation] {
    let all = calculations.values().toArray();
    all.sort(func (a, b) = if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) { #greater } else { #equal });
  };

  // Delete one saved calculation by id; returns whether a record was removed.
  public func deleteCalculation(
    calculations : Map.Map<Types.CalculationId, Types.SavedCalculation>,
    id : Types.CalculationId,
  ) : Bool {
    switch (calculations.get(id)) {
      case (?_) {
        calculations.remove(id);
        true;
      };
      case null { false };
    };
  };

  // Render a list of labelled values as a single queryable text column.
  public func entriesToText(entries : [Types.ValueEntry]) : Text {
    entries.values().map(func e = e.name # "=" # e.value # " " # e.unit).join("; ");
  };
};
