import Common "common";

module {
  public type CalculationId = Common.CalculationId;
  public type Timestamp = Common.Timestamp;

  // A single labelled value with its unit, as entered or produced by a
  // calculator or converter.
  public type ValueEntry = {
    name : Text;
    value : Text;
    unit : Text;
  };

  // A saved calculation result: the calculator or converter that produced it,
  // its inputs and outputs, and when it was saved.
  public type SavedCalculation = {
    id : CalculationId;
    calculator : Text;
    inputs : [ValueEntry];
    outputs : [ValueEntry];
    createdAt : Timestamp;
  };
};
