namespace IntelliReq.API.Models.Enums;

public enum DependencyType
{
    Requires,       // SourceRequirement requires TargetRequirement
    RequiredBy,     // SourceRequirement is required by TargetRequirement
    RelatesTo,      // General relation
    ConflictsWith,  // The two requirements are in conflict
    Blocks,         // SourceRequirement blocks TargetRequirement
    Duplicates,     // SourceRequirement duplicates TargetRequirement
    Refines,        // SourceRequirement refines/elaborates TargetRequirement
    DerivedFrom     // SourceRequirement is derived from TargetRequirement
}
