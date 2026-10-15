import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/calculations";

module {
  // Persist a saved calculation, assigning it the next stable id.
  public func save(
    calculations : Map.Map<Types.CalculationId, Types.SavedCalculation>,
    state : { var nextCalculationId : Nat },
    calculator : Text,
    inputs : [Types.ValueEntry],
    outputs : [Types.ValueEntry],
  ) : Types.CalculationId {
    let id = state.nextCalculationId;
    state.nextCalculationId := id + 1;
    calculations.add(id, {
      id;
      calculator;
      inputs;
      outputs;
      createdAt = Time.now();
    });
    id;
  };

  // List saved calculations newest-first.
  public func list(
    calculations : Map.Map<Types.CalculationId, Types.SavedCalculation>
  ) : [Types.SavedCalculation] {
    let all = calculations.values().toArray();
    all.sort(func (a, b) = if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) { #greater } else { #equal });
  };

  // Delete one saved calculation by id; returns whether a record was removed.
  public func delete(
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
};
