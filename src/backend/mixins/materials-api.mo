import List "mo:core/List";
import Types "../types/materials";

mixin (materials : List.List<Types.Material>) {
  // List the material reference records.
  public query func listMaterials() : async [Types.Material] {
    materials.toArray();
  };
};
