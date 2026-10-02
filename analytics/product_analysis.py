import os
import sys

# Resolve parent directory in sys.path for direct script execution
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from pyspark.sql.functions import col, count, desc, sum, row_number
from pyspark.sql.window import Window
from entities.products import Products 
from entities.cart_items import CartItems
from entities.order_items import OrderItems

from pyspark.sql import SparkSession

class Product_Analysis:
    def __init__(self):
        product = Products()
        self.product_df = product.create_product_model()

        cart_items = CartItems()
        self.cart_items_df = cart_items.create_cart_items_model()

        order_items = OrderItems()
        self.order_items_df = order_items.create_order_items_model()

    def most_trending_products(self):
        #select product_id, count(product_id) as no_of_products from cart_items group by product_id order by no_of_products desc limit 1;
        self.trending_products = self.cart_items_df.groupBy("product_id") \
            .agg(count("product_id").alias("no_of_products")) \
            .orderBy(desc("no_of_products"))
        self.trending_products.show()
        return self.trending_products

    def most_ordered_product(self):
        #select product_id, sum(quantity) as total_quantity from cart_items group by product_id order by total_quantity desc;
        self.ordered_products = self.cart_items_df.groupBy("product_id") \
            .agg(sum("quantity").alias("total_quantity")) \
            .orderBy(desc("total_quantity"))
        self.ordered_products.show()
        return self.ordered_products

    def frequent_bought_together(self):
        '''
        Finds the top co-purchased item for every product across all orders.

        SQL Query Equivalent:
        WITH product_pairs AS (
            SELECT 
                o1.product_id AS product_id,
                o2.product_id AS bought_together_product_id,
                COUNT(o1.order_id) AS times_bought_together
            FROM order_items o1
            JOIN order_items o2 
              ON o1.order_id = o2.order_id 
             AND o1.product_id <> o2.product_id
            GROUP BY o1.product_id, o2.product_id
        ),
        ranked_pairs AS (
            SELECT 
                product_id,
                bought_together_product_id,
                times_bought_together,
                ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY times_bought_together DESC) AS rnk
            FROM product_pairs
        )
        SELECT product_id, bought_together_product_id, times_bought_together
        FROM ranked_pairs
        WHERE rnk = 1
        ORDER BY product_id;
        '''
        o1 = self.order_items_df.alias("o1")
        o2 = self.order_items_df.alias("o2")

        # Self-join order_items on order_id to find distinct co-purchased product pairs
        pairs_df = o1.join(
            o2,
            (col("o1.order_id") == col("o2.order_id")) & (col("o1.product_id") != col("o2.product_id"))
        ).groupBy(
            col("o1.product_id").alias("product_id"),
            col("o2.product_id").alias("bought_together_product_id")
        ).agg(
            count("o1.order_id").alias("times_bought_together")
        )
        
        # Window specification to rank top co-purchased item for each product_id
        window_spec = Window.partitionBy("product_id").orderBy(desc("times_bought_together"))

        self.frequently_bought_together_df = pairs_df.withColumn("rank", row_number().over(window_spec)) \
            .filter(col("rank") == 1) \
            .drop("rank") \
            .orderBy("product_id")
        self.frequently_bought_together_df.show()
        return self.frequently_bought_together_df

        


if __name__ == "__main__":
    product_analysis = Product_Analysis()
    # product_analysis.most_ordered_product().show()
    # product_analysis.most_trending_products().show()
    product_analysis.frequent_bought_together().show()