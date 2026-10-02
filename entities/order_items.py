from config.db_connection import DbConnection


class OrderItems:
    def create_order_items_model(self):
        db_conn = DbConnection()
        spark = db_conn.get_spark_session()

        # Read data from MySQL
        order_items_df = spark.read.jdbc(
            url=db_conn.mysql_url,
            table="order_items",
            properties=db_conn.db_properties
        )
        return order_items_df
