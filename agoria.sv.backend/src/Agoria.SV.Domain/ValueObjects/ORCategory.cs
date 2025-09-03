namespace Agoria.SV.Domain.ValueObjects;

public enum ORCategory
{
    Arbeiders,
    Bedienden,
    Kaderleden,
    Jeugdige
}

public static class ORCategoryExtensions
{
    public static string ToStringValue(this ORCategory category)
    {
        return category switch
        {
            ORCategory.Arbeiders => "arbeiders",
            ORCategory.Bedienden => "bedienden",
            ORCategory.Kaderleden => "kaderleden",
            ORCategory.Jeugdige => "jeugdige",
            _ => throw new ArgumentOutOfRangeException(nameof(category), category, null)
        };
    }
}

public static class ORCategoryHelper
{
    public static ORCategory FromString(string value)
    {
        return value?.ToLowerInvariant() switch
        {
            "arbeiders" => ORCategory.Arbeiders,
            "bedienden" => ORCategory.Bedienden,
            "kaderleden" => ORCategory.Kaderleden,
            "jeugdige" => ORCategory.Jeugdige,
            _ => throw new ArgumentException($"Invalid ORCategory value: {value}", nameof(value))
        };
    }
}
