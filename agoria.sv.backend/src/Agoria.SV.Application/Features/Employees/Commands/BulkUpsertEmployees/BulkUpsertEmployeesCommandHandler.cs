using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.Employees.Commands.BulkUpsertEmployees;

public class BulkUpsertEmployeesCommandHandler : IRequestHandler<BulkUpsertEmployeesCommand, IEnumerable<EmployeeDto>>
{
    private readonly IEmployeeRepository _repository;
    private readonly IMapper _mapper;

    public BulkUpsertEmployeesCommandHandler(
        IEmployeeRepository repository,
        IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<EmployeeDto>> Handle(BulkUpsertEmployeesCommand request, CancellationToken cancellationToken)
    {
        var employees = request.Employees.Select(cmd => new Employee(
            cmd.TechnicalBusinessUnitId,
            cmd.FirstName,
            cmd.LastName,
            cmd.Email,
            cmd.Phone,
            cmd.Role,
            cmd.StartDate
        )).ToList();

        var result = await _repository.BulkUpsertAsync(employees, cancellationToken);
        return _mapper.Map<IEnumerable<EmployeeDto>>(result);
    }
}
