module {
  // Material category used to group reference records.
  public type MaterialCategory = {
    #steel;
    #aluminum;
    #plastic;
  };

  // A material property value paired with its unit.
  public type MaterialProperty = {
    value : Float;
    unit : Text;
  };

  // A material reference record with its mechanical and thermal properties.
  public type Material = {
    name : Text;
    grade : Text;
    category : MaterialCategory;
    yieldStrength : MaterialProperty;
    modulusOfElasticity : MaterialProperty;
    density : MaterialProperty;
    thermalConductivity : MaterialProperty;
    thermalExpansion : MaterialProperty;
  };
};
