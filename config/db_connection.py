import os
import sys
from dotenv import load_dotenv
from pyspark.sql import SparkSession

# Load environment variables from .env file
load_dotenv()

# Ensure PySpark workers use the active Python executable on Windows
os.environ["PYSPARK_PYTHON"] = sys.executable
os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable

# Set HADOOP_HOME on Windows if winutils is installed
winutils_dir = os.environ.get("WINUTILS_DIR")
if os.name == "nt" and "HADOOP_HOME" not in os.environ and winutils_dir and os.path.exists(winutils_dir):
    os.environ["HADOOP_HOME"] = winutils_dir
    os.environ["PATH"] += os.pathsep + os.path.join(winutils_dir, "bin")


class DbConnection:

    def __init__(self):
        # Strictly load all database configuration from environment variables (.env)
        self.db_host = os.environ.get("DB_HOST")
        self.db_port = os.environ.get("DB_PORT")
        self.db_name = os.environ.get("DB_NAME")
        self.analytics_db_name = os.environ.get("ANALYTICS_DB_NAME")
        self.db_user = os.environ.get("DB_USERNAME")
        self.db_password = os.environ.get("DB_PASSWORD")

        # Validate that required environment variables are set
        missing_vars = [var_name for var_name, val in [
            ("DB_HOST", self.db_host),
            ("DB_PORT", self.db_port),
            ("DB_NAME", self.db_name),
            ("ANALYTICS_DB_NAME", self.analytics_db_name),
            ("DB_USERNAME", self.db_user),
            ("DB_PASSWORD", self.db_password)
        ] if val is None]

        if missing_vars:
            raise ValueError(f"Missing required database environment variable(s) in .env: {', '.join(missing_vars)}")

        self.mysql_url = f"jdbc:mysql://{self.db_host}:{self.db_port}/{self.db_name}?allowPublicKeyRetrieval=true&useSSL=false"
        self.analytics_mysql_url = f"jdbc:mysql://{self.db_host}:{self.db_port}/{self.analytics_db_name}?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true&useSSL=false"

        self.db_properties = {
            "user": self.db_user,
            "password": self.db_password,
            "driver": "com.mysql.cj.jdbc.Driver"
        }

    def get_spark_session(self):
        """Creates and returns the Spark Session."""
        jar_path = os.environ.get("MYSQL_JAR_PATH", "")

        builder = SparkSession.builder \
            .appName("PySpark-MySQL-Integration") \
            .config("spark.driver.host", "127.0.0.1") \
            .config("spark.driver.bindAddress", "127.0.0.1")

        if jar_path and os.path.exists(jar_path):
            builder = builder.config("spark.driver.extraClassPath", jar_path)
        else:
            builder = builder.config("spark.jars.packages", "com.mysql:mysql-connector-j:8.3.0")

        return builder.getOrCreate()

    def write_to_analytics_db(self, df, table_name, mode="overwrite"):
        """Persists PySpark DataFrame into the MySQL Analytics Database (analytics_db) and buildpro_db."""
        # 1. Write to dedicated analytics_db
        df.write.jdbc(
            url=self.analytics_mysql_url,
            table=table_name,
            mode=mode,
            properties=self.db_properties
        )
        print(f"[+] Successfully written analytics data to table '{table_name}' in '{self.analytics_db_name}'.")

        # 2. Write to primary buildpro_db for Spring Boot JPA access
        try:
            df.write.jdbc(
                url=self.mysql_url,
                table=table_name,
                mode=mode,
                properties=self.db_properties
            )
            print(f"[+] Successfully synced analytics data to table '{table_name}' in '{self.db_name}'.")
        except Exception as e:
            print(f"[!] Info: Sync to {self.db_name} note: {e}")


