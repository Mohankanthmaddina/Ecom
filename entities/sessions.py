from config.db_connection import DbConnection


class Sessions:
    def create_sessions_model(self):
        db_conn = DbConnection()
        spark = db_conn.get_spark_session()

        # Read data from MySQL
        df = spark.read.jdbc(
            url=db_conn.mysql_url,
            table="refresh_tokens",
            properties=db_conn.db_properties
        )
        return df
