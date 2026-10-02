from config.db_connection import DbConnection


class Users:
    def create_user_model(self):
        db_conn = DbConnection()
        spark = db_conn.get_spark_session()

        # Read data from MySQL
        df = spark.read.jdbc(
            url=db_conn.mysql_url,
            table="users",
            properties=db_conn.db_properties
        )
        user_df = df.drop("password").filter((df["role"] == "USER") & (df["is_verified"] == True))
        return user_df
