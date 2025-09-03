using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.Employees.Commands.UpdateEmployee;

public class UpdateEmployeeCommandHandler : IRequestHandler<UpdateEmployeeCommand, EmployeeDto>
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IMapper _mapper;

    public UpdateEmployeeCommandHandler(IEmployeeRepository employeeRepository, IMapper mapper)
    {
        _employeeRepository = employeeRepository;
        _mapper = mapper;
    }

    public async Task<EmployeeDto> Handle(UpdateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var employee = await _employeeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (employee == null)
            throw new KeyNotFoundException($"Employee with ID {request.Id} not found.");

        employee.UpdateDetails(
            request.FirstName,
            request.LastName,
            request.Email,
            request.Phone,
            request.Role,
            request.StartDate);

        employee.UpdateStatus(request.Status);

        var updatedEmployee = await _employeeRepository.UpdateAsync(employee, cancellationToken);
        return _mapper.Map<EmployeeDto>(updatedEmployee);
    }
}
