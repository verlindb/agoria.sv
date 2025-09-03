using Agoria.SV.Domain.Common;
using Agoria.SV.Domain.ValueObjects;

namespace Agoria.SV.Domain.Entities;

public class TechnicalBusinessUnit : BaseEntity
{
    public Guid CompanyId { get; set; } = Guid.Empty;
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int NumberOfEmployees { get; set; }
    public string Manager { get; set; } = string.Empty; // Employee ID reference
    public string Department { get; set; } = string.Empty;
    public Address Location { get; set; } = null!;

    private string _status = "active";
    public string Status
    {
        get => _status;
        set
        {
            if (value != "active" && value != "inactive")
                throw new ArgumentException("Status must be 'active' or 'inactive'.");
            _status = value;
        }
    }

    private string _language = "N";
    public string Language
    {
        get => _language;
        set
        {
            if (value != "N" && value != "F" && value != "N+F" && value != "D")
                throw new ArgumentException("Language must be 'N', 'F', 'N+F', or 'D'.");
            _language = value;
        }
    }

    public string PcWorkers { get; set; } = string.Empty; // Paritair comité arbeiders
    public string PcClerks { get; set; } = string.Empty; // Paritair comité bedienden
    public string FodDossierBase { get; set; } = string.Empty; // First 5 digits only

    private string _fodDossierSuffix = "1";
    public string FodDossierSuffix
    {
        get => _fodDossierSuffix;
        set
        {
            if (value != "1" && value != "2")
                throw new ArgumentException("FOD dossier suffix must be '1' or '2'.");
            _fodDossierSuffix = value;
        }
    }

    public ElectionBodies ElectionBodies { get; set; } = null!;

    // Navigation property
    public Company Company { get; set; } = null!;
}
