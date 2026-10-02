import os
import sys
import time
from datetime import datetime

# Resolve parent directory in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import run_analytics

HOURLY_INTERVAL_SECONDS = 3600


def start_scheduler():
    print("=" * 60)
    print("   MegaMart PySpark Analytics 1-Hour Automated Scheduler   ")
    print("=" * 60)
    print(f"[*] Scheduler started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"[*] Analytics pipeline will execute every {HOURLY_INTERVAL_SECONDS // 60} minutes.")

    run_count = 0
    while True:
        run_count += 1
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"\n[RUN] Starting Scheduled Analytics Run #{run_count} at {current_time}...")
        
        try:
            run_analytics()
            print(f"[SUCCESS] Scheduled Analytics Run #{run_count} completed successfully.")
        except Exception as e:
            print(f"[FAILED] Scheduled Analytics Run #{run_count} encountered an error: {e}")

        next_run_time = datetime.fromtimestamp(time.time() + HOURLY_INTERVAL_SECONDS).strftime("%Y-%m-%d %H:%M:%S")
        print(f"[WAIT] Waiting for 1 hour. Next run scheduled at: {next_run_time}\n")
        time.sleep(HOURLY_INTERVAL_SECONDS)


if __name__ == "__main__":
    start_scheduler()
