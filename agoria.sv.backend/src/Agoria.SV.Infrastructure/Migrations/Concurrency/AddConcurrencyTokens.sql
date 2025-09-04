IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Companies] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(200) NOT NULL,
    [LegalName] nvarchar(200) NOT NULL,
    [Ondernemingsnummer] nvarchar(50) NOT NULL,
    [Type] nvarchar(50) NOT NULL,
    [Status] nvarchar(50) NOT NULL,
    [Sector] nvarchar(100) NOT NULL,
    [NumberOfEmployees] int NOT NULL,
    [Address_Street] nvarchar(200) NOT NULL,
    [Address_Number] nvarchar(20) NOT NULL,
    [Address_PostalCode] nvarchar(20) NOT NULL,
    [Address_City] nvarchar(100) NOT NULL,
    [Address_Country] nvarchar(100) NOT NULL,
    [ContactPerson_FirstName] nvarchar(100) NOT NULL,
    [ContactPerson_LastName] nvarchar(100) NOT NULL,
    [ContactPerson_Email] nvarchar(200) NOT NULL,
    [ContactPerson_Phone] nvarchar(50) NOT NULL,
    [ContactPerson_Function] nvarchar(100) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Companies] PRIMARY KEY ([Id])
);

CREATE UNIQUE INDEX [IX_Companies_Ondernemingsnummer] ON [Companies] ([Ondernemingsnummer]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250901151931_RenameJuridischeEntiteitenToCompanies', N'9.0.0');

CREATE TABLE [TechnicalBusinessUnits] (
    [Id] uniqueidentifier NOT NULL,
    [CompanyId] uniqueidentifier NOT NULL,
    [Name] nvarchar(200) NOT NULL,
    [Code] nvarchar(50) NOT NULL,
    [Description] nvarchar(500) NOT NULL,
    [NumberOfEmployees] int NOT NULL,
    [Manager] nvarchar(100) NOT NULL,
    [Department] nvarchar(100) NOT NULL,
    [Location_Street] nvarchar(200) NOT NULL,
    [Location_Number] nvarchar(20) NOT NULL,
    [Location_PostalCode] nvarchar(20) NOT NULL,
    [Location_City] nvarchar(100) NOT NULL,
    [Location_Country] nvarchar(100) NOT NULL,
    [Status] nvarchar(50) NOT NULL,
    [Language] nvarchar(10) NOT NULL,
    [PcWorkers] nvarchar(100) NOT NULL,
    [PcClerks] nvarchar(100) NOT NULL,
    [FodDossierBase] nvarchar(20) NOT NULL,
    [FodDossierSuffix] nvarchar(5) NOT NULL,
    [ElectionBodies_Cpbw] bit NOT NULL,
    [ElectionBodies_Or] bit NOT NULL,
    [ElectionBodies_SdWorkers] bit NOT NULL,
    [ElectionBodies_SdClerks] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_TechnicalBusinessUnits] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_TechnicalBusinessUnits_Companies_CompanyId] FOREIGN KEY ([CompanyId]) REFERENCES [Companies] ([Id]) ON DELETE NO ACTION
);

CREATE UNIQUE INDEX [IX_TechnicalBusinessUnits_Code] ON [TechnicalBusinessUnits] ([Code]);

CREATE INDEX [IX_TechnicalBusinessUnits_CompanyId] ON [TechnicalBusinessUnits] ([CompanyId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250902114341_AddTechnicalBusinessUnits', N'9.0.0');

CREATE TABLE [Employees] (
    [Id] uniqueidentifier NOT NULL,
    [TechnicalBusinessUnitId] uniqueidentifier NOT NULL,
    [FirstName] nvarchar(100) NOT NULL,
    [LastName] nvarchar(100) NOT NULL,
    [Email] nvarchar(200) NOT NULL,
    [Phone] nvarchar(50) NOT NULL,
    [Role] nvarchar(100) NOT NULL,
    [StartDate] datetime2 NOT NULL,
    [Status] nvarchar(50) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Employees] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Employees_TechnicalBusinessUnits_TechnicalBusinessUnitId] FOREIGN KEY ([TechnicalBusinessUnitId]) REFERENCES [TechnicalBusinessUnits] ([Id]) ON DELETE NO ACTION
);

CREATE UNIQUE INDEX [IX_Employees_Email] ON [Employees] ([Email]);

CREATE INDEX [IX_Employees_TechnicalBusinessUnitId] ON [Employees] ([TechnicalBusinessUnitId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250902121102_AddEmployees', N'9.0.0');

CREATE TABLE [WorksCouncils] (
    [Id] uniqueidentifier NOT NULL,
    [TechnicalBusinessUnitId] uniqueidentifier NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_WorksCouncils] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WorksCouncils_TechnicalBusinessUnits_TechnicalBusinessUnitId] FOREIGN KEY ([TechnicalBusinessUnitId]) REFERENCES [TechnicalBusinessUnits] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [OrMemberships] (
    [Id] uniqueidentifier NOT NULL,
    [WorksCouncilId] uniqueidentifier NOT NULL,
    [TechnicalBusinessUnitId] uniqueidentifier NOT NULL,
    [EmployeeId] uniqueidentifier NOT NULL,
    [Category] nvarchar(50) NOT NULL,
    [Order] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_OrMemberships] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_OrMemberships_Employees_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Employees] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_OrMemberships_TechnicalBusinessUnits_TechnicalBusinessUnitId] FOREIGN KEY ([TechnicalBusinessUnitId]) REFERENCES [TechnicalBusinessUnits] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_OrMemberships_WorksCouncils_WorksCouncilId] FOREIGN KEY ([WorksCouncilId]) REFERENCES [WorksCouncils] ([Id]) ON DELETE CASCADE
);

CREATE UNIQUE INDEX [IX_OrMemberships_EmployeeId_Category] ON [OrMemberships] ([EmployeeId], [Category]);

CREATE INDEX [IX_OrMemberships_TechnicalBusinessUnitId] ON [OrMemberships] ([TechnicalBusinessUnitId]);

CREATE INDEX [IX_OrMemberships_WorksCouncilId] ON [OrMemberships] ([WorksCouncilId]);

CREATE UNIQUE INDEX [IX_WorksCouncils_TechnicalBusinessUnitId] ON [WorksCouncils] ([TechnicalBusinessUnitId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250902153005_AddWorksCouncilAndOrMembership', N'9.0.0');

ALTER TABLE [WorksCouncils] ADD [RowVersion] rowversion NOT NULL;

ALTER TABLE [WorksCouncils] ADD [Version] int NOT NULL DEFAULT 1;

ALTER TABLE [TechnicalBusinessUnits] ADD [RowVersion] rowversion NOT NULL;

ALTER TABLE [TechnicalBusinessUnits] ADD [Version] int NOT NULL DEFAULT 1;

ALTER TABLE [OrMemberships] ADD [RowVersion] rowversion NOT NULL;

ALTER TABLE [OrMemberships] ADD [Version] int NOT NULL DEFAULT 1;

ALTER TABLE [Employees] ADD [RowVersion] rowversion NOT NULL;

ALTER TABLE [Employees] ADD [Version] int NOT NULL DEFAULT 1;

ALTER TABLE [Companies] ADD [RowVersion] rowversion NOT NULL;

ALTER TABLE [Companies] ADD [Version] int NOT NULL DEFAULT 1;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250904081656_AddConcurrencyTokens', N'9.0.0');

COMMIT;
GO

