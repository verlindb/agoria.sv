using System.ComponentModel.DataAnnotations;

namespace Agoria.SV.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Concurrency token for optimistic concurrency checks
    [Timestamp]
    public byte[]? RowVersion { get; set; }
    
    // Additional simple integer concurrency token we can control during tests
    [System.ComponentModel.DataAnnotations.ConcurrencyCheck]
    public int Version { get; set; } = 1;
}
