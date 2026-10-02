from config.db_connection import DbConnection


class Products:
    def create_product_model(self):
        db_conn = DbConnection()
        spark = db_conn.get_spark_session()

        # Read data from MySQL
        df = spark.read.jdbc(
            url=db_conn.mysql_url,
            table="products",
            properties=db_conn.db_properties
        )
        return df
