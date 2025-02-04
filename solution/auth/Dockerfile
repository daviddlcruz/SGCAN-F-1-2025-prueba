FROM mcr.microsoft.com/dotnet/sdk:6.0 AS dev
WORKDIR /app

RUN dotnet tool install -g dotnet-ef --version 6.0.26 \
    && export PATH="$PATH:/root/.dotnet/tools"

RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

COPY ./src/*.csproj ./src/
RUN dotnet restore ./src/auth.csproj

COPY ./src ./src

WORKDIR /app/src
EXPOSE 5001

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
#ENTRYPOINT ["dotnet", "watch", "run", "--urls=http://0.0.0.0:5001"]