# Postgres in IDX

<a href="https://idx.google.com/import?url=https://github.com/davideast/idx-postgres-setup">
  <img height="32" alt="Try in IDX" src="https://cdn.idx.dev/btn/try_dark_32.svg">
</a>

## Connect Locally
Postgres is set up locally but runs on port 5432 by default, which will interfere with Cloud SQL. If you're not using Cloud SQL you can ignore the steps below.

### Update the postgresql.conf file

```bash
sed -i 's/#port = 5432/port = 5433/' .idx/.data/postgres/postgresql.conf
```

### Rebuild the Environment for the changes to take effect

Open the Command Palette `CMD/CTRL+SHIFT+P` and type Project IDX: Rebuild Environment. Hit enter.

### Run the script

```bash
node --env-file=.env.local index.js
```

## Connect to Cloud SQL Postgres

**Note:** Billing must be enabled to use Cloud SQL.

### Authenticate with Google Cloud CLI

```bash
gcloud auth application-default login
```

### Set the Project ID

```bash
gcloud config set project <project-id>
```

### Create an instance if not done already
**Note:** You may need to enable the SQL Admin API. However, it will prompt you to do and continue the instance creation.

```bash
gcloud sql instances create cloud \
            --database-version=POSTGRES_15 --cpu=2 --memory=4GB \
            --region=us-central1 --root-password=something-secure
```

### Create a user

```bash
gcloud sql users create main --instance cloud --password a-secure-password --host=%
```

### Update the .env.cloud config file

```
DB_USER="main"
DB_PASSWORD="a-secure-password"
DB_NAME="postgres"
DB_INSTANCE_NAME="<project-id>:us-central1:cloud"
MODE="cloud-connected"
```

### Run the Cloud SQL Proxy
Open up a new terminal:

```bash
source .env.cloud
cloud-sql-proxy $DB_INSTANCE_NAME
```

### Seed the database
Open up another terminal:

```bash
source .env.cloud
psql "host=127.0.0.1 port=5432 sslmode=disable dbname=$DB_NAME user=$DB_USER password=$DB_PASSWORD" -f create.sql
```

### Run the script

```bash
node --env-file=.env.cloud index.js
```
