#!/bin/bash

# Code Coverage Report Generation Script for Agoria.SV Backend

echo "Starting code coverage analysis for Agoria.SV Backend..."

# Create coverage output directory
mkdir -p coverage

# Run tests with coverage collection
echo "Running tests with coverage collection..."
dotnet test tests/Agoria.SV.API.Tests/Agoria.SV.API.Tests.csproj \
    --configuration Release \
    --logger "trx;LogFileName=test-results.trx" \
    --results-directory ./coverage \
    /p:CollectCoverage=true \
    /p:CoverletOutputFormat=cobertura \
    /p:CoverletOutput=./coverage/coverage.cobertura.xml \
    /p:Exclude="[*.Tests]*%2c[xunit.*]*%2c[FluentAssertions]*%2c[Moq]*%2c[NBomber]*"

# Check if coverage file was generated
if [ -f "./coverage/coverage.cobertura.xml" ]; then
    echo "Coverage data collected successfully."
    
    # Generate HTML report using ReportGenerator
    echo "Generating HTML coverage report..."
    dotnet tool install --global dotnet-reportgenerator-globaltool
    reportgenerator \
        -reports:"./coverage/coverage.cobertura.xml" \
        -targetdir:"./coverage/html" \
        -reporttypes:"Html;JsonSummary" \
        -assemblyfilters:"+Agoria.SV.*" \
        -classfilters:"-*.Tests.*"
    
    echo "Coverage report generated at: ./coverage/html/index.html"
    
    # Display summary
    if [ -f "./coverage/html/Summary.json" ]; then
        echo "Coverage Summary:"
        cat ./coverage/html/Summary.json | grep -E '"summary":|"coveredlines":|"coverablelines":|"linecoverage":'
    fi
else
    echo "Error: Coverage file not generated. Check test execution."
fi

echo "Code coverage analysis complete!"