namespace Agoria.SV.Domain.ValueObjects;

public class ElectionBodies
{
    public bool Cpbw { get; private set; } // Comité (CPBW)
    public bool Or { get; private set; } // Ondernemingsraad (OR)
    public bool SdWorkers { get; private set; } // Syndicale delegatie arbeiders
    public bool SdClerks { get; private set; } // Syndicale delegatie bedienden

    protected ElectionBodies() { } // For EF Core

    public ElectionBodies(bool cpbw, bool or, bool sdWorkers, bool sdClerks)
    {
        Cpbw = cpbw;
        Or = or;
        SdWorkers = sdWorkers;
        SdClerks = sdClerks;
    }
}
