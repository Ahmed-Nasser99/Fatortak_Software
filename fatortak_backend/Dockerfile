# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY fatortak/fatortak.csproj fatortak/
RUN dotnet restore fatortak/fatortak.csproj

COPY fatortak/ fatortak/
RUN dotnet publish fatortak/fatortak.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

RUN mkdir -p /app/App_Data/Keys /app/wwwroot/uploads \
    && chown -R app:app /app

COPY --from=build --chown=app:app /app/publish .

USER app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "fatortak.dll"]
