namespace Agoria.SV.Application.DTOs;

public record OrMembershipDto(
    Guid Id,
    Guid WorksCouncilId,
    Guid TechnicalBusinessUnitId,
    Guid EmployeeId,
    string Category,
    int Order,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record BulkOrMembershipRequestDto(
    IEnumerable<Guid> EmployeeIds,
    string Category
);

public record ReorderOrMembershipRequestDto(
    string Category,
    IEnumerable<Guid> OrderedIds
);

public record AddOrMembershipRequestDto(
    Guid EmployeeId,
    string Category
);

public record RemoveOrMembershipRequestDto(
    Guid EmployeeId,
    string Category
);
