import sys
import os

# Ensure package imports resolve when executing directly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime
from analytics.user_activity import UserActivity
from analytics.product_analysis import Product_Analysis
from config.db_connection import DbConnection


def log_pipeline_run(spark, db_conn, pipeline_name, status, records_processed, start_time, end_time, error_message=None):
    """Records pipeline execution metrics into analytics_pipeline_runs table in analytics_db."""
    try:
        run_data = [(
            pipeline_name,
            status,
            int(records_processed) if records_processed else 0,
            start_time.strftime("%Y-%m-%d %H:%M:%S"),
            end_time.strftime("%Y-%m-%d %H:%M:%S"),
            str(error_message) if error_message else None
        )]
        schema = "pipeline_name string, status string, records_processed long, start_time string, end_time string, error_message string"
        df = spark.createDataFrame(run_data, schema)
        db_conn.write_to_analytics_db(df, "analytics_pipeline_runs", mode="append")
    except Exception as e:
        print(f"[!] Warning: Could not log pipeline run metadata: {e}")


def run_analytics():
    print("=" * 60)
    print("   BuildPro PySpark Data Analytics Subsystem Engine   ")
    print("=" * 60)

    db_conn = DbConnection()
    spark = db_conn.get_spark_session()

    # 1. Run User Activity & Category Preferences Pipeline
    print("\n[+] Running User Category Preferences Analytics Pipeline...")
    start_time = datetime.now()
    try:
        user_activity = UserActivity()
        pref_df = user_activity.save_user_category_preferences(mode="overwrite")
        end_time = datetime.now()
        count = pref_df.count()
        pref_df.show()
        log_pipeline_run(spark, db_conn, "UserCategoryPreferences", "SUCCESS", count, start_time, end_time)
        print(f"[SUCCESS] Completed User Category Preferences pipeline ({count} records written).")
    except Exception as e:
        end_time = datetime.now()
        print(f"[FAILED] User Category Preferences pipeline error: {e}")
        log_pipeline_run(spark, db_conn, "UserCategoryPreferences", "FAILED", 0, start_time, end_time, error_message=str(e))

    # 2. Run Product Trending Analytics Pipeline
    print("\n[+] Running Product Trending Analytics Pipeline...")
    start_time = datetime.now()
    try:
        product_analysis = Product_Analysis()
        trending_df = product_analysis.most_trending_products()
        trending_df.show()
        end_time = datetime.now()
        count = trending_df.count()
        log_pipeline_run(spark, db_conn, "ProductTrendingAnalytics", "SUCCESS", count, start_time, end_time)
        print(f"[SUCCESS] Completed Product Trending Analytics pipeline ({count} records written).")
    except Exception as e:
        end_time = datetime.now()
        print(f"[FAILED] Product Trending Analytics pipeline error: {e}")
        log_pipeline_run(spark, db_conn, "ProductTrendingAnalytics", "FAILED", 0, start_time, end_time, error_message=str(e))


if __name__ == "__main__":
    run_analytics()

