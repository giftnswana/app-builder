import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Map "mo:core/Map";
import List "mo:core/List";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import CalculationTypes "types/calculations";
import MaterialTypes "types/materials";
import CalculationsLib "lib/calculations";
import CalculationsApi "mixins/calculations-api";
import MaterialsApi "mixins/materials-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let calculations : Map.Map<CalculationTypes.CalculationId, CalculationTypes.SavedCalculation>;
  let calculationState : { var nextCalculationId : Nat };
  let materials : List.List<MaterialTypes.Material>;

  include MixinAuthorization(accessControlState, null);
  include CalculationsApi(calculations, calculationState);
  include MaterialsApi(materials);
  include ApiDocMixin();
  include Expose({
    entities = [
      OQL.Entity.manual<CalculationTypes.SavedCalculation>(
        "calculation",
        func () = calculations.values(),
        "SavedCalculation",
        "id",
      )
        .sample({
          id = 0;
          calculator = "";
          inputs = [{ name = ""; value = ""; unit = "" }];
          outputs = [{ name = ""; value = ""; unit = "" }];
          createdAt = 0;
        })
        .payload("id", func c = c.id)
        .payload("calculator", func c = c.calculator)
        .payload("inputs", func c = CalculationsLib.entriesToText(c.inputs))
        .payload("outputs", func c = CalculationsLib.entriesToText(c.outputs))
        .payload("createdAt", func c = c.createdAt)
        .controllerOnly()
        .build(),
      OQL.Entity.manual<MaterialTypes.Material>(
        "material",
        func () = materials.values(),
        "Material",
        "name",
      )
        .sample({
          name = "";
          grade = "";
          category = #steel;
          yieldStrength = { value = 0.0; unit = "" };
          modulusOfElasticity = { value = 0.0; unit = "" };
          density = { value = 0.0; unit = "" };
          thermalConductivity = { value = 0.0; unit = "" };
          thermalExpansion = { value = 0.0; unit = "" };
        })
        .payload("name", func m = m.name)
        .payload("grade", func m = m.grade)
        .payload("category", func m = switch (m.category) {
          case (#steel) "steel";
          case (#aluminum) "aluminum";
          case (#plastic) "plastic";
        })
        .payload("yieldStrength", func m = m.yieldStrength.value)
        .payload("yieldStrengthUnit", func m = m.yieldStrength.unit)
        .payload("modulusOfElasticity", func m = m.modulusOfElasticity.value)
        .payload("modulusOfElasticityUnit", func m = m.modulusOfElasticity.unit)
        .payload("density", func m = m.density.value)
        .payload("densityUnit", func m = m.density.unit)
        .payload("thermalConductivity", func m = m.thermalConductivity.value)
        .payload("thermalConductivityUnit", func m = m.thermalConductivity.unit)
        .payload("thermalExpansion", func m = m.thermalExpansion.value)
        .payload("thermalExpansionUnit", func m = m.thermalExpansion.unit)
        .controllerOnly()
        .build(),
    ];
  });
};
