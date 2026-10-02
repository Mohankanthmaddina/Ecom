from config.db_connection import DbConnection


class CartItems:
    def create_cart_items_model(self):
        db_conn = DbConnection()
        spark = db_conn.get_spark_session()

        # Read data from MySQL
        df = spark.read.jdbc(
            url=db_conn.mysql_url,
            table="cart_items",
            properties=db_conn.db_properties
        )
        return df
