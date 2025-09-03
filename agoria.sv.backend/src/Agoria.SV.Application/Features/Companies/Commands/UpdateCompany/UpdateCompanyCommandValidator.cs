using FluentValidation;

namespace Agoria.SV.Application.Features.Companies.Commands.UpdateCompany;

public class UpdateCompanyCommandValidator : AbstractValidator<UpdateCompanyCommand>
{
    public UpdateCompanyCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.LegalName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Ondernemingsnummer).NotEmpty().Matches(@"^BE\d{10}$");
        RuleFor(x => x.Type).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Status).NotEmpty().Must(s => s == "active" || s == "inactive" || s == "pending")
            .WithMessage("Status must be 'active', 'inactive', or 'pending'.");
        RuleFor(x => x.Sector).NotEmpty().MaximumLength(100);
        RuleFor(x => x.NumberOfEmployees).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Address).NotNull();
        RuleFor(x => x.Address.Street).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Address.Number).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Address.PostalCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Address.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Address.Country).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ContactPerson).NotNull();
        RuleFor(x => x.ContactPerson.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ContactPerson.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ContactPerson.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.ContactPerson.Phone).NotEmpty().MaximumLength(50);
    }
}
