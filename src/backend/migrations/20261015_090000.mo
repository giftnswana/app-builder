import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import List "mo:core/List";

module {
  // Previous deployed stable shape: only the authorization state.
  type OldActor = { accessControlState : AccessControl.AccessControlState };

  type ValueEntry = {
    name : Text;
    value : Text;
    unit : Text;
  };

  type SavedCalculation = {
    id : Nat;
    calculator : Text;
    inputs : [ValueEntry];
    outputs : [ValueEntry];
    createdAt : Int;
  };

  type MaterialCategory = {
    #steel;
    #aluminum;
    #plastic;
  };

  type MaterialProperty = {
    value : Float;
    unit : Text;
  };

  type Material = {
    name : Text;
    grade : Text;
    category : MaterialCategory;
    yieldStrength : MaterialProperty;
    modulusOfElasticity : MaterialProperty;
    density : MaterialProperty;
    thermalConductivity : MaterialProperty;
    thermalExpansion : MaterialProperty;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    calculations : Map.Map<Nat, SavedCalculation>;
    calculationState : { var nextCalculationId : Nat };
    materials : List.List<Material>;
  };

  func seedMaterials() : List.List<Material> {
    let materials = List.empty<Material>();

    func add(
      name : Text,
      grade : Text,
      category : MaterialCategory,
      yieldStrength : Float,
      modulusOfElasticity : Float,
      density : Float,
      thermalConductivity : Float,
      thermalExpansion : Float,
    ) {
      materials.add({
        name;
        grade;
        category;
        yieldStrength = { value = yieldStrength; unit = "MPa" };
        modulusOfElasticity = { value = modulusOfElasticity; unit = "MPa" };
        density = { value = density; unit = "kg/m^3" };
        thermalConductivity = { value = thermalConductivity; unit = "W/(m*K)" };
        thermalExpansion = { value = thermalExpansion; unit = "1e-6/K" };
      });
    };

    // --- Steels ---
    add("Carbon Steel", "AISI 1018", #steel, 370.0, 205000.0, 7870.0, 51.9, 11.7);
    add("Carbon Steel", "AISI 1045", #steel, 530.0, 205000.0, 7850.0, 49.8, 11.5);
    add("Carbon Steel", "AISI 1080", #steel, 585.0, 205000.0, 7840.0, 46.6, 11.0);
    add("Alloy Steel", "AISI 4140", #steel, 655.0, 210000.0, 7850.0, 42.6, 12.2);
    add("Alloy Steel", "AISI 4340", #steel, 470.0, 205000.0, 7850.0, 44.5, 12.3);
    add("Alloy Steel", "AISI 8620", #steel, 360.0, 205000.0, 7850.0, 46.6, 12.0);
    add("Stainless Steel", "AISI 304", #steel, 215.0, 193000.0, 8000.0, 16.2, 17.3);
    add("Stainless Steel", "AISI 316", #steel, 205.0, 193000.0, 8000.0, 16.3, 16.0);
    add("Stainless Steel", "AISI 410", #steel, 275.0, 200000.0, 7800.0, 24.9, 9.9);
    add("Stainless Steel", "AISI 420", #steel, 345.0, 200000.0, 7800.0, 24.9, 10.3);
    add("Stainless Steel", "AISI 17-4 PH", #steel, 1100.0, 196000.0, 7800.0, 18.4, 10.8);
    add("Tool Steel", "AISI D2", #steel, 1500.0, 210000.0, 7700.0, 20.0, 10.4);
    add("Tool Steel", "AISI O1", #steel, 1400.0, 210000.0, 7800.0, 30.0, 12.0);
    add("Tool Steel", "AISI H13", #steel, 1380.0, 210000.0, 7800.0, 24.3, 11.5);
    add("Tool Steel", "AISI M2", #steel, 1600.0, 210000.0, 8100.0, 24.0, 11.0);
    add("Cast Iron", "Gray Iron Class 30", #steel, 214.0, 100000.0, 7200.0, 46.0, 11.0);
    add("Cast Iron", "Ductile Iron 65-45-12", #steel, 310.0, 169000.0, 7100.0, 36.0, 11.5);
    add("Cast Iron", "White Iron", #steel, 400.0, 170000.0, 7500.0, 40.0, 10.0);
    add("Spring Steel", "AISI 5160", #steel, 690.0, 207000.0, 7850.0, 42.0, 11.5);
    add("Spring Steel", "AISI 9260", #steel, 760.0, 207000.0, 7850.0, 42.0, 11.0);
    add("Maraging Steel", "Grade 250", #steel, 1720.0, 190000.0, 8000.0, 25.0, 10.0);
    add("Maraging Steel", "Grade 350", #steel, 2400.0, 190000.0, 8100.0, 25.0, 10.0);
    add("HSLA Steel", "ASTM A572 Gr.50", #steel, 345.0, 200000.0, 7850.0, 50.0, 12.0);
    add("HSLA Steel", "ASTM A588", #steel, 345.0, 200000.0, 7850.0, 50.0, 12.0);
    add("Bearing Steel", "AISI 52100", #steel, 1700.0, 210000.0, 7810.0, 46.6, 12.5);
    add("Nitriding Steel", "AISI 4140 Nitrided", #steel, 900.0, 210000.0, 7850.0, 42.6, 12.2);
    add("Carbon Steel", "AISI 1020", #steel, 350.0, 205000.0, 7870.0, 51.9, 11.7);
    add("Carbon Steel", "AISI 1040", #steel, 490.0, 205000.0, 7850.0, 50.0, 11.5);
    add("Stainless Steel", "AISI 2205 Duplex", #steel, 450.0, 200000.0, 7800.0, 19.0, 13.7);
    add("Stainless Steel", "AISI 430", #steel, 310.0, 200000.0, 7700.0, 26.1, 10.4);

    // --- Aluminum ---
    add("Aluminum", "1050-H14", #aluminum, 103.0, 69000.0, 2705.0, 231.0, 23.6);
    add("Aluminum", "1100-H14", #aluminum, 117.0, 69000.0, 2710.0, 218.0, 23.6);
    add("Aluminum", "2024-T3", #aluminum, 345.0, 73100.0, 2780.0, 121.0, 23.2);
    add("Aluminum", "2024-T4", #aluminum, 324.0, 73100.0, 2780.0, 121.0, 23.2);
    add("Aluminum", "3003-H14", #aluminum, 145.0, 68900.0, 2730.0, 159.0, 23.2);
    add("Aluminum", "5052-H32", #aluminum, 193.0, 70300.0, 2680.0, 138.0, 23.8);
    add("Aluminum", "6061-T4", #aluminum, 145.0, 68900.0, 2700.0, 154.0, 23.6);
    add("Aluminum", "6061-T6", #aluminum, 276.0, 68900.0, 2700.0, 167.0, 23.6);
    add("Aluminum", "6063-T5", #aluminum, 145.0, 68900.0, 2700.0, 201.0, 23.4);
    add("Aluminum", "7075-T6", #aluminum, 503.0, 71700.0, 2810.0, 130.0, 23.6);
    add("Aluminum", "7075-T651", #aluminum, 462.0, 71700.0, 2810.0, 130.0, 23.6);
    add("Aluminum", "2011-T3", #aluminum, 296.0, 70300.0, 2830.0, 151.0, 23.0);
    add("Aluminum", "5083-H116", #aluminum, 228.0, 71000.0, 2660.0, 117.0, 23.8);
    add("Aluminum", "6082-T6", #aluminum, 310.0, 70000.0, 2700.0, 170.0, 23.4);
    add("Aluminum", "356-T6 Cast", #aluminum, 207.0, 72400.0, 2685.0, 151.0, 21.5);

    // --- Plastics ---
    add("ABS", "General Purpose", #plastic, 40.0, 2300.0, 1040.0, 0.18, 90.0);
    add("ABS", "High Impact", #plastic, 35.0, 2000.0, 1030.0, 0.17, 95.0);
    add("Acetal (POM)", "Copolymer", #plastic, 66.0, 3100.0, 1410.0, 0.31, 110.0);
    add("Acetal (POM)", "Homopolymer", #plastic, 70.0, 3300.0, 1420.0, 0.37, 100.0);
    add("Acrylic (PMMA)", "Cast", #plastic, 65.0, 3200.0, 1180.0, 0.19, 70.0);
    add("Nylon 6", "Unfilled", #plastic, 80.0, 2900.0, 1130.0, 0.25, 80.0);
    add("Nylon 6/6", "Unfilled", #plastic, 82.0, 3000.0, 1140.0, 0.26, 80.0);
    add("Nylon 6/6", "30% Glass Filled", #plastic, 160.0, 9500.0, 1370.0, 0.30, 30.0);
    add("Polycarbonate", "Unfilled", #plastic, 62.0, 2400.0, 1200.0, 0.20, 68.0);
    add("Polycarbonate", "20% Glass Filled", #plastic, 110.0, 6000.0, 1340.0, 0.22, 40.0);
    add("Polyethylene", "HDPE", #plastic, 26.0, 1100.0, 950.0, 0.45, 120.0);
    add("Polyethylene", "LDPE", #plastic, 15.0, 300.0, 920.0, 0.33, 180.0);
    add("Polyethylene", "UHMW", #plastic, 21.0, 800.0, 930.0, 0.42, 130.0);
    add("Polypropylene", "Homopolymer", #plastic, 33.0, 1500.0, 905.0, 0.22, 100.0);
    add("Polypropylene", "30% Glass Filled", #plastic, 60.0, 5500.0, 1120.0, 0.25, 45.0);
    add("Polystyrene", "General Purpose", #plastic, 45.0, 3200.0, 1050.0, 0.16, 70.0);
    add("PVC", "Rigid", #plastic, 52.0, 3000.0, 1400.0, 0.16, 60.0);
    add("PEEK", "Unfilled", #plastic, 100.0, 3700.0, 1300.0, 0.25, 47.0);
    add("PEEK", "30% Glass Filled", #plastic, 160.0, 11000.0, 1510.0, 0.30, 25.0);
    add("PTFE", "Unfilled", #plastic, 23.0, 500.0, 2200.0, 0.25, 135.0);
    add("PET", "Unfilled", #plastic, 75.0, 2800.0, 1380.0, 0.24, 70.0);
    add("Polyurethane", "Rigid", #plastic, 55.0, 2500.0, 1200.0, 0.22, 90.0);
    add("Epoxy", "Cast", #plastic, 60.0, 3000.0, 1150.0, 0.20, 60.0);
    add("Phenolic", "General Purpose", #plastic, 48.0, 6000.0, 1300.0, 0.30, 40.0);
    add("Polysulfone", "Unfilled", #plastic, 70.0, 2700.0, 1240.0, 0.26, 56.0);

    materials;
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      calculations = Map.empty();
      calculationState = { var nextCalculationId = 0 };
      materials = seedMaterials();
    };
  };
};
