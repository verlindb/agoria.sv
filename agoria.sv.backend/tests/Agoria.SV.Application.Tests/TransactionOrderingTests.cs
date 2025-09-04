using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Agoria.SV.Application.Features.WorksCouncil.Commands.BulkAddMembers;
using Agoria.SV.Domain.Entities;
using AutoMapper;
using Moq;
using Xunit;

namespace Agoria.SV.Application.Tests;

public class TransactionOrderingTests
{
    [Fact]
    public async Task BulkAddMembers_ShouldCallWorksCouncilCreateBeforeBulkAddMemberships()
    {
        var empRepo = new Mock<Agoria.SV.Domain.Interfaces.IEmployeeRepository>();
        var worksRepo = new Mock<Agoria.SV.Domain.Interfaces.IWorksCouncilRepository>(MockBehavior.Strict);
        var orRepo = new Mock<Agoria.SV.Domain.Interfaces.IOrMembershipRepository>(MockBehavior.Strict);
        var mapper = new Mock<IMapper>();

    var tbuId = Guid.NewGuid();
    // Create an employee that belongs to the technical business unit and will be present in GetAllAsync
    var employee = new Employee(tbuId, "F", "L", "e@x", "p", "r", DateTime.UtcNow);
    var empId = Guid.NewGuid();
    typeof(Agoria.SV.Domain.Entities.Employee).GetProperty("Id")!.SetValue(employee, empId);
    empRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new List<Employee> { employee });

        // Works council does not exist -> AddAsync should be called
        var wc = new WorksCouncil(tbuId);
        worksRepo.Setup(r => r.GetByTechnicalBusinessUnitIdAsync(tbuId, It.IsAny<CancellationToken>())).ReturnsAsync((WorksCouncil?)null);
        worksRepo.Setup(r => r.AddAsync(It.IsAny<WorksCouncil>(), It.IsAny<CancellationToken>())).ReturnsAsync(wc);

        // After AddAsync, BulkAddAsync should be allowed to be called
    orRepo.Setup(r => r.GetByTechnicalBusinessUnitIdAndCategoryAsync(tbuId, It.IsAny<Agoria.SV.Domain.ValueObjects.ORCategory>(), It.IsAny<CancellationToken>())).ReturnsAsync((IEnumerable<OrMembership>)new List<OrMembership>());
    orRepo.Setup(r => r.BulkAddAsync(It.IsAny<IEnumerable<OrMembership>>(), It.IsAny<CancellationToken>())).ReturnsAsync((IEnumerable<OrMembership>)new List<OrMembership>());
    // When building the response the handler will call GetByEmployeeIdAsync for each valid employee
    orRepo.Setup(r => r.GetByEmployeeIdAsync(empId, It.IsAny<CancellationToken>())).ReturnsAsync((IEnumerable<OrMembership>)new List<OrMembership>());

    var handler = new BulkAddMembersCommandHandler(empRepo.Object, worksRepo.Object, orRepo.Object, mapper.Object);
    var command = new BulkAddMembersCommand(tbuId, new List<Guid> { empId }, "bedienden");

        var result = await handler.Handle(command, CancellationToken.None);

        // Verify ordering: GetByTechnicalBusinessUnitIdAsync then AddAsync then BulkAddAsync
        worksRepo.Verify(r => r.GetByTechnicalBusinessUnitIdAsync(tbuId, It.IsAny<CancellationToken>()), Times.Once);
        worksRepo.Verify(r => r.AddAsync(It.IsAny<WorksCouncil>(), It.IsAny<CancellationToken>()), Times.AtMostOnce);
        orRepo.Verify(r => r.BulkAddAsync(It.IsAny<IEnumerable<OrMembership>>(), It.IsAny<CancellationToken>()), Times.AtMostOnce);
    }
}
