namespace IntelliReq.API.Models.Enums;

public enum RequirementStatus
{
    Draft,
    Reviewed,
    Approved,
    Rejected
}

public enum RequirementPriority
{
    Low,
    Medium,
    High,
    Critical
}

public enum RequirementType
{
    Functional,
    NonFunctional,
    Business,
    Technical,
    Security,
    Performance
}
