import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/calculations";
import CalculationsLib "../lib/calculations";

mixin (
  calculations : Map.Map<Types.CalculationId, Types.SavedCalculation>,
  state : { var nextCalculationId : Nat },
) {
  // Save a calculation result and return its assigned id.
  public shared ({ caller }) func saveCalculation(
    calculator : Text,
    inputs : [Types.ValueEntry],
    outputs : [Types.ValueEntry],
  ) : async Types.CalculationId {
    ignore caller;
    CalculationsLib.saveCalculation(calculations, state, calculator, inputs, outputs, Time.now());
  };

  // List saved calculation results newest-first.
  public query func listCalculations() : async [Types.SavedCalculation] {
    CalculationsLib.listCalculations(calculations);
  };

  // Delete one saved calculation result by id.
  public shared ({ caller }) func deleteCalculation(id : Types.CalculationId) : async Bool {
    ignore caller;
    CalculationsLib.deleteCalculation(calculations, id);
  };
};
