#nullable enable
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Agoria.SV.Application.Features.WorksCouncil.Commands.AddMember;
using Agoria.SV.Application.Features.WorksCouncil.Commands.BulkAddMembers;
using Agoria.SV.Application.Features.WorksCouncil.Commands.BulkRemoveMembers;
using Agoria.SV.Application.Features.WorksCouncil.Commands.RemoveMember;
using Agoria.SV.Application.Features.WorksCouncil.Commands.ReorderMembers;
using Agoria.SV.Application.Features.WorksCouncil.Queries.GetMembers;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using AutoMapper;
using FluentAssertions;
using Moq;
using Xunit;

namespace Agoria.SV.Application.Tests;

public class WorksCouncilHandlersTests
{
    [Fact]
    public async Task AddMember_WhenEmployeeMissing_ShouldThrow()
    {
        var empRepo = new Mock<Agoria.SV.Domain.Interfaces.IEmployeeRepository>();
        var worksRepo = new Mock<Agoria.SV.Domain.Interfaces.IWorksCouncilRepository>();
        var orRepo = new Mock<Agoria.SV.Domain.Interfaces.IOrMembershipRepository>();
        var mapper = new Mock<IMapper>();

        empRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((Employee?)null);

    var handler = new AddMemberCommandHandler(empRepo.Object, worksRepo.Object, orRepo.Object, mapper.Object);
    var command = new AddMemberCommand(Guid.NewGuid(), "bedienden");

        await Assert.ThrowsAsync<KeyNotFoundException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task RemoveMember_WhenNotMember_ShouldThrow()
    {
        var empRepo = new Mock<Agoria.SV.Domain.Interfaces.IEmployeeRepository>();
        var orRepo = new Mock<Agoria.SV.Domain.Interfaces.IOrMembershipRepository>();
        var mapper = new Mock<IMapper>();

    var technicalUnitId = Guid.NewGuid();
    var employee = new Employee(technicalUnitId, "F", "L", "e@x", "p", "r", DateTime.UtcNow);
    // set Id via reflection-friendly constructor pattern if necessary (domain exposes Id setter internally in tests)
    var empId = Guid.NewGuid();
    typeof(Agoria.SV.Domain.Entities.Employee).GetProperty("Id")!.SetValue(employee, empId);
        empRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(employee);
        orRepo.Setup(r => r.DeleteByEmployeeIdAndCategoryAsync(It.IsAny<Guid>(), It.IsAny<Agoria.SV.Domain.ValueObjects.ORCategory>(), It.IsAny<CancellationToken>())).ReturnsAsync(false);

    var handler = new RemoveMemberCommandHandler(empRepo.Object, orRepo.Object, mapper.Object);
    var command = new RemoveMemberCommand(empId, "bedienden");

        await Assert.ThrowsAsync<KeyNotFoundException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task BulkAddMembers_WhenEmptyList_ReturnsEmpty()
    {
        var empRepo = new Mock<Agoria.SV.Domain.Interfaces.IEmployeeRepository>();
        var worksRepo = new Mock<Agoria.SV.Domain.Interfaces.IWorksCouncilRepository>();
        var orRepo = new Mock<Agoria.SV.Domain.Interfaces.IOrMembershipRepository>();
        var mapper = new Mock<IMapper>();

    var handler = new BulkAddMembersCommandHandler(empRepo.Object, worksRepo.Object, orRepo.Object, mapper.Object);
    var command = new BulkAddMembersCommand(Guid.NewGuid(), Enumerable.Empty<Guid>(), "bedienden");

        var result = await handler.Handle(command, CancellationToken.None);
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task BulkRemoveMembers_WhenEmptyList_ReturnsEmpty()
    {
        var empRepo = new Mock<Agoria.SV.Domain.Interfaces.IEmployeeRepository>();
        var orRepo = new Mock<Agoria.SV.Domain.Interfaces.IOrMembershipRepository>();
        var mapper = new Mock<IMapper>();

    var handler = new BulkRemoveMembersCommandHandler(empRepo.Object, orRepo.Object, mapper.Object);
    var command = new BulkRemoveMembersCommand(Guid.NewGuid(), Enumerable.Empty<Guid>(), "bedienden");

        var result = await handler.Handle(command, CancellationToken.None);
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task ReorderMembers_WhenNoMemberships_ReturnsEmpty()
    {
        var empRepo = new Mock<Agoria.SV.Domain.Interfaces.IEmployeeRepository>();
        var orRepo = new Mock<Agoria.SV.Domain.Interfaces.IOrMembershipRepository>();
        var mapper = new Mock<IMapper>();

        orRepo.Setup(r => r.GetByTechnicalBusinessUnitIdAndCategoryAsync(It.IsAny<Guid>(), It.IsAny<Agoria.SV.Domain.ValueObjects.ORCategory>(), It.IsAny<CancellationToken>())).ReturnsAsync(new List<Agoria.SV.Domain.Entities.OrMembership>());
        empRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new List<Employee>());

    var handler = new ReorderMembersCommandHandler(empRepo.Object, orRepo.Object, mapper.Object);
    var command = new ReorderMembersCommand(Guid.NewGuid(), "bedienden", Enumerable.Empty<Guid>());

        var result = await handler.Handle(command, CancellationToken.None);
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetMembers_WhenNoMemberships_ReturnsEmpty()
    {
        var empRepo = new Mock<Agoria.SV.Domain.Interfaces.IEmployeeRepository>();
        var orRepo = new Mock<Agoria.SV.Domain.Interfaces.IOrMembershipRepository>();
        var mapper = new Mock<IMapper>();

        orRepo.Setup(r => r.GetByTechnicalBusinessUnitIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(new List<Agoria.SV.Domain.Entities.OrMembership>());
        empRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new List<Employee>());

        var handler = new GetMembersQueryHandler(empRepo.Object, orRepo.Object, mapper.Object);
        var query = new GetMembersQuery(Guid.NewGuid(), null);

        var result = await handler.Handle(query, CancellationToken.None);
        result.Should().BeEmpty();
    }
}
